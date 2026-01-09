import { randomUUID } from 'node:crypto';
import type { IInvitationRepository, InvitationEntity } from '../../domain/invitation/Invitation.types.js';

export interface CreateInvitationDTO {
    phoneNumber: string;
    templateCode: string;
    lang: string;
    groomName: string;
    brideName: string;
    eventDate: Date;
    eventLocation: string;
    content?: string;
}

export class CreateInvitationUseCase {
    constructor(private invitationRepo: IInvitationRepository) { }

    async execute(data: CreateInvitationDTO) {
        // 1. Validation
        if (!data.groomName || data.groomName.trim().length === 0) {
            throw new Error('Groom name is required');
        }
        if (!data.brideName || data.brideName.trim().length === 0) {
            throw new Error('Bride name is required');
        }

        // 2. Domain Logic: Generate identifiers
        const uuid = randomUUID();
        const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const invitation: InvitationEntity = {
            uuid,
            phoneNumber: data.phoneNumber,
            templateCode: data.templateCode,
            lang: data.lang,
            groomName: data.groomName,
            brideName: data.brideName,
            eventDate: data.eventDate,
            eventLocation: data.eventLocation,
            content: data.content,
            shortCode,
            createdAt: new Date()
        };

        // 3. Persistence
        await this.invitationRepo.save(invitation);

        return { uuid, shortCode };
    }
}
