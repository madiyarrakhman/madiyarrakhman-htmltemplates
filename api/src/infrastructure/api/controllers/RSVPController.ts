import type { Request, Response } from 'express';
import { SubmitRSVPUseCase } from '../../../application/rsvp/submit-rsvp.use-case.js';

export class RSVPController {
    constructor(private submitRSVPUseCase: SubmitRSVPUseCase) { }

    async handle(req: Request, res: Response) {
        try {
            const { uuid } = req.params;
            if (!uuid) {
                return res.status(400).json({ error: 'Invitation UUID is required' });
            }

            const { guestName, attendance, guestCount } = req.body;

            const result = await this.submitRSVPUseCase.execute({
                invitationUuid: uuid as string,
                guestName,
                attendance,
                guestCount: Number(guestCount)
            });

            return res.status(200).json(result);
        } catch (error: any) {
            if (error.message === 'Invitation not found') {
                return res.status(404).json({ error: error.message });
            }
            return res.status(400).json({ error: error.message });
        }
    }
}
