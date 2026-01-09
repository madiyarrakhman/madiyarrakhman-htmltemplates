import type { Request, Response } from 'express';
import { AdminLoginUseCase } from '../../../application/admin/admin-login.use-case.js';
import { GetAdminInvitationsUseCase, GetAdminStatsUseCase, GetTemplatesUseCase } from '../../../application/admin/admin-views.use-case.js';

export class AdminController {
    constructor(
        private loginUseCase: AdminLoginUseCase,
        private getInvitationsUseCase: GetAdminInvitationsUseCase,
        private getStatsUseCase: GetAdminStatsUseCase,
        private getTemplatesUseCase: GetTemplatesUseCase
    ) { }

    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            const result = await this.loginUseCase.execute(username, password);

            res.cookie('admin_token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(401).json({ error: error.message });
        }
    }

    async logout(req: Request, res: Response) {
        res.clearCookie('admin_token');
        return res.status(200).json({ success: true });
    }

    async getInvitations(req: Request, res: Response) {
        try {
            const list = await this.getInvitationsUseCase.execute();
            return res.status(200).json(list);
        } catch (error: any) {
            console.error('[AdminController] getInvitations Error:', error);
            return res.status(500).json({ error: 'Failed to fetch invitations', message: error.message });
        }
    }

    async getStats(req: Request, res: Response) {
        try {
            const stats = await this.getStatsUseCase.execute();
            return res.status(200).json(stats);
        } catch (error: any) {
            console.error('[AdminController] getStats Error:', error);
            return res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
        }
    }

    async getTemplates(req: Request, res: Response) {
        try {
            const templates = await this.getTemplatesUseCase.execute();
            return res.status(200).json(templates);
        } catch (error: any) {
            console.error('[AdminController] getTemplates Error:', error);
            return res.status(500).json({ error: 'Database error', message: error.message });
        }
    }
}
