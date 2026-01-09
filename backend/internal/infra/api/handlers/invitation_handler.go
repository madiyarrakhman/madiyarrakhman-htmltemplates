package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/usecase"
)

type InvitationHandler struct {
	useCase *usecase.InvitationUseCase
}

func NewInvitationHandler(u *usecase.InvitationUseCase) *InvitationHandler {
	return &InvitationHandler{useCase: u}
}

func (h *InvitationHandler) GetInvitation(c *gin.Context) {
	id := c.Param("uuid")
	inv, err := h.useCase.GetInvitation(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Invitation not found"})
		return
	}
	c.JSON(http.StatusOK, inv)
}

func (h *InvitationHandler) SubmitRSVP(c *gin.Context) {
	id := c.Param("uuid")
	var req struct {
		GuestName  string `json:"guestName" binding:"required"`
		Attendance string `json:"attendance" binding:"required"`
		GuestCount int    `json:"guestCount"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.useCase.SubmitRSVP(id, req.GuestName, req.Attendance, req.GuestCount); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func (h *InvitationHandler) RedirectShortCode(c *gin.Context) {
	code := c.Param("shortCode")
	uuid, err := h.useCase.ResolveShortCode(code)
	if err != nil {
		c.String(http.StatusNotFound, "Short link not found")
		return
	}
	c.Redirect(http.StatusMovedPermanently, "/i/"+uuid)
}
