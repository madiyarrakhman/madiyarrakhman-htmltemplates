package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

// --- Models ---

type Invitation struct {
	ID            int                    `json:"id"`
	UUID          string                 `json:"uuid"`
	PhoneNumber   string                 `json:"phoneNumber"`
	TemplateCode  string                 `json:"templateCode"`
	Lang          string                 `json:"lang"`
	Content       map[string]interface{} `json:"content"`
	GroomName      string                 `json:"groomName"`
	BrideName      string                 `json:"brideName"`
	EventDate     string                 `json:"eventDate"`
	EventLocation  string                 `json:"eventLocation"`
	ShortCode     string                 `json:"shortCode"`
	RSVPCount     int                    `json:"rsvpCount"`
	ApprovedGuests int                    `json:"approvedGuests"`
}

type RSVPRequest struct {
	GuestName  string `json:"guestName" binding:"required"`
	Attendance string `json:"attendance" binding:"required"`
	GuestCount int    `json:"guestCount"`
}

type CreateInvitationRequest struct {
	PhoneNumber   string                 `json:"phoneNumber" binding:"required"`
	TemplateCode  string                 `json:"templateCode" binding:"required"`
	Lang          string                 `json:"lang" binding:"required"`
	GroomName      string                 `json:"groomName" binding:"required"`
	BrideName      string                 `json:"brideName" binding:"required"`
	EventDate     string                 `json:"eventDate" binding:"required"`
	EventLocation  string                 `json:"eventLocation" binding:"required"`
	Content       map[string]interface{} `json:"content"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// --- App State ---

var (
	db        *pgxpool.Pool
	jwtSecret []byte
)

func main() {
	_ = godotenv.Load()

	// 1. Database Connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Fatal("Unable to parse DATABASE_URL:", err)
	}

	db, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}
	defer db.Close()

	jwtSecret = []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) == 0 {
		jwtSecret = []byte("super-secret-wedding-key")
	}

	// 2. Gin Setup
	r := gin.Default()

	// Middleware
	r.Use(corsMiddleware())

	// 3. Routes
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "timestamp": time.Now()})
		})

		// Public Invitation Info
		api.GET("/invitations/:uuid", getInvitation)
		api.POST("/rsvp/:uuid", submitRSVP)

		// Admin Auth
		api.POST("/admin/login", login)
		api.POST("/admin/logout", logout)

		// Protected Admin Routes
		admin := api.Group("/admin")
		admin.Use(authMiddleware())
		{
			admin.GET("/stats", getStats)
			admin.GET("/invitations", getInvitationsList)
			admin.POST("/invitations", createInvitation)
			admin.GET("/templates", getTemplates)
		}
	}

	// Short Link Redirect
	r.GET("/s/:shortCode", redirectShortCode)

	// Static Files Frontend
	rootDir := os.Getenv("FRONTEND_DIST")
	if rootDir == "" {
		rootDir = filepath.Join("..", "frontend", "dist")
	}
	r.Static("/", rootDir)

	// Fallback for SPA
	r.NoRoute(func(c *gin.Context) {
		c.File(filepath.Join(rootDir, "index.html"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3008"
	}

	fmt.Printf("🚀 Go Backend started on http://localhost:%s\n", port)
	r.Run(":" + port)
}

// --- Handlers ---

func getInvitation(c *gin.Context) {
	id := c.Param("uuid")
	var inv Invitation
	err := db.QueryRow(context.Background(), 
		`SELECT id, uuid, phone_number, template_code, lang, content, groom_name, bride_name, event_date, event_location, short_code 
		 FROM invitations WHERE uuid = $1`, id).Scan(
		&inv.ID, &inv.UUID, &inv.PhoneNumber, &inv.TemplateCode, &inv.Lang, &inv.Content, &inv.GroomName, &inv.BrideName, &inv.EventDate, &inv.EventLocation, &inv.ShortCode)

	if err != nil {
		if err == pgx.ErrNoRows {
			c.JSON(404, gin.H{"error": "Invitation not found"})
		} else {
			c.JSON(500, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(200, inv)
}

func submitRSVP(c *gin.Context) {
	invUUID := c.Param("uuid")
	var req RSVPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Exec(context.Background(),
		`INSERT INTO rsvp_responses (invitation_uuid, guest_name, attendance, guest_count) VALUES ($1, $2, $3, $4)`,
		invUUID, req.GuestName, req.Attendance, req.GuestCount)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"status": "ok"})
}

func login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	adminUser := os.Getenv("ADMIN_USERNAME")
	if adminUser == "" { adminUser = "admin" }
	adminPass := os.Getenv("ADMIN_PASSWORD")
	if adminPass == "" { adminPass = "admin123" }

	if req.Username == adminUser && req.Password == adminPass {
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"admin": true,
			"exp":   time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, _ := token.SignedString(jwtSecret)

		c.SetCookie("admin_token", tokenString, 86400, "/", "", false, true)
		c.JSON(200, gin.H{"status": "ok"})
	} else {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
	}
}

func logout(c *gin.Context) {
	c.SetCookie("admin_token", "", -1, "/", "", false, true)
	c.JSON(200, gin.H{"status": "ok"})
}

func getStats(c *gin.Context) {
	var totalInv, totalRSVP, totalGuests int
	_ = db.QueryRow(context.Background(), "SELECT COUNT(*) FROM invitations").Scan(&totalInv)
	_ = db.QueryRow(context.Background(), "SELECT COUNT(*) FROM rsvp_responses").Scan(&totalRSVP)
	_ = db.QueryRow(context.Background(), "SELECT SUM(guest_count) FROM rsvp_responses WHERE attendance = 'yes'").Scan(&totalGuests)

	c.JSON(200, gin.H{
		"totalInvitations": totalInv,
		"totalRSVPs":       totalRSVP,
		"totalGuests":      totalGuests,
	})
}

func getInvitationsList(c *gin.Context) {
	rows, err := db.Query(context.Background(), `
		SELECT 
            i.uuid, i.phone_number, i.template_code, i.lang, i.short_code,
            COALESCE((SELECT COUNT(*) FROM rsvp_responses r WHERE r.invitation_uuid = i.uuid), 0) as rsvp_count,
            COALESCE((SELECT SUM(guest_count) FROM rsvp_responses r WHERE r.invitation_uuid = i.uuid AND r.attendance = 'yes'), 0) as approved_guests
        FROM invitations i
        ORDER BY i.created_at DESC
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var invitations []Invitation
	for rows.Next() {
		var inv Invitation
		_ = rows.Scan(&inv.UUID, &inv.PhoneNumber, &inv.TemplateCode, &inv.Lang, &inv.ShortCode, &inv.RSVPCount, &inv.ApprovedGuests)
		invitations = append(invitations, inv)
	}
	if invitations == nil { invitations = []Invitation{} }
	c.JSON(200, invitations)
}

func createInvitation(c *gin.Context) {
	var req CreateInvitationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if req.Content == nil {
		req.Content = make(map[string]interface{})
	}

	newUUID := uuid.New().String()
	shortCode := generateShortCode()

	_, err := db.Exec(context.Background(),
		`INSERT INTO invitations (uuid, phone_number, template_code, lang, groom_name, bride_name, event_date, event_location, content, short_code) 
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		newUUID, req.PhoneNumber, req.TemplateCode, req.Lang, req.GroomName, req.BrideName, req.EventDate, req.EventLocation, req.Content, shortCode)

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, gin.H{"uuid": newUUID, "shortCode": shortCode})
}

func getTemplates(c *gin.Context) {
	rows, _ := db.Query(context.Background(), "SELECT code, name FROM templates WHERE is_active = true")
	defer rows.Close()

	type Tmpl struct {
		Code string `json:"code"`
		Name string `json:"name"`
	}
	var templates []Tmpl
	for rows.Next() {
		var t Tmpl
		_ = rows.Scan(&t.Code, &t.Name)
		templates = append(templates, t)
	}
	if templates == nil { templates = []Tmpl{} }
	c.JSON(200, templates)
}

func redirectShortCode(c *gin.Context) {
	code := c.Param("shortCode")
	var invUUID string
	err := db.QueryRow(context.Background(), "SELECT uuid FROM invitations WHERE short_code = $1", code).Scan(&invUUID)
	if err != nil {
		c.String(404, "Short link not found")
		return
	}
	c.Redirect(http.StatusMovedPermanently, "/i/"+invUUID)
}

// --- Utils ---

func generateShortCode() string {
	// Simple generator for proof of concept
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 6)
	for i := range b {
		b[i] = chars[time.Now().UnixNano()%int64(len(chars))]
	}
	return string(b)
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("admin_token")
		if err != nil {
			c.JSON(401, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(401, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, x-api-key")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
