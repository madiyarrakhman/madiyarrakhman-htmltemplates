const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // Security Headers
const rateLimit = require('express-rate-limit'); // Denial of Service protection
const crypto = require('crypto'); // For UUID generation
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disabled for simplicity with inline scripts/styles
}));

// Rate Limiting (limit each IP to 100 requests per 15 minutes)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter); // Apply to API routes

// Standard Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the ROOT directory
app.use(express.static(path.join(__dirname, '../')));

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Initialize database tables
const initDB = async () => {
    try {
        // ... Tables initialization code ...
        // Keeping it short for clarity, assuming schema is stable
        // (You can copy the schema creation code from previous steps if needed here, 
        //  but for now I will rely on existing DB or assume it runs once successfully)

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

        console.log('✅ Database tables initialized (Templates, Invitations, RSVP)');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
};

initDB();

// --- API ENDPOINTS ---

// 1. Create Invitation
app.post('/api/invitations', async (req, res) => {
    // Auth check FIRST
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.PRIVATE_API_KEY) {
        return res.status(403).json({ error: 'Admin access required to create invitations' });
    }

    const { phoneNumber, templateCode, lang, content } = req.body;

    if (!phoneNumber || !content) {
        return res.status(400).json({ error: 'Phone number and content are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO invitations (phone_number, template_code, lang, content) 
             VALUES ($1, $2, $3, $4) 
             RETURNING uuid, phone_number, template_code, lang, content`,
            [
                phoneNumber,
                templateCode || 'starry-night',
                lang || 'ru',
                JSON.stringify(content)
            ]
        );

        const invite = result.rows[0];
        const link = `${req.protocol}://${req.get('host')}/i/${invite.uuid}`;

        res.status(201).json({
            success: true,
            link: link,
            invitation: invite
        });
    } catch (error) {
        console.error('Error creating invitation:', error);
        res.status(500).json({ error: 'Failed to create invitation' });
    }
});

// 2. Get Invitation Data
app.get('/api/invitations/:uuid', async (req, res) => {
    const { uuid } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM invitations WHERE uuid = $1`,
            [uuid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching invitation:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// 3. Update Invitation
app.put('/api/invitations/:uuid', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.PRIVATE_API_KEY) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { uuid } = req.params;
    const { content, lang, templateCode } = req.body;

    try {
        const result = await pool.query(
            `UPDATE invitations 
             SET content = $1, lang = $2, template_code = $3, updated_at = CURRENT_TIMESTAMP
             WHERE uuid = $4
             RETURNING *`,
            [JSON.stringify(content), lang, templateCode, uuid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        res.json({ success: true, invitation: result.rows[0] });
    } catch (error) {
        console.error('Error updating invitation:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// 4. Submit RSVP
app.post('/api/rsvp/:uuid', async (req, res) => {
    const { uuid } = req.params;
    const { guestName, attendance, guestCount } = req.body;

    try {
        const check = await pool.query('SELECT uuid FROM invitations WHERE uuid = $1', [uuid]);
        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid invitation link' });
        }

        await pool.query(
            `INSERT INTO rsvp_responses (invitation_uuid, guest_name, attendance, guest_count)
             VALUES ($1, $2, $3, $4)`,
            [uuid, guestName, attendance, attendance === 'yes' ? guestCount : 0]
        );

        res.json({ success: true, message: 'RSVP accepted' });
    } catch (error) {
        console.error('RSVP Error:', error);
        res.status(500).json({ error: 'Failed to save RSVP' });
    }
});

// 5. Config Endpoint
app.get('/config.js', (req, res) => {
    const publicKey = process.env.FRONTEND_PUBLIC_KEY || process.env.PUBLIC_API_KEY || 'no-key';
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        const API_CONFIG = {
            PUBLIC_API_KEY: '${publicKey}',
            API_URL: window.location.origin + '/api'
        };
        if (typeof module !== 'undefined' && module.exports) module.exports = API_CONFIG;
    `);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Wedding Platform API is running 🚀' });
});


// FRONTEND ROUTING

// Serve Invitation Page
app.get('/i/:uuid', (req, res) => {
    res.sendFile(path.join(__dirname, '../wedding-invitation.html'));
});

// Serve Main Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../wedding-invitation.html'));
});

// Catch-all
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../wedding-invitation.html'));
});

// Start Server (Conditional for Tests)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Platform running on port ${PORT}`);
    });
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    await pool.end();
    process.exit(0);
});

// Export
module.exports = { app, pool };
