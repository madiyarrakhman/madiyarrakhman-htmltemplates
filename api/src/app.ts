import express from 'express';
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
// From api/dist/server.js up to api/ up to root/
const rootDir = path.join(__dirname, '../../');

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:"],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
        },
    },
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(rootDir));

// 1. Setup Infrastructure
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

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
app.get('/s/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    try {
        const result = await pool.query('SELECT uuid FROM invitations WHERE short_code = $1', [shortCode]);
        if (result.rows.length === 0) {
            return res.status(404).sendFile(path.join(rootDir, '404.html'));
        }
        res.redirect(`/i/${result.rows[0].uuid}`);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// Invitation Page Routing
app.get('/i/:uuid', async (req, res) => {
    const { uuid } = req.params;
    try {
        const result = await pool.query('SELECT template_code FROM invitations WHERE uuid = $1', [uuid]);
        if (result.rows.length === 0) {
            return res.status(404).sendFile(path.join(rootDir, '404.html'));
        }

        const template = result.rows[0].template_code;
        let fileName = 'wedding-invitation.html';

        if (template === 'silk-ivory') {
            fileName = 'wedding-silk-ivory.html';
        }

        res.sendFile(path.join(rootDir, fileName));
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// Admin Pages
app.get('/admin', (req, res) => res.sendFile(path.join(rootDir, 'admin.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(rootDir, 'admin-login.html')));

// Frontend Config
app.get('/config.js', (req, res) => {
    const publicKey = process.env.FRONTEND_PUBLIC_KEY || process.env.PUBLIC_API_KEY || 'no-key';
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`const API_CONFIG = { PUBLIC_API_KEY: '${publicKey}', API_URL: window.location.origin + '/api' };`);
});

// Root & Fallback
app.get('/', (req, res) => res.sendFile(path.join(rootDir, 'landing.html')));
app.get('*', (req, res) => res.status(404).sendFile(path.join(rootDir, '404.html')));

// Export for server
export { app };
