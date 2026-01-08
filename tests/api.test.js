const request = require('supertest');
const { app, pool } = require('../api/server');

describe('Wedding Platform API', () => {

    // Close DB connection after all tests
    afterAll(async () => {
        await pool.end();
    });

    describe('GET /api/health', () => {
        it('should return 200 OK', async () => {
            const res = await request(app).get('/api/health');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'ok');
        });
    });

    describe('Security Checks', () => {
        it('should reject invitation creation without API key', async () => {
            const res = await request(app)
                .post('/api/invitations')
                .send({ phoneNumber: '123' });

            expect(res.statusCode).toEqual(403);
        });

        it('should have security headers (Helmet)', async () => {
            const res = await request(app).get('/api/health');
            expect(res.headers['x-dns-prefetch-control']).toBeDefined();
        });
    });

});
