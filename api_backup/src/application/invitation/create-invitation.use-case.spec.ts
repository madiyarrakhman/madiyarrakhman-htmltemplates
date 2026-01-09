import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { CreateInvitationUseCase } from './create-invitation.use-case.js';

describe('CreateInvitationUseCase', () => {
    let createInvitationUseCase: CreateInvitationUseCase;
    let mockInvitationRepo: any;

    beforeEach(() => {
        mockInvitationRepo = {
            save: jest.fn()
        };
        createInvitationUseCase = new CreateInvitationUseCase(mockInvitationRepo);
    });

    it('should throw an error if groom name is missing', async () => {
        const data = {
            phoneNumber: '+77011234567',
            templateCode: 'classic-dark',
            lang: 'ru',
            groomName: '',
            brideName: 'Aruzhan',
            eventDate: new Date(),
            eventLocation: 'Astana'
        };

        await expect(createInvitationUseCase.execute(data)).rejects.toThrow('Groom name is required');
    });

    it('should save invitation successfully and return uuid', async () => {
        const data = {
            phoneNumber: '+77011234567',
            templateCode: 'classic-dark',
            lang: 'ru',
            groomName: 'Arman',
            brideName: 'Aruzhan',
            eventDate: new Date('2026-06-15'),
            eventLocation: 'Astana'
        };

        const result = await createInvitationUseCase.execute(data);

        expect(result.uuid).toBeDefined();
        expect(mockInvitationRepo.save).toHaveBeenCalled();
    });
});
