package usecase

import (
	"testing"

	"github.com/madiyarrakhman/wedding-invitation/backend/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestGetInvitation(t *testing.T) {
	mockRepo := new(MockInvitationRepository)
	uc := NewInvitationUseCase(mockRepo)

	testUUID := "test-uuid"
	expectedInv := &domain.Invitation{UUID: testUUID, PhoneNumber: "123"}

	mockRepo.On("GetByUUID", testUUID).Return(expectedInv, nil)

	inv, err := uc.GetInvitation(testUUID)

	assert.NoError(t, err)
	assert.Equal(t, expectedInv, inv)
	mockRepo.AssertExpectations(t)
}

func TestSubmitRSVP(t *testing.T) {
	mockRepo := new(MockInvitationRepository)
	uc := NewInvitationUseCase(mockRepo)

	mockRepo.On("AddRSVP", mock.Anything).Return(nil)

	err := uc.SubmitRSVP("uuid", "Ivan", "yes", 2)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}
