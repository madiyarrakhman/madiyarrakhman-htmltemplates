const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path'); // Add path module
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the ROOT directory (up one level from api/)
// This makes wedding-invitation.html, styles.css, etc. accessible
app.use(express.static(path.join(__dirname, '../')));

// Dynamic Config Endpoint ⚡️
// This allows frontend to get keys without build-time injection
app.get('/config.js', (req, res) => {
    // Prefer FRONTEND_PUBLIC_KEY, fallback to PUBLIC_API_KEY
    const publicKey = process.env.FRONTEND_PUBLIC_KEY || process.env.PUBLIC_API_KEY || 'YOUR_PUBLIC_KEY_HERE';

    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
// API Configuration (Generated Dynamically)
const API_CONFIG = {
    PUBLIC_API_KEY: '${publicKey}',
    API_URL: window.location.origin + '/api'
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
    `);
});

// API Key Authentication Middleware
const authenticatePublicKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key is required. Please provide X-API-Key header.'
        });
    }

    if (apiKey !== process.env.PUBLIC_API_KEY) {
        return res.status(403).json({
            success: false,
            error: 'Invalid API key'
        });
    }

    next();
};

const authenticatePrivateKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'Private API key is required. Please provide X-API-Key header.'
        });
    }

    if (apiKey !== process.env.PRIVATE_API_KEY) {
        return res.status(403).json({
            success: false,
            error: 'Invalid private API key. Admin access required.'
        });
    }

    next();
};

// PostgreSQL connection pool
// Always use SSL for DigitalOcean Managed Databases
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize database table
const initDB = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS rsvp_responses (
            id SERIAL PRIMARY KEY,
            guest_name VARCHAR(255) NOT NULL,
            guest_email VARCHAR(255) NOT NULL,
            guest_phone VARCHAR(50),
            attendance VARCHAR(10) NOT NULL,
            guest_count INTEGER DEFAULT 1,
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createTableQuery);
        console.log('✅ Database table initialized');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
};

// Initialize DB on startup
initDB();

// Root endpoint to verify API is running
app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Wedding RSVP API is running 🚀',
        version: '1.0.0'
    });
});

// Root endpoint for / (in case stripped)
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Wedding RSVP API is running 🚀 (Root)',
        version: '1.0.0'
    });
});

// Root endpoint to verify API is running
app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Wedding RSVP API is running 🚀',
        version: '1.0.0'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Wedding RSVP API is running' });
});

// Get all RSVP responses (for admin) - requires private key
app.get('/api/rsvp', authenticatePrivateKey, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM rsvp_responses ORDER BY created_at DESC'
        );
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching RSVPs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch RSVP responses'
        });
    }
});

// Get RSVP statistics - requires private key
app.get('/api/rsvp/stats', authenticatePrivateKey, async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_responses,
                SUM(CASE WHEN attendance = 'yes' THEN 1 ELSE 0 END) as attending,
                SUM(CASE WHEN attendance = 'no' THEN 1 ELSE 0 END) as not_attending,
                SUM(CASE WHEN attendance = 'yes' THEN guest_count ELSE 0 END) as total_guests
            FROM rsvp_responses;
        `;

        const result = await pool.query(statsQuery);
        res.json({
            success: true,
            stats: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

// Submit RSVP response - requires public key
app.post('/api/rsvp', authenticatePublicKey, async (req, res) => {
    const { name, email, phone, attendance, guestCount, message } = req.body;

    // Validation
    if (!name || !email || !attendance) {
        return res.status(400).json({
            success: false,
            error: 'Name, email, and attendance are required fields'
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
    }

    // Validate attendance value
    if (!['yes', 'no'].includes(attendance)) {
        return res.status(400).json({
            success: false,
            error: 'Attendance must be "yes" or "no"'
        });
    }

    try {
        const insertQuery = `
            INSERT INTO rsvp_responses 
            (guest_name, guest_email, guest_phone, attendance, guest_count, message)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [
            name,
            email,
            phone || null,
            attendance,
            attendance === 'yes' ? (guestCount || 1) : 0,
            message || null
        ];

        const result = await pool.query(insertQuery, values);

        console.log(`✅ New RSVP from ${name} (${attendance})`);

        res.status(201).json({
            success: true,
            message: 'RSVP submitted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error submitting RSVP:', error);

        // Check for duplicate email
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                error: 'An RSVP with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to submit RSVP'
        });
    }
});

// Delete RSVP (for admin) - requires private key
app.delete('/api/rsvp/:id', authenticatePrivateKey, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM rsvp_responses WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'RSVP not found'
            });
        }

        res.json({
            success: true,
            message: 'RSVP deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting RSVP:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete RSVP'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Serve the main HTML file for the root path and any other unhandled paths
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../wedding-invitation.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Serving static files from: ${path.join(__dirname, '../')}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    await pool.end();
    process.exit(0);
});
