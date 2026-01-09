import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import request from 'supertest';
import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('API Integration Tests', () => {
    let container: StartedPostgreSqlContainer;
    let app: any;
    let pool: any;

    beforeAll(async () => {
        container = await new PostgreSqlContainer("postgres:15-alpine")
            .withDatabase("wedding_test")
            .withUsername("postgres")
            .withPassword("postgres")
            .start();

        process.env.DATABASE_URL = container.getConnectionUri();
        process.env.NODE_ENV = 'test';

        // Load migrations
        const migrationsDir = path.resolve(__dirname, '../../../../migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        // Dynamic import after setting environment variables
        const mod = await import('../../app.js');
        app = mod.app;
        pool = mod.pool;

        // Apply migrations
        for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            // Split by semicolon if there are multiple statements, or just execute as block
            // Postgres pool.query can execute multiple statements in one block
            await pool.query(sql);
        }
    }, 60000);

    afterAll(async () => {
        if (pool) await pool.end();
        if (container) await container.stop();
    });

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

    it('should login as admin', async () => {
        const response = await request(app)
            .post('/api/admin/login')
            .send({
                username: process.env.ADMIN_USERNAME || 'admin',
                password: process.env.ADMIN_PASSWORD || 'admin123'
            });

        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });
});
