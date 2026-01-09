export type AttendanceStatus = 'yes' | 'no' | 'maybe';

export interface RSVPEntity {
    id?: number;
    guestName: string;
    attendance: AttendanceStatus;
    guestCount: number;
    createdAt?: Date;
}

export interface InvitationEntity {
    uuid: string;
    phoneNumber: string;
    templateCode: string;
    lang: string;
    groomName: string;
    brideName: string;
    eventDate: Date;
    eventLocation: string;
    content?: string | undefined;
    shortCode: string;
    createdAt: Date;
}

export interface IInvitationRepository {
    findByUuid(uuid: string): Promise<InvitationEntity | null>;
    saveRSVP(invitationUuid: string, rsvp: RSVPEntity): Promise<void>;
    save(invitation: InvitationEntity): Promise<void>;
}
