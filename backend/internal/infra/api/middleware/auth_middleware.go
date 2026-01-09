package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(secret []byte, apiKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check for API Key first (for external tools like n8n)
		reqApiKey := c.GetHeader("x-api-key")
		if reqApiKey != "" && reqApiKey == apiKey {
			c.Next()
			return
		}

		tokenString, err := c.Cookie("admin_token")
		// Also check Authorization Bearer header
		if err != nil {
			authHeader := c.GetHeader("Authorization")
			if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				tokenString = authHeader[7:]
				err = nil
			}
		}

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return secret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		c.Next()
	}
}
