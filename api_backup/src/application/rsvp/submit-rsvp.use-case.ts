import type { IInvitationRepository, RSVPEntity, AttendanceStatus } from '../../domain/invitation/Invitation.types.js';

export interface SubmitRSVPDTO {
    invitationUuid: string;
    guestName: string;
    attendance: AttendanceStatus;
    guestCount: number;
}

export class SubmitRSVPUseCase {
    constructor(private invitationRepo: IInvitationRepository) { }

    async execute(data: SubmitRSVPDTO) {
        // 1. Validation
        if (!data.guestName || data.guestName.trim().length === 0) {
            throw new Error('Guest name is required');
        }

        if (data.guestCount < 0) {
            throw new Error('Guest count cannot be negative');
        }

        // 2. Domain Logic: Check if invitation exists
        const invitation = await this.invitationRepo.findByUuid(data.invitationUuid);
        if (!invitation) {
            throw new Error('Invitation not found');
        }

        // 3. Mapping to Entity
        const rsvpEntity: RSVPEntity = {
            guestName: data.guestName,
            attendance: data.attendance,
            guestCount: data.attendance === 'no' ? 0 : data.guestCount
        };

        // 4. Persistence
        await this.invitationRepo.saveRSVP(data.invitationUuid, rsvpEntity);

        return { success: true };
    }
}
