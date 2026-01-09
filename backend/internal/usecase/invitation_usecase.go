package usecase

import (
	"errors"

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
	return u.repo.GetByUUID(uuidStr)
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
		inv.ShortCode = generateShortCode()
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
func generateShortCode() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	u := uuid.New().String()
	for i := 0; i < 6; i++ {
		b[i] = chars[u[i]%byte(len(chars))]
	}
	return string(b)
}
