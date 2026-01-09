package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib" // Standard library driver
	"github.com/joho/godotenv"
	"github.com/pressly/goose/v3"

	"github.com/madiyarrakhman/wedding-invitation/backend/internal/infra/api"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/infra/api/handlers"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/infra/database"
	"github.com/madiyarrakhman/wedding-invitation/backend/internal/usecase"
	"github.com/madiyarrakhman/wedding-invitation/backend/migrations"
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

	// Run Migrations (Goose)
	goose.SetBaseFS(migrations.FS)

	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatal("Failed to set goose dialect:", err)
	}

	// We need a stdlib sql.DB instance for goose, but we have pgxpool.
	// However, goose supports passing a *sql.DB.
	// We can open a standard sql connection just for migrations.
	// Or simpler: use "github.com/jackc/pgx/v5/stdlib" to convert pool or config to sql.DB
	// BUT simplest is just opening a new connection with sql.Open("pgx", dbURL) (requires driver import)
	// Let's use stdlib adapter.

	db, err := sql.Open("pgx", dbURL) // Requires _ "github.com/jackc/pgx/v5/stdlib"
	if err != nil {
		log.Fatal("Failed to open DB for migrations:", err)
	}
	defer db.Close()

	if err := goose.Up(db, "."); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

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
	// Determine frontend dist location
	rootDir := os.Getenv("FRONTEND_DIST")
	if rootDir == "" {
		rootDir = filepath.Join("..", "frontend", "dist")
	}

	apiKey := os.Getenv("PRIVATE_API_KEY")
	if apiKey == "" {
		apiKey = "dev-api-key"
	}

	r := api.SetupRouter(invHandler, adminHandler, jwtSecret, apiKey, rootDir)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	fmt.Printf("🚀 DDD Go Backend started on 0.0.0.0:%s\n", port)
	r.Run("0.0.0.0:" + port)
}
