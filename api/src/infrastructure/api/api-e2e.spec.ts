import request from 'supertest';
import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { app } from '../../app.js';

describe('API Integration Tests', () => {
    let invitationUuid: string;

    it('should return 404 for non-existent invitation', async () => {
        const response = await request(app).get('/api/invitations/e9712db4-0000-0000-0000-a48923a7e341');
        expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent short link', async () => {
        const response = await request(app).get('/s/NONEXISTENT');
        expect(response.status).toBe(404);
    });

    it('should return 200 for health check', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
    });

    it('should respond to RSVP submission with 404 if invitation not found', async () => {
        const response = await request(app)
            .post('/api/rsvp/e9712db4-0000-0000-0000-a48923a7e341')
            .send({
                guestName: 'Test Guest',
                attendance: 'yes',
                guestCount: 2
            });
        expect(response.status).toBe(404);
    });

    // Test for admin login (default credentials)
    it('should login as admin', async () => {
        const response = await request(app)
            .post('/api/admin/login')
            .send({
                username: 'admin',
                password: 'admin123'
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });
});
