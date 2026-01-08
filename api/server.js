const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting (needed on DigitalOcean)
app.set('trust proxy', 1);

// Security: Enforce JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'super-secret-wedding-key')) {
    console.error('FATAL ERROR: JWT_SECRET must be set correctly in production!');
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-wedding-key';

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cookieParser());

// Rate Limiting - General API
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    message: { error: 'Too many requests, please try again later.' }
});

// Stricter Rate Limiting - Login (Prevent Brute Force)
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 attempts per hour
    message: { error: 'Too many login attempts. Please try again in an hour.' }
});

app.use('/api/', generalLimiter);

// Standard Middleware
app.use(cors());
app.use(express.json({ limit: '50kb' })); // Protection against large Payload DoS
app.use(express.static(path.join(__dirname, '../')));

// Validation Utility (Simple XSS protection)
const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[<>]/g, '');
};

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000, // 10 seconds timeout
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

// Admin Auth Middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.cookies.admin_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Initialize database tables
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS templates (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT true
            );
        `);
        await pool.query(`
            INSERT INTO templates (code, name) 
            VALUES ('starry-night', 'Звездная ночь') 
            ON CONFLICT (code) DO NOTHING;
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS invitations (
                id SERIAL PRIMARY KEY,
                uuid UUID UNIQUE DEFAULT gen_random_uuid(),
                phone_number VARCHAR(50) NOT NULL,
                template_code VARCHAR(50) REFERENCES templates(code),
                lang VARCHAR(10) DEFAULT 'ru',
                content JSONB NOT NULL, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rsvp_responses (
                id SERIAL PRIMARY KEY,
                invitation_uuid UUID REFERENCES invitations(uuid),
                guest_name VARCHAR(255),
                attendance VARCHAR(10) NOT NULL,
                guest_count INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Database tables initialized');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
};

initDB();

// --- ADMIN API ---

// Admin Login
app.post('/api/admin/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) return res.status(400).json({ error: 'Credentials required' });

    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUser && password === adminPass) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
        res.cookie('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.json({ success: true, token });
    }

    res.status(401).json({ error: 'Invalid credentials' });
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
});

// Get All Invitations with Stats
app.get('/api/admin/invitations', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT i.*, 
                   COUNT(r.id) as rsvp_count,
                   SUM(CASE WHEN r.attendance = 'yes' THEN r.guest_count ELSE 0 END) as approved_guests
            FROM invitations i
            LEFT JOIN rsvp_responses r ON i.uuid = r.invitation_uuid
            GROUP BY i.id
            ORDER BY i.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get Stats for Dashboard
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_invitations,
                (SELECT COUNT(*) FROM rsvp_responses) as total_rsvps,
                (SELECT SUM(guest_count) FROM rsvp_responses WHERE attendance = 'yes') as total_guests
            FROM invitations
        `);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Admin Create Invitation
app.post('/api/admin/invitations', authenticateAdmin, async (req, res) => {
    let { phoneNumber, templateCode, lang, content } = req.body;
    if (!phoneNumber || !content) return res.status(400).json({ error: 'Missing fields' });

    // Sanitize basic fields
    phoneNumber = sanitize(phoneNumber);
    lang = sanitize(lang);

    try {
        const result = await pool.query(
            `INSERT INTO invitations (phone_number, template_code, lang, content) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [phoneNumber, templateCode || 'starry-night', lang || 'ru', JSON.stringify(content)]
        );
        res.status(201).json({ success: true, invitation: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create' });
    }
});

// --- PUBLIC API ---

// Create Invitation (System/API Key)
app.post('/api/invitations', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.PRIVATE_API_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    let { phoneNumber, templateCode, lang, content } = req.body;
    if (!phoneNumber || !content) return res.status(400).json({ error: 'Missing fields' });

    phoneNumber = sanitize(phoneNumber);

    try {
        const result = await pool.query(
            `INSERT INTO invitations (phone_number, template_code, lang, content) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [phoneNumber, templateCode || 'starry-night', lang || 'ru', JSON.stringify(content)]
        );
        res.status(201).json({ success: true, invitation: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create' });
    }
});

// Get Invitation Data
app.get('/api/invitations/:uuid', async (req, res) => {
    const { uuid } = req.params;
    try {
        const result = await pool.query(`SELECT * FROM invitations WHERE uuid = $1`, [uuid]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Submit RSVP
app.post('/api/rsvp/:uuid', async (req, res) => {
    const { uuid } = req.params;
    let { guestName, attendance, guestCount } = req.body;

    // Sanitize guest name to prevent XSS in admin panel
    guestName = sanitize(guestName);

    try {
        await pool.query(
            `INSERT INTO rsvp_responses (invitation_uuid, guest_name, attendance, guest_count)
             VALUES ($1, $2, $3, $4)`,
            [uuid, guestName, attendance, attendance === 'yes' ? guestCount : 0]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save' });
    }
});

// Config Endpoint
app.get('/config.js', (req, res) => {
    const publicKey = process.env.FRONTEND_PUBLIC_KEY || process.env.PUBLIC_API_KEY || 'no-key';
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`const API_CONFIG = { PUBLIC_API_KEY: '${publicKey}', API_URL: window.location.origin + '/api' };`);
});

// Root API info
app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Wedding Platform API is running 🚀'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Wedding Platform API is running 🚀' });
});

// Frontend Routing
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../admin.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, '../admin-login.html')));
app.get('/i/:uuid', (req, res) => res.sendFile(path.join(__dirname, '../wedding-invitation.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../wedding-invitation.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../wedding-invitation.html')));

if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Platform running on port ${PORT}`));
}

module.exports = { app, pool };
