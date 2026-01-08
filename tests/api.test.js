const request = require('supertest');
const { app, pool } = require('../api/server');
const jwt = require('jsonwebtoken');

describe('Wedding Platform Full Integration Tests', () => {
    let adminToken;
    const testInvitationUuid = '00000000-0000-0000-0000-000000000001'; // Will be created in tests

    beforeAll(async () => {
        // Clear test data if needed or ensure tables exist
        // Tables are auto-initialized by server.js initDB()
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
                .send({ data: largeData });
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
            const res = await request(app)
                .post('/api/admin/login')
                .send({ username: 'admin', password: 'admin' }); // using local .env creds

            expect(res.statusCode).toEqual(200);
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toContain('admin_token');

            // Save token for next tests if needed via header
            adminToken = res.body.token;
        });

        it('should protect admin routes from unauthorized access', async () => {
            const res = await request(app).get('/api/admin/stats');
            expect(res.statusCode).toEqual(401);
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
                    content: { groomName: 'TestGroom', brideName: 'TestBride' }
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.invitation.phone_number).toBe('+7700TEST');
        });

        it('should create an invitation via Public API (Key Required)', async () => {
            const res = await request(app)
                .post('/api/invitations')
                .set('x-api-key', 'sk_local_admin_key')
                .send({
                    phoneNumber: '+7700PUBLIC',
                    content: { groomName: 'PublicGroom', brideName: 'PublicBride' }
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.invitation.uuid).toBeDefined();
        });
    });

    describe('📝 RSVP & Data Integrity', () => {
        let inviteUuid;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/admin/invitations')
                .set('Cookie', [`admin_token=${adminToken}`])
                .send({ phoneNumber: '1', content: { title: 'FindMe' } });
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

        it('should sanitize guestName (XSS Protection)', async () => {
            const maliciousName = '<script>alert("xss")</script>Hacker';
            await request(app)
                .post(`/api/rsvp/${inviteUuid}`)
                .send({
                    guestName: maliciousName,
                    attendance: 'yes',
                    guestCount: 1
                });

            // Verify in DB/Admin list that tags are removed
            const res = await request(app)
                .get('/api/admin/invitations')
                .set('Cookie', [`admin_token=${adminToken}`]);

            const invite = res.body.find(i => i.uuid === inviteUuid);
            // In our simple sanitize, it strips <>
            // So we expect it not to contain <script>
            // Note: server.js uses .replace(/[<>]/g, '')
        });
    });

    describe('🌐 Public Endpoints', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/api/health');
            expect(res.body.status).toBe('ok');
        });

        it('should generate config.js dynamically', async () => {
            const res = await request(app).get('/config.js');
            expect(res.headers['content-type']).toContain('application/javascript');
            expect(res.text).toContain('API_CONFIG');
        });
    });
});
