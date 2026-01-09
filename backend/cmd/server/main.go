package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/madiyarrakhman/wedding-invitation/backend/internal/infra/api/handlers"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/infra/api/middleware"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/infra/database"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/usecase"
)

func main() {
	_ = godotenv.Load()

	// 1. Database
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}
	defer pool.Close()

	// 2. Dependencies
	invRepo := database.NewPostgresInvitationRepository(pool)
	adminRepo := database.NewPostgresAdminRepository(pool)

	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) == 0 {
		jwtSecret = []byte("super-secret-wedding-key")
	}
	adminUser := os.Getenv("ADMIN_USERNAME")
	if adminUser == "" {
		adminUser = "admin"
	}
	adminPass := os.Getenv("ADMIN_PASSWORD")
	if adminPass == "" {
		adminPass = "admin123"
	}

	invUC := usecase.NewInvitationUseCase(invRepo)
	adminUC := usecase.NewAdminUseCase(adminRepo, adminUser, adminPass, jwtSecret)

	invHandler := handlers.NewInvitationHandler(invUC)
	adminHandler := handlers.NewAdminHandler(adminUC, invUC)

	// 3. Router
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
		admin.Use(middleware.AuthMiddleware(jwtSecret))
		{
			admin.GET("/stats", adminHandler.GetStats)
			admin.GET("/invitations", adminHandler.GetInvitationsList)
			admin.POST("/invitations", adminHandler.CreateInvitation)
			admin.GET("/templates", adminHandler.GetTemplates)
		}
	}

	r.GET("/s/:shortCode", invHandler.RedirectShortCode)

	// Static Files Frontend
	rootDir := os.Getenv("FRONTEND_DIST")
	if rootDir == "" {
		rootDir = filepath.Join("..", "frontend", "dist")
	}

	r.Static("/assets", filepath.Join(rootDir, "assets"))
	r.StaticFile("/favicon.ico", filepath.Join(rootDir, "favicon.ico"))

	// Fallback for SPA
	r.NoRoute(func(c *gin.Context) {
		c.File(filepath.Join(rootDir, "index.html"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3008"
	}

	fmt.Printf("🚀 DDD Go Backend started on http://localhost:%s\n", port)
	r.Run(":" + port)
}
