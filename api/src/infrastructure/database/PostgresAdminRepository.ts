import { Pool } from 'pg';
import type { IAdminRepository, AdminInvitationListItemEntity, AdminStatsEntity } from '../../domain/admin/Admin.types.js';

export class PostgresAdminRepository implements IAdminRepository {
    constructor(private pool: Pool) { }

    async getInvitationsList(): Promise<AdminInvitationListItemEntity[]> {
        const result = await this.pool.query(`
            SELECT i.*, 
                   COUNT(r.id)::int as rsvp_count,
                   SUM(CASE WHEN r.attendance = 'yes' THEN r.guest_count ELSE 0 END)::int as approved_guests
            FROM invitations i
            LEFT JOIN rsvp_responses r ON i.uuid = r.invitation_uuid
            GROUP BY i.id
            ORDER BY i.created_at DESC
        `);

        return result.rows.map(row => ({
            uuid: row.uuid,
            phoneNumber: row.phone_number,
            templateCode: row.template_code,
            lang: row.lang,
            groomName: row.groom_name,
            brideName: row.bride_name,
            eventDate: new Date(row.event_date),
            eventLocation: row.event_location,
            rsvpCount: row.rsvp_count || 0,
            approvedGuests: row.approved_guests || 0,
            shortCode: row.short_code,
            createdAt: new Date(row.created_at)
        }));
    }

    async getStats(): Promise<AdminStatsEntity> {
        const result = await this.pool.query(`
            SELECT 
                COUNT(*)::int as total_invitations,
                (SELECT COUNT(*)::int FROM rsvp_responses) as total_rsvps,
                (SELECT SUM(guest_count)::int FROM rsvp_responses WHERE attendance = 'yes') as total_guests
            FROM invitations
        `);

        const row = result.rows[0];
        return {
            totalInvitations: row.total_invitations || 0,
            totalRSVPs: row.total_rsvps || 0,
            totalGuests: row.total_guests || 0
        };
    }

    async getTemplates(): Promise<{ code: string; name: string }[]> {
        const result = await this.pool.query('SELECT code, name FROM templates WHERE is_active = true');
        return result.rows;
    }
}
