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
	var inv domain.Invitation
	err := r.pool.QueryRow(context.Background(),
		`SELECT id, uuid, phone_number, template_code, lang, content, groom_name, bride_name, event_date, event_location, short_code 
		 FROM invitations WHERE uuid = $1`, uuid).Scan(
		&inv.ID, &inv.UUID, &inv.PhoneNumber, &inv.TemplateCode, &inv.Lang, &inv.Content, &inv.GroomName, &inv.BrideName, &inv.EventDate, &inv.EventLocation, &inv.ShortCode)

	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (r *PostgresInvitationRepository) GetByShortCode(code string) (*domain.Invitation, error) {
	var inv domain.Invitation
	err := r.pool.QueryRow(context.Background(),
		`SELECT uuid FROM invitations WHERE short_code = $1`, code).Scan(&inv.UUID)
	if err != nil {
		return nil, err
	}
	return &inv, nil
}

func (r *PostgresInvitationRepository) Create(inv *domain.Invitation) error {
	_, err := r.pool.Exec(context.Background(),
		`INSERT INTO invitations (uuid, phone_number, template_code, lang, groom_name, bride_name, event_date, event_location, content, short_code) 
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		inv.UUID, inv.PhoneNumber, inv.TemplateCode, inv.Lang, inv.GroomName, inv.BrideName, inv.EventDate, inv.EventLocation, inv.Content, inv.ShortCode)
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
	_ = r.pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM invitations").Scan(&s.TotalInvitations)
	_ = r.pool.QueryRow(context.Background(), "SELECT COUNT(*) FROM rsvp_responses").Scan(&s.TotalRSVPs)
	_ = r.pool.QueryRow(context.Background(), "SELECT COALESCE(SUM(guest_count), 0) FROM rsvp_responses WHERE attendance = 'yes'").Scan(&s.TotalGuests)
	return &s, nil
}

func (r *PostgresAdminRepository) GetInvitationsList() ([]domain.InvitationWithStats, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT 
            i.uuid, i.phone_number, i.template_code, i.lang, i.short_code,
            COALESCE((SELECT COUNT(*) FROM rsvp_responses r WHERE r.invitation_uuid = i.uuid), 0) as rsvp_count,
            COALESCE((SELECT SUM(guest_count) FROM rsvp_responses r WHERE r.invitation_uuid = i.uuid AND r.attendance = 'yes'), 0) as approved_guests
        FROM invitations i
        ORDER BY i.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.InvitationWithStats
	for rows.Next() {
		var i domain.InvitationWithStats
		_ = rows.Scan(&i.UUID, &i.PhoneNumber, &i.TemplateCode, &i.Lang, &i.ShortCode, &i.RSVPCount, &i.ApprovedGuests)
		list = append(list, i)
	}
	return list, nil
}

func (r *PostgresAdminRepository) GetTemplates() ([]domain.Template, error) {
	rows, err := r.pool.Query(context.Background(), "SELECT code, name FROM templates WHERE is_active = true")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []domain.Template
	for rows.Next() {
		var t domain.Template
		_ = rows.Scan(&t.Code, &t.Name)
		list = append(list, t)
	}
	return list, nil
}
