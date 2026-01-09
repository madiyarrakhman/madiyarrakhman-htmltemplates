import { Pool } from 'pg';
import type { IAdminRepository, AdminInvitationListItemEntity, AdminStatsEntity } from '../../domain/admin/Admin.types.js';

export class PostgresAdminRepository implements IAdminRepository {
    constructor(private pool: Pool) { }

    async getInvitationsList(): Promise<AdminInvitationListItemEntity[]> {
        const result = await this.pool.query(`
            SELECT i.*, 
                   CASE 
                     WHEN i.lang = 'kk' THEN t.name_kk
                     WHEN i.lang = 'en' THEN t.name_en
                     ELSE t.name_ru 
                   END as template_name,
                   (SELECT COUNT(*)::int FROM rsvp_responses r WHERE r.invitation_uuid = i.uuid) as rsvp_count,
                   (SELECT COALESCE(SUM(guest_count), 0)::int FROM rsvp_responses r 
                    WHERE r.invitation_uuid = i.uuid AND r.attendance = 'yes') as approved_guests
            FROM invitations i
            LEFT JOIN templates t ON i.template_code = t.code
            ORDER BY i.created_at DESC
        `);

        return result.rows.map(row => ({
            uuid: row.uuid,
            phoneNumber: row.phone_number,
            templateCode: row.template_code,
            templateName: row.template_name || row.template_code,
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

    async getTemplates(): Promise<{ code: string; nameRu: string; nameKk: string; nameEn: string }[]> {
        const result = await this.pool.query('SELECT code, name_ru, name_kk, name_en FROM templates WHERE is_active = true');
        return result.rows.map(row => ({
            code: row.code,
            nameRu: row.name_ru,
            nameKk: row.name_kk,
            nameEn: row.name_en
        }));
    }
}
