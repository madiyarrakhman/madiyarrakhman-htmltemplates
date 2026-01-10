package usecase

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/domain"
)

type AdminUseCase struct {
	repo      domain.AdminRepository
	username  string
	password  string
	jwtSecret []byte
}

func NewAdminUseCase(repo domain.AdminRepository, user, pass string, secret []byte) *AdminUseCase {
	return &AdminUseCase{
		repo:      repo,
		username:  user,
		password:  pass,
		jwtSecret: secret,
	}
}

func (u *AdminUseCase) Login(username, password string) (string, error) {
	if username != u.username || password != u.password {
		return "", errors.New("invalid credentials")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"admin": true,
		"exp":   time.Now().Add(time.Hour * 24).Unix(),
	})

	return token.SignedString(u.jwtSecret)
}

func (u *AdminUseCase) GetStats() (*domain.AdminStats, error) {
	return u.repo.GetStats()
}

func (u *AdminUseCase) GetInvitations() ([]domain.InvitationWithStats, error) {
	return u.repo.GetInvitationsList()
}

func (u *AdminUseCase) GetTemplates() ([]domain.Template, error) {
	return u.repo.GetTemplates()
}

func (u *AdminUseCase) MarkAsPaid(uuid string) error {
	return u.repo.MarkAsPaid(uuid)
}
