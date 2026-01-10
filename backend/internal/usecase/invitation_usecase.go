package usecase

import (
	"errors"

	"crypto/sha256"
	"encoding/base64"
	"time"

	"github.com/google/uuid"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/domain"
)

type InvitationUseCase struct {
	repo domain.InvitationRepository
}

func NewInvitationUseCase(repo domain.InvitationRepository) *InvitationUseCase {
	return &InvitationUseCase{repo: repo}
}

func (u *InvitationUseCase) GetInvitation(uuidStr string) (*domain.Invitation, error) {
	if uuidStr == "" {
		return nil, errors.New("uuid is required")
	}
	inv, err := u.repo.GetByUUID(uuidStr)
	if err != nil {
		return nil, err
	}

	// Check if expired and unpaid
	if !inv.IsPaid && inv.ExpiresAt != nil && inv.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("invitation_expired")
	}

	return inv, nil
}

func (u *InvitationUseCase) MarkAsPaid(uuid string) error {
	return u.repo.MarkAsPaid(uuid)
}

func (u *InvitationUseCase) SubmitRSVP(invUUID string, name string, attendance string, count int) error {
	if invUUID == "" || name == "" || attendance == "" {
		return errors.New("missing required fields for RSVP")
	}
	rsvp := &domain.RSVPResponse{
		InvitationUUID: invUUID,
		GuestName:      name,
		Attendance:     attendance,
		GuestCount:     count,
	}
	return u.repo.AddRSVP(rsvp)
}

func (u *InvitationUseCase) CreateInvitation(inv *domain.Invitation) error {
	if inv.UUID == "" {
		inv.UUID = uuid.New().String()
	}
	if inv.ShortCode == "" {
		inv.ShortCode = generateShortCode(inv.UUID)
	}
	// Default: Expire in 1 hour if not paid
	if inv.ExpiresAt == nil {
		exp := time.Now().Add(1 * time.Hour)
		inv.ExpiresAt = &exp
	}
	// Initialize Content if nil to prevent DB violation (NOT NULL)
	if inv.Content == nil {
		inv.Content = make(map[string]interface{})
	}
	return u.repo.Create(inv)
}

func (u *InvitationUseCase) ResolveShortCode(code string) (string, error) {
	inv, err := u.repo.GetByShortCode(code)
	if err != nil {
		return "", err
	}
	return inv.UUID, nil
}

// Private helper to generate short code (normally a separate domain service)
// Private helper to generate short code (normally a separate domain service)
func generateShortCode(seedUUID string) string {
	// Combine UUID and current nanosecond timestamp for uniqueness
	data := seedUUID + time.Now().String()
	hash := sha256.Sum256([]byte(data))

	// Encode hash to make it URL-safe string
	encoded := base64.RawURLEncoding.EncodeToString(hash[:])

	// Take first 6 characters.
	// In a real high-load system, you'd check for collisions in DB,
	// but for this scale, 6 chars of SHA256 is effectively unique.
	if len(encoded) > 6 {
		return encoded[:6]
	}
	return encoded
}
