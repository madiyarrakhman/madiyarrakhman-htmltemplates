package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/domain"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/usecase"
)

type AdminHandler struct {
	useCase *usecase.AdminUseCase
	invUC   *usecase.InvitationUseCase
}

func NewAdminHandler(u *usecase.AdminUseCase, invUC *usecase.InvitationUseCase) *AdminHandler {
	return &AdminHandler{useCase: u, invUC: invUC}
}

func (h *AdminHandler) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token, err := h.useCase.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.SetCookie("admin_token", token, 86400, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *AdminHandler) Logout(c *gin.Context) {
	c.SetCookie("admin_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *AdminHandler) GetStats(c *gin.Context) {
	stats, err := h.useCase.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func (h *AdminHandler) GetInvitationsList(c *gin.Context) {
	list, err := h.useCase.GetInvitations()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *AdminHandler) GetTemplates(c *gin.Context) {
	list, err := h.useCase.GetTemplates()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *AdminHandler) CreateInvitation(c *gin.Context) {
	var inv domain.Invitation
	if err := c.ShouldBindJSON(&inv); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.invUC.CreateInvitation(&inv); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Construct full short link
	// Ideally, base URL is from config, but we can infer or hardcode based on domain.
	// User domain is card-go.asia.
	shortLink := "https://card-go.asia/s/" + inv.ShortCode
	c.JSON(http.StatusCreated, gin.H{"uuid": inv.UUID, "shortCode": inv.ShortCode, "shortLink": shortLink})
}

func (h *AdminHandler) MarkAsPaid(c *gin.Context) {
	uuid := c.Param("uuid")
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "uuid is required"})
		return
	}

	if err := h.useCase.MarkAsPaid(uuid); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
