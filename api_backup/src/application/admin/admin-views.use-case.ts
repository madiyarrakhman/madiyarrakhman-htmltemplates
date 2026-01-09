import type { IAdminRepository } from '../../domain/admin/Admin.types.js';

export class GetAdminInvitationsUseCase {
    constructor(private adminRepo: IAdminRepository) { }

    async execute() {
        return await this.adminRepo.getInvitationsList();
    }
}

export class GetAdminStatsUseCase {
    constructor(private adminRepo: IAdminRepository) { }

    async execute() {
        return await this.adminRepo.getStats();
    }
}

export class GetTemplatesUseCase {
    constructor(private adminRepo: IAdminRepository) { }

    async execute() {
        return await this.adminRepo.getTemplates();
    }
}
