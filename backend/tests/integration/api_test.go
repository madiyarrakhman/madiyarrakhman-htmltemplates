package integration

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/domain"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/infra/api"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/infra/api/handlers"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/tests/mocks"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/usecase"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func setupTestRouter() (*gin.Engine, *mocks.MockInvitationRepository, *mocks.MockAdminRepository) {
	gin.SetMode(gin.TestMode)

	invRepo := new(mocks.MockInvitationRepository)
	adminRepo := new(mocks.MockAdminRepository)

	jwtSecret := []byte("test-secret")
	invUC := usecase.NewInvitationUseCase(invRepo)
	adminUC := usecase.NewAdminUseCase(adminRepo, "admin", "password", jwtSecret)

	invHandler := handlers.NewInvitationHandler(invUC)
	adminHandler := handlers.NewAdminHandler(adminUC, invUC)

	r := api.SetupRouter(invHandler, adminHandler, jwtSecret, "test-api-key", "dist")
	return r, invRepo, adminRepo
}

func TestHealthCheck(t *testing.T) {
	r, _, _ := setupTestRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/health", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
}

func TestGetInvitation_Success(t *testing.T) {
	r, invRepo, _ := setupTestRouter()

	testUUID := "test-uuid-123"
	expectedInv := &domain.Invitation{
		UUID:        testUUID,
		PhoneNumber: "87007007070",
		GroomName:   "Arman",
		BrideName:   "Aia",
	}

	invRepo.On("GetByUUID", testUUID).Return(expectedInv, nil)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/invitations/"+testUUID, nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)

	var resp domain.Invitation
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, testUUID, resp.UUID)
	assert.Equal(t, "Arman", resp.GroomName)

	invRepo.AssertExpectations(t)
}

func TestAdminLogin_Flow(t *testing.T) {
	r, _, _ := setupTestRouter()

	w := httptest.NewRecorder()
	// Create JSON body
	body := `{"username":"admin", "password":"password"}`
	req, _ := http.NewRequest("POST", "/api/admin/login", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	// Check cookie
	cookie := w.Result().Cookies()
	assert.NotEmpty(t, cookie)
	for _, c := range cookie {
		if c.Name == "admin_token" {
			assert.NotEmpty(t, c.Value)
		}
	}
}

func TestCreateInvitation_Success(t *testing.T) {
	r, invRepo, _ := setupTestRouter()

	// Need to login first to get token?
	// Or we can mock the middleware or just pass the token header?
	// The SetupRouter uses middleware.AuthMiddleware.
	// We can cheat by generating a valid token using jwt-go (but we need the secret key).
	// We matched the secret key "test-secret" in setupTestRouter.

	// Generate Token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"admin": true,
		"exp":   time.Now().Add(time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte("test-secret"))

	// Mocks
	invRepo.On("Create", mock.Anything).Return(nil)

	w := httptest.NewRecorder()
	body := `{"phoneNumber":"87771112233", "templateCode":"starry-night"}`
	req, _ := http.NewRequest("POST", "/api/admin/invitations", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+tokenString)
	// Or via Cookie if middleware checks cookie?
	// Middleware usually checks "Authorization: Bearer <token>" or Cookie.
	// Checking middleware implementation... assuming Bearer for now or Cookie.
	// Actually AdminHandler Login sets Cookie.
	// But let's check middleware.AuthMiddleware implementation to be sure.
	// Assuming it accepts Cookie 'admin_token'.
	req.AddCookie(&http.Cookie{Name: "admin_token", Value: tokenString})

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	invRepo.AssertExpectations(t)
}
