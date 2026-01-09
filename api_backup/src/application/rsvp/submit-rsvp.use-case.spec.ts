import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { SubmitRSVPUseCase } from './submit-rsvp.use-case.js';

describe('SubmitRSVPUseCase', () => {
    let submitRSVPUseCase: any;
    let mockInvitationRepo: any;

    beforeEach(() => {
        mockInvitationRepo = {
            findByUuid: jest.fn(),
            saveRSVP: jest.fn()
        };
        submitRSVPUseCase = new SubmitRSVPUseCase(mockInvitationRepo);
    });

    it('should throw an error if invitation is not found', async () => {
        mockInvitationRepo.findByUuid.mockResolvedValue(null);

        const rsvpData = {
            invitationUuid: 'invalid-uuid',
            guestName: 'John Doe',
            attendance: 'yes' as const,
            guestCount: 2
        };

        await expect(submitRSVPUseCase.execute(rsvpData)).rejects.toThrow('Invitation not found');
    });

    it('should throw an error if guest count is negative', async () => {
        mockInvitationRepo.findByUuid.mockResolvedValue({ uuid: 'valid-uuid' });

        const rsvpData = {
            invitationUuid: 'valid-uuid',
            guestName: 'John Doe',
            attendance: 'yes' as const,
            guestCount: -1
        };

        await expect(submitRSVPUseCase.execute(rsvpData)).rejects.toThrow('Guest count cannot be negative');
    });

    it('should save RSVP successfully', async () => {
        mockInvitationRepo.findByUuid.mockResolvedValue({ uuid: 'valid-uuid' });

        const rsvpData = {
            invitationUuid: 'valid-uuid',
            guestName: 'John Doe',
            attendance: 'yes' as const,
            guestCount: 2
        };

        const result = await submitRSVPUseCase.execute(rsvpData);

        expect(result.success).toBe(true);
        expect(mockInvitationRepo.saveRSVP).toHaveBeenCalledWith('valid-uuid', expect.objectContaining({
            guestName: 'John Doe',
            attendance: 'yes',
            guestCount: 2
        }));
    });
});
