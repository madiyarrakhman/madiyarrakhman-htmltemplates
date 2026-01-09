import express from 'express';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PostgresInvitationRepository } from './infrastructure/database/PostgresInvitationRepository.js';
import { PostgresAdminRepository } from './infrastructure/database/PostgresAdminRepository.js';
import { SubmitRSVPUseCase } from './application/rsvp/submit-rsvp.use-case.js';
import { CreateInvitationUseCase } from './application/invitation/create-invitation.use-case.js';
import { GetInvitationUseCase } from './application/invitation/get-invitation.use-case.js';
import { AdminLoginUseCase } from './application/admin/admin-login.use-case.js';
import { GetAdminInvitationsUseCase, GetAdminStatsUseCase, GetTemplatesUseCase } from './application/admin/admin-views.use-case.js';
import { RSVPController } from './infrastructure/api/controllers/RSVPController.js';
import { InvitationController } from './infrastructure/api/controllers/InvitationController.js';
import { AdminController } from './infrastructure/api/controllers/AdminController.js';
import { authenticateAdmin } from './infrastructure/api/middleware/AuthMiddleware.js';

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Digital Ocean/Heroku)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// From api/src up to api/ up to root/ then frontend
const rootDir = path.resolve(__dirname, '../../frontend/dist');
const isTest = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;
if (!isTest) {
    console.log(`📂 Serving frontend from: ${rootDir}`);
}

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:"],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
            "script-src-attr": ["'unsafe-inline'"],
        },
    },
}));


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

if (!isTest) {
    app.use('/api/', limiter);
}

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(rootDir));

// Настройка БД
const dbUrl = process.env.DATABASE_URL;
const isLocal = !dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

const poolConfig = {
    connectionString: dbUrl,
    ssl: (isLocal || isTest) ? false : { rejectUnauthorized: false }
};

const pool = new Pool(poolConfig);

if (!isLocal && !isTest) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

if (!isTest) {
    if (!dbUrl) console.warn('⚠️ WARNING: DATABASE_URL is not defined!');
    console.log(`📡 Database Mode: ${isLocal ? 'Local/Test' : 'Production'}`);
    console.log(`📡 Database SSL: ${poolConfig.ssl ? 'Enabled' : 'Disabled'}`);
}

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// Immediate connection check
if (!isTest) {
    pool.query('SELECT NOW()')
        .then(() => console.log('✅ Database Connection: SUCCESS'))
        .catch(err => {
            console.error('❌ Database Connection: FAILED');
            console.error('Error Details:', err.message);
        });
}

const invitationRepo = new PostgresInvitationRepository(pool);
const adminRepo = new PostgresAdminRepository(pool);

// 2. Setup Application Logic
const jwtSecret = process.env.JWT_SECRET || 'super-secret-wedding-key';
const adminUser = process.env.ADMIN_USERNAME || 'admin';
const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

const submitRSVPUseCase = new SubmitRSVPUseCase(invitationRepo);
const createInvitationUseCase = new CreateInvitationUseCase(invitationRepo);
const getInvitationUseCase = new GetInvitationUseCase(invitationRepo);
const adminLoginUseCase = new AdminLoginUseCase(adminUser, adminPass, jwtSecret);
const getAdminInvitationsUseCase = new GetAdminInvitationsUseCase(adminRepo);
const getAdminStatsUseCase = new GetAdminStatsUseCase(adminRepo);
const getTemplatesUseCase = new GetTemplatesUseCase(adminRepo);

// 3. Setup Controllers
const rsvpController = new RSVPController(submitRSVPUseCase);
const invitationController = new InvitationController(createInvitationUseCase, getInvitationUseCase);
const adminController = new AdminController(adminLoginUseCase, getAdminInvitationsUseCase, getAdminStatsUseCase, getTemplatesUseCase);

// 4. Routes
// Public API
app.get('/api/invitations/:uuid', (req, res) => invitationController.getOne(req, res));
app.post('/api/rsvp/:uuid', (req, res) => rsvpController.handle(req, res));
app.post('/api/invitations', (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.PRIVATE_API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    return invitationController.create(req, res);
});

// Admin API
const auth = authenticateAdmin(jwtSecret);

app.post('/api/admin/login', (req, res) => adminController.login(req, res));
app.post('/api/admin/logout', (req, res) => adminController.logout(req, res));
app.get('/api/admin/invitations', auth, (req, res) => adminController.getInvitations(req, res));
app.get('/api/admin/stats', auth, (req, res) => adminController.getStats(req, res));
app.get('/api/admin/templates', auth, (req, res) => adminController.getTemplates(req, res));
app.post('/api/admin/invitations', auth, (req, res) => invitationController.create(req, res));

// Health check for DO/Heroku
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- Frontend & Redirects ---

// Short URL Redirect
// Redirects to the invitation page. 
// In development, if accessing via backend (3008), this redirects to /i/..., which falls through to SPA handler below or 404 if not built.
// In production, this works naturally.
app.get('/s/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    try {
        const result = await pool.query('SELECT uuid FROM invitations WHERE short_code = $1', [shortCode]);
        if (result.rows.length === 0) {
            // Serve 404 or JSON error
            return res.status(404).send('Short link not found');
        }
        res.redirect(`/i/${result.rows[0].uuid}`);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// SPA Fallback
// For any request not handled above (API, static assets, shortlink), serve index.html
// and let Vue Router handle the routing.
app.get('*', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'), (err) => {
        if (err) {
            console.error('❌ Error sending index.html:', err.message);
            res.status(404).send('Frontend not found. Make sure you have built the frontend.');
        }
    });
});

// Export for server and tests
export { app, pool };
