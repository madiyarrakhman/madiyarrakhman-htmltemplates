const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto'); // For UUID generation
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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
        // Templates Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS templates (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'classic-rose', 'starry-night'
                name VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT true
            );
        `);

        // Insert default template if not exists
        await pool.query(`
            INSERT INTO templates (code, name) 
            VALUES ('starry-night', 'Звездная ночь') 
            ON CONFLICT (code) DO NOTHING;
        `);

        // Invitations Table
        // UUID is the unique link for the guest
        // phone_number links invites to a user
        // content contains all dynamic text (names, dates, location)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS invitations (
                id SERIAL PRIMARY KEY,
                uuid UUID UNIQUE DEFAULT gen_random_uuid(),
                phone_number VARCHAR(50) NOT NULL,
                template_code VARCHAR(50) REFERENCES templates(code),
                lang VARCHAR(10) DEFAULT 'ru', -- 'ru', 'kk', 'en'
                content JSONB NOT NULL, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // RSVP Responses (linked to invitation)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rsvp_responses (
                id SERIAL PRIMARY KEY,
                invitation_uuid UUID REFERENCES invitations(uuid),
                guest_name VARCHAR(255),
                attendance VARCHAR(10) NOT NULL, -- 'yes', 'no'
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

// 1. Create Invitation (POST /api/invitations)
// Creates a new link for a specific phone number
app.post('/api/invitations', async (req, res) => {
    // Auth check should be here (simple key check for now)
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

// 2. Get Invitation Data (GET /api/invitations/:uuid)
// Public endpoint for rendering the page
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

// 3. Update Invitation (PUT /api/invitations/:uuid)
// Change names, date, location etc.
app.put('/api/invitations/:uuid', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.PRIVATE_API_KEY) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    const { uuid } = req.params;
    const { content, lang, templateCode } = req.body;

    try {
        // We use COALESCE to keep existing values if new ones specifically null/undefined
        // But for JSONB 'content', we'll merge or replace. Here we replace.
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

// 4. Submit RSVP (POST /api/rsvp/:uuid)
app.post('/api/rsvp/:uuid', async (req, res) => {
    const { uuid } = req.params;
    const { guestName, attendance, guestCount } = req.body;

    try {
        // Verify UUID exists first
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

// 5. Config Endpoint (Dynamic)
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Wedding Platform API is running 🚀' });
});


// --- ROUTING FOR FRONTEND ---

// Serve the HTML for specific invitation UUID
// URL will be: domain.com/i/UUID-HERE
app.get('/i/:uuid', (req, res) => {
    res.sendFile(path.join(__dirname, '../wedding-invitation.html'));
});

// Serve main page (maybe redirect to a default demo or landing)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../wedding-invitation.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Platform running on port ${PORT}`);
});

// Catch-all rules
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../wedding-invitation.html'));
});
