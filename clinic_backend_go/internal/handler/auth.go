package handler

import (
	"clinic_backend_go/internal/service"
	"clinic_backend_go/pkg/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", err.Error())
		return
	}

	user, token, err := h.authService.Login(input.Email, input.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			utils.ErrorResponse(c, http.StatusUnauthorized, err.Error())
			return
		}
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Login berhasil", gin.H{
		"token": token,
		"user":  user,
	})
}

type RegisterInput struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", err.Error())
		return
	}

	user, token, err := h.authService.Register(input.Username, input.Email, input.Password)
	if err != nil {
		if errors.Is(err, service.ErrEmailAlreadyExists) {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Berhasil mendaftar sebagai Customer", gin.H{
		"token": token,
		"user":  user,
	})
}

func (h *AuthHandler) GetAllUsers(c *gin.Context) {
	users, err := h.authService.GetAllUsers()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil data user", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil data User", users)
}

type GoogleAuthInput struct {
	Credential string `json:"credential" binding:"required"`
}

func (h *AuthHandler) GoogleAuth(c *gin.Context) {
	var input GoogleAuthInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Google token wajib disertakan", err.Error())
		return
	}

	user, token, err := h.authService.GoogleAuth(input.Credential)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Login Google berhasil", gin.H{
		"token": token,
		"user":  user,
	})
}

func (h *AuthHandler) LinkGoogle(c *gin.Context) {
	var input GoogleAuthInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Google token wajib disertakan", err.Error())
		return
	}

	userIDVal, exists := c.Get("user_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}
	userID := userIDVal.(uint)

	user, msg, err := h.authService.LinkGoogle(userID, input.Credential)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, msg, user)
}

