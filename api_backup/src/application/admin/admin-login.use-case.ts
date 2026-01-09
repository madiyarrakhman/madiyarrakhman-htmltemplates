import jwt from 'jsonwebtoken';

export class AdminLoginUseCase {
    constructor(
        private adminUser: string,
        private adminPass: string,
        private jwtSecret: string
    ) { }

    async execute(username?: string, password?: string) {
        if (!username || !password) {
            throw new Error('Credentials required');
        }

        if (username === this.adminUser && password === this.adminPass) {
            const token = jwt.sign({ username }, this.jwtSecret, { expiresIn: '24h' });
            return {
                success: true,
                token
            };
        }

        throw new Error('Invalid credentials');
    }
}
