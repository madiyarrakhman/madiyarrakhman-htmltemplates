import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { GetInvitationUseCase } from './get-invitation.use-case.js';

describe('GetInvitationUseCase', () => {
    let getInvitationUseCase: GetInvitationUseCase;
    let mockInvitationRepo: any;

    beforeEach(() => {
        mockInvitationRepo = {
            findByUuid: jest.fn()
        };
        getInvitationUseCase = new GetInvitationUseCase(mockInvitationRepo);
    });

    it('should throw an error if uuid is missing', async () => {
        await expect(getInvitationUseCase.execute('')).rejects.toThrow('UUID is required');
    });

    it('should throw an error if invitation is not found', async () => {
        mockInvitationRepo.findByUuid.mockResolvedValue(null);
        await expect(getInvitationUseCase.execute('some-uuid')).rejects.toThrow('Invitation not found');
    });

    it('should return invitation data if found', async () => {
        const mockInvitation = {
            uuid: 'some-uuid',
            groomName: 'Arman',
            brideName: 'Aruzhan'
            // ... other fields
        };
        mockInvitationRepo.findByUuid.mockResolvedValue(mockInvitation);

        const result = await getInvitationUseCase.execute('some-uuid');

        expect(result).toEqual(mockInvitation);
    });
});
