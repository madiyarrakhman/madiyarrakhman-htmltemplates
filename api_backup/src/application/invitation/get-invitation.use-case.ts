import type { IInvitationRepository } from '../../domain/invitation/Invitation.types.js';

export class GetInvitationUseCase {
    constructor(private invitationRepo: IInvitationRepository) { }

    async execute(uuid: string) {
        if (!uuid || uuid.trim().length === 0) {
            throw new Error('UUID is required');
        }

        const invitation = await this.invitationRepo.findByUuid(uuid);

        if (!invitation) {
            throw new Error('Invitation not found');
        }

        return invitation;
    }
}
