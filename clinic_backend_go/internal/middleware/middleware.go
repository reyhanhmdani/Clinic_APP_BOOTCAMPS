package middleware

import (
	"clinic_backend_go/pkg/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// mengizinkan akses dari frontend vercel & localhost
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

// memverifikasi bearer token jwt
func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Akses ditolak: Token tidak ditemukan")
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Format token harus: Bearer <token>")
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(parts[1], secret)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Token tidak valid atau sudah kedaluwarsa")
			c.Abort()
			return
		}

		// simpan data user ke context gin agar bisa di pakai di handler berikutnya
		c.Set("User", claims)
		c.Set("UserID", claims.UserID)
		c.Set("Role", claims.Role)
		c.Next()
	}
}

// membatasi akses endpoint berdasarkan role user
func RequireRoles(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		val, exists := c.Get("User")
		if !exists {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Autentikasi diperlukan")
			c.Abort()
			return
		}
		claims, ok := val.(*utils.JWTClaims)
		if !ok {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Klaim token tidak valid")
			c.Abort()
			return
		}

		for _, role := range roles {
			if claims.Role == role {
				c.Next()
				return
			}
		}

		utils.ErrorResponse(c, http.StatusForbidden, "Akses ditolak: Peran tidak diizinkan")
		c.Abort()
	}
}
