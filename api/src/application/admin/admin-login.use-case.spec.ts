import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { AdminLoginUseCase } from './admin-login.use-case.js';

describe('AdminLoginUseCase', () => {
    let adminLoginUseCase: AdminLoginUseCase;

    beforeEach(() => {
        adminLoginUseCase = new AdminLoginUseCase('admin', 'password', 'secret');
    });

    it('should throw an error if username or password missing', async () => {
        await expect(adminLoginUseCase.execute('', 'password')).rejects.toThrow('Credentials required');
        await expect(adminLoginUseCase.execute('admin', '')).rejects.toThrow('Credentials required');
    });

    it('should throw an error if invalid credentials', async () => {
        await expect(adminLoginUseCase.execute('wrong', 'pass')).rejects.toThrow('Invalid credentials');
    });

    it('should return a token if valid credentials', async () => {
        const result = await adminLoginUseCase.execute('admin', 'password');
        expect(result.success).toBe(true);
        expect(result.token).toBeDefined();
    });
});
