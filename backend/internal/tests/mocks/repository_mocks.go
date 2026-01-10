package mocks

import (
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/domain"
	"github.com/stretchr/testify/mock"
)

type MockInvitationRepository struct {
	mock.Mock
}

func (m *MockInvitationRepository) GetByUUID(uuid string) (*domain.Invitation, error) {
	args := m.Called(uuid)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Invitation), args.Error(1)
}

func (m *MockInvitationRepository) GetByShortCode(code string) (*domain.Invitation, error) {
	args := m.Called(code)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Invitation), args.Error(1)
}

func (m *MockInvitationRepository) Create(inv *domain.Invitation) error {
	args := m.Called(inv)
	return args.Error(0)
}

func (m *MockInvitationRepository) AddRSVP(rsvp *domain.RSVPResponse) error {
	args := m.Called(rsvp)
	return args.Error(0)
}

func (m *MockInvitationRepository) MarkAsPaid(uuid string) error {
	args := m.Called(uuid)
	return args.Error(0)
}

type MockAdminRepository struct {
	mock.Mock
}

func (m *MockAdminRepository) GetStats() (*domain.AdminStats, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.AdminStats), args.Error(1)
}

func (m *MockAdminRepository) GetInvitationsList() ([]domain.InvitationWithStats, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.InvitationWithStats), args.Error(1)
}

func (m *MockAdminRepository) GetTemplates() ([]domain.Template, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]domain.Template), args.Error(1)
}

func (m *MockAdminRepository) MarkAsPaid(uuid string) error {
	args := m.Called(uuid)
	return args.Error(0)
}
