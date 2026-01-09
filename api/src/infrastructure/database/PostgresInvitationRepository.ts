import { Pool } from 'pg';
import type { IInvitationRepository, InvitationEntity, RSVPEntity } from '../../domain/invitation/Invitation.types.js';

export class PostgresInvitationRepository implements IInvitationRepository {
    constructor(private pool: Pool) { }

    async findByUuid(uuid: string): Promise<InvitationEntity | null> {
        const result = await this.pool.query(
            'SELECT * FROM invitations WHERE uuid = $1',
            [uuid]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        return {
            uuid: row.uuid,
            phoneNumber: row.phone_number,
            templateCode: row.template_code,
            lang: row.lang,
            groomName: row.groom_name,
            brideName: row.bride_name,
            eventDate: new Date(row.event_date),
            eventLocation: row.event_location,
            content: row.content,
            shortCode: row.short_code,
            createdAt: new Date(row.created_at)
        };
    }

    async saveRSVP(invitationUuid: string, rsvp: RSVPEntity): Promise<void> {
        await this.pool.query(
            'INSERT INTO rsvp_responses (invitation_uuid, guest_name, attendance, guest_count) VALUES ($1, $2, $3, $4)',
            [invitationUuid, rsvp.guestName, rsvp.attendance, rsvp.guestCount]
        );
    }

    async save(invitation: InvitationEntity): Promise<void> {
        await this.pool.query(
            `INSERT INTO invitations (uuid, phone_number, template_code, lang, groom_name, bride_name, event_date, event_location, content, short_code) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                invitation.uuid,
                invitation.phoneNumber,
                invitation.templateCode,
                invitation.lang,
                invitation.groomName,
                invitation.brideName,
                invitation.eventDate,
                invitation.eventLocation,
                invitation.content,
                invitation.shortCode
            ]
        );
    }
}
