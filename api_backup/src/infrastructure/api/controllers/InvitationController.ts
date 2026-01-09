import type { Request, Response } from 'express';
import { CreateInvitationUseCase } from '../../../application/invitation/create-invitation.use-case.js';
import { GetInvitationUseCase } from '../../../application/invitation/get-invitation.use-case.js';

export class InvitationController {
    constructor(
        private createInvitationUseCase: CreateInvitationUseCase,
        private getInvitationUseCase: GetInvitationUseCase
    ) { }

    async create(req: Request, res: Response) {
        try {
            const {
                phoneNumber,
                templateCode,
                lang,
                groomName,
                brideName,
                eventDate,
                eventLocation,
                content
            } = req.body;

            const result = await this.createInvitationUseCase.execute({
                phoneNumber,
                templateCode,
                lang,
                groomName,
                brideName,
                eventDate: new Date(eventDate),
                eventLocation,
                content
            });

            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async getOne(req: Request, res: Response) {
        try {
            const { uuid } = req.params;
            if (!uuid) {
                return res.status(400).json({ error: 'UUID is required' });
            }

            const invitation = await this.getInvitationUseCase.execute(uuid);
            return res.status(200).json(invitation);
        } catch (error: any) {
            if (error.message === 'Invitation not found') {
                return res.status(404).json({ error: error.message });
            }
            console.error('Invitation Error:', error);
            return res.status(error.code === '22P02' ? 404 : 500).json({ error: 'Internal Server Error' });
        }
    }
}
