package database

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/domain"
)

type PostgresInvitationRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresInvitationRepository(pool *pgxpool.Pool) *PostgresInvitationRepository {
	return &PostgresInvitationRepository{pool: pool}
}

func (r *PostgresInvitationRepository) GetByUUID(uuid string) (*domain.Invitation, error) {
	var i domain.Invitation
	err := r.pool.QueryRow(context.Background(), `
		SELECT uuid, phone_number, template_code, lang, content, groom_name, bride_name, event_date, event_location, short_code, is_paid, expires_at
		FROM invitations WHERE uuid = $1
	`, uuid).Scan(&i.UUID, &i.PhoneNumber, &i.TemplateCode, &i.Lang, &i.Content, &i.GroomName, &i.BrideName, &i.EventDate, &i.EventLocation, &i.ShortCode, &i.IsPaid, &i.ExpiresAt)
	if err != nil {
		return nil, err
	}
	return &i, nil
}

func (r *PostgresInvitationRepository) GetByShortCode(code string) (*domain.Invitation, error) {
	var i domain.Invitation
	err := r.pool.QueryRow(context.Background(), `
		SELECT uuid, phone_number, template_code, lang, content, groom_name, bride_name, event_date, event_location, short_code, is_paid, expires_at
		FROM invitations WHERE short_code = $1
	`, code).Scan(&i.UUID, &i.PhoneNumber, &i.TemplateCode, &i.Lang, &i.Content, &i.GroomName, &i.BrideName, &i.EventDate, &i.EventLocation, &i.ShortCode, &i.IsPaid, &i.ExpiresAt)
	if err != nil {
		return nil, err
	}
	return &i, nil
}

func (r *PostgresInvitationRepository) Create(inv *domain.Invitation) error {
	_, err := r.pool.Exec(context.Background(), `
		INSERT INTO invitations (uuid, phone_number, template_code, lang, content, groom_name, bride_name, event_date, event_location, short_code, is_paid, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`, inv.UUID, inv.PhoneNumber, inv.TemplateCode, inv.Lang, inv.Content, inv.GroomName, inv.BrideName, inv.EventDate, inv.EventLocation, inv.ShortCode, inv.IsPaid, inv.ExpiresAt)
	return err
}

func (r *PostgresInvitationRepository) MarkAsPaid(uuid string) error {
	_, err := r.pool.Exec(context.Background(), "UPDATE invitations SET is_paid = true WHERE uuid = $1", uuid)
	return err
}

func (r *PostgresInvitationRepository) AddRSVP(rsvp *domain.RSVPResponse) error {
	_, err := r.pool.Exec(context.Background(),
		`INSERT INTO rsvp_responses (invitation_uuid, guest_name, attendance, guest_count) VALUES ($1, $2, $3, $4)`,
		rsvp.InvitationUUID, rsvp.GuestName, rsvp.Attendance, rsvp.GuestCount)
	return err
}

type PostgresAdminRepository struct {
	pool *pgxpool.Pool
}

func NewPostgresAdminRepository(pool *pgxpool.Pool) *PostgresAdminRepository {
	return &PostgresAdminRepository{pool: pool}
}

func (r *PostgresAdminRepository) GetStats() (*domain.AdminStats, error) {
	var s domain.AdminStats
	if err := r.pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM invitations").Scan(&s.TotalInvitations); err != nil {
		return nil, err
	}
	if err := r.pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM rsvp_responses").Scan(&s.TotalRSVPs); err != nil {
		return nil, err
	}
	if err := r.pool.QueryRow(context.Background(), "SELECT COALESCE(SUM(guest_count), 0) FROM rsvp_responses WHERE attendance = 'yes'").Scan(&s.TotalGuests); err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *PostgresAdminRepository) GetInvitationsList() ([]domain.InvitationWithStats, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT 
            i.uuid, i.phone_number, i.template_code, t.name_ru, i.lang, COALESCE(i.short_code, ''),
            i.is_paid, i.expires_at,
            COALESCE((SELECT COUNT(*) FROM rsvp_responses r WHERE r.invitation_uuid = i.uuid), 0) as rsvp_count,
            COALESCE((SELECT SUM(guest_count) FROM rsvp_responses r WHERE r.invitation_uuid = i.uuid AND r.attendance = 'yes'), 0) as approved_guests
        FROM invitations i
        LEFT JOIN templates t ON i.template_code = t.code
        ORDER BY i.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []domain.InvitationWithStats{}
	for rows.Next() {
		var i domain.InvitationWithStats
		var templateName *string
		if err := rows.Scan(&i.UUID, &i.PhoneNumber, &i.TemplateCode, &templateName, &i.Lang, &i.ShortCode, &i.IsPaid, &i.ExpiresAt, &i.RSVPCount, &i.ApprovedGuests); err != nil {
			return nil, err
		}
		if templateName != nil {
			i.TemplateName = *templateName
		} else {
			i.TemplateName = i.TemplateCode
		}
		list = append(list, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *PostgresAdminRepository) GetTemplates() ([]domain.Template, error) {
	rows, err := r.pool.Query(context.Background(), "SELECT code, name_ru FROM templates WHERE is_active = true")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []domain.Template{}
	for rows.Next() {
		var t domain.Template
		if err := rows.Scan(&t.Code, &t.Name); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return list, nil
}

func (r *PostgresAdminRepository) MarkAsPaid(uuid string) error {
	_, err := r.pool.Exec(context.Background(), "UPDATE invitations SET is_paid = true WHERE uuid = $1", uuid)
	return err
}
