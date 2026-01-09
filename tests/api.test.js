const request = require('supertest');
const { app, pool } = require('../api/server');
const { exec } = require('child_process');
const path = require('path');

describe('Wedding Platform Full Integration Tests', () => {
    let adminToken;

    beforeAll(async () => {
        // Run migrations before tests
        return new Promise((resolve, reject) => {
            exec(`node ${path.join(__dirname, '../api/migrate.js')}`, (error, stdout, stderr) => {
                if (error) {
                    console.error('Migration error:', stderr);
                    reject(error);
                } else {
                    console.log('Migrations completed for tests');
                    resolve();
                }
            });
        });
    });

    afterAll(async () => {
        // Cleanup: remove test records
        await pool.query('DELETE FROM rsvp_responses');
        await pool.query('DELETE FROM invitations');
        await pool.end();
    });

    describe('🔐 Security & Headers', () => {
        it('should have security headers (Helmet)', async () => {
            const res = await request(app).get('/api/health');
            expect(res.headers['x-dns-prefetch-control']).toBeDefined();
            expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
        });

        it('should block large payloads (DoS protection)', async () => {
            const largeData = 'a'.repeat(60 * 1024); // 60KB (limit is 50KB)
            const res = await request(app)
                .post('/api/admin/login')
                .send({ username: 'a', password: largeData });
            expect(res.statusCode).toEqual(413); // Payload Too Large
        });
    });

    describe('👤 Admin Authentication', () => {
        it('should fail login with wrong credentials', async () => {
            const res = await request(app)
                .post('/api/admin/login')
                .send({ username: 'admin', password: 'wrong_password' });
            expect(res.statusCode).toEqual(401);
        });

        it('should login successfully and return a cookie', async () => {
            const adminUser = process.env.ADMIN_USERNAME || 'admin';
            const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

            const res = await request(app)
                .post('/api/admin/login')
                .send({ username: adminUser, password: adminPass });

            expect(res.statusCode).toEqual(200);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toContain('admin_token');
            adminToken = res.body.token;
        });
    });

    describe('✉️ Invitation Management', () => {
        it('should create an invitation via Admin API (Auth Required)', async () => {
            const res = await request(app)
                .post('/api/admin/invitations')
                .set('Cookie', [`admin_token=${adminToken}`])
                .send({
                    phoneNumber: '+7700TEST',
                    lang: 'ru',
                    groomName: 'AdminGroom',
                    brideName: 'AdminBride',
                    eventDate: '2026-06-15',
                    eventLocation: 'Admin Hall',
                    content: { story: 'Our story' }
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.invitation.groom_name).toBe('AdminGroom');
        });

        it('should create an invitation via Public API (Key Required)', async () => {
            const res = await request(app)
                .post('/api/invitations')
                .set('x-api-key', process.env.PRIVATE_API_KEY || 'sk_local_admin_key')
                .send({
                    phoneNumber: '+7700PUBLIC',
                    groomName: 'PublicGroom',
                    brideName: 'PublicBride',
                    eventDate: '2026-07-20',
                    eventLocation: 'Public Garden'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.invitation.uuid).toBeDefined();
            expect(res.body.fullUrl).toBeDefined();
        });
    });

    describe('📝 RSVP & Data Integrity', () => {
        let inviteUuid;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/admin/invitations')
                .set('Cookie', [`admin_token=${adminToken}`])
                .send({
                    phoneNumber: '1',
                    groomName: 'G',
                    brideName: 'B',
                    eventDate: 'D',
                    eventLocation: 'L'
                });
            inviteUuid = res.body.invitation.uuid;
        });

        it('should submit an RSVP successfully', async () => {
            const res = await request(app)
                .post(`/api/rsvp/${inviteUuid}`)
                .send({
                    guestName: 'John Doe',
                    attendance: 'yes',
                    guestCount: 2
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('🌐 Public Endpoints', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/api/health');
            expect(res.body.status).toBe('ok');
        });
    });
});
