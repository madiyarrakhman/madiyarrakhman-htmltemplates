export interface AdminStatsEntity {
    totalInvitations: number;
    totalRSVPs: number;
    totalGuests: number;
}

export interface AdminInvitationListItemEntity {
    uuid: string;
    phoneNumber: string;
    templateCode: string;
    templateName: string;
    lang: string;
    groomName: string;
    brideName: string;
    eventDate: Date;
    eventLocation: string;
    rsvpCount: number;
    approvedGuests: number;
    shortCode?: string;
    createdAt: Date;
}

export interface IAdminRepository {
    getInvitationsList(): Promise<AdminInvitationListItemEntity[]>;
    getStats(): Promise<AdminStatsEntity>;
    getTemplates(): Promise<{ code: string; name: string }[]>;
}
