package usecase

import (
	"errors"
	"testing"

	"github.com/madiyarrakhman/wedding-invitation/backend/internal/domain"
	"github.com/stretchr/testify/assert"
)

func TestAdminLogin(t *testing.T) {
	mockRepo := new(MockAdminRepository)
	jwtSecret := []byte("secret")
	uc := NewAdminUseCase(mockRepo, "admin", "password", jwtSecret)

	t.Run("Success", func(t *testing.T) {
		token, err := uc.Login("admin", "password")
		assert.NoError(t, err)
		assert.NotEmpty(t, token)
	})

	t.Run("Failure", func(t *testing.T) {
		token, err := uc.Login("admin", "wrong")
		assert.Error(t, err)
		assert.Empty(t, token)
		assert.Equal(t, "invalid credentials", err.Error())
	})
}

func TestGetStats(t *testing.T) {
	mockRepo := new(MockAdminRepository)
	uc := NewAdminUseCase(mockRepo, "admin", "password", []byte("s"))

	expectedStats := &domain.AdminStats{TotalInvitations: 10}
	mockRepo.On("GetStats").Return(expectedStats, nil)

	stats, err := uc.GetStats()
	assert.NoError(t, err)
	assert.Equal(t, expectedStats, stats)
	mockRepo.AssertExpectations(t)
}

func TestGetInvitations(t *testing.T) {
	mockRepo := new(MockAdminRepository)
	uc := NewAdminUseCase(mockRepo, "admin", "password", []byte("s"))

	expectedList := []domain.InvitationWithStats{{Invitation: domain.Invitation{ID: 1}}}
	mockRepo.On("GetInvitationsList").Return(expectedList, nil)

	list, err := uc.GetInvitations()
	assert.NoError(t, err)
	assert.Equal(t, expectedList, list)
	mockRepo.AssertExpectations(t)
}

func TestGetTemplates(t *testing.T) {
	mockRepo := new(MockAdminRepository)
	uc := NewAdminUseCase(mockRepo, "admin", "password", []byte("s"))

	expectedTemplates := []domain.Template{{Code: "t1"}}
	mockRepo.On("GetTemplates").Return(expectedTemplates, nil)

	templates, err := uc.GetTemplates()
	assert.NoError(t, err)
	assert.Equal(t, expectedTemplates, templates)
	mockRepo.AssertExpectations(t)

	// Test Error
	mockRepo = new(MockAdminRepository)
	uc = NewAdminUseCase(mockRepo, "admin", "password", []byte("s"))
	mockRepo.On("GetTemplates").Return(nil, errors.New("db error"))

	templates, err = uc.GetTemplates()
	assert.Error(t, err)
	assert.Nil(t, templates)
}
