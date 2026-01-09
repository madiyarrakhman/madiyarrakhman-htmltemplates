package api

import (
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/infra/api/handlers"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/infra/api/middleware"
)

func SetupRouter(invHandler *handlers.InvitationHandler, adminHandler *handlers.AdminHandler, jwtSecret []byte, apiKey string, frontendDist string) *gin.Engine {
	r := gin.Default()

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "timestamp": time.Now()})
		})

		api.GET("/invitations/:uuid", invHandler.GetInvitation)
		api.POST("/rsvp/:uuid", invHandler.SubmitRSVP)

		api.POST("/admin/login", adminHandler.Login)
		api.POST("/admin/logout", adminHandler.Logout)

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(jwtSecret, apiKey))
		{
			admin.GET("/stats", adminHandler.GetStats)
			admin.GET("/invitations", adminHandler.GetInvitationsList)
			admin.POST("/invitations", adminHandler.CreateInvitation)
			admin.GET("/templates", adminHandler.GetTemplates)
		}
	}

	r.GET("/s/:shortCode", invHandler.RedirectShortCode)

	// Static Files Frontend
	rootDir := frontendDist
	if rootDir == "" {
		rootDir = filepath.Join("..", "frontend", "dist")
	}

	r.Static("/assets", filepath.Join(rootDir, "assets"))
	r.Static("/images", filepath.Join(rootDir, "images"))
	r.StaticFile("/favicon.ico", filepath.Join(rootDir, "favicon.ico"))

	// Fallback for SPA
	r.NoRoute(func(c *gin.Context) {
		c.File(filepath.Join(rootDir, "index.html"))
	})

	return r
}
