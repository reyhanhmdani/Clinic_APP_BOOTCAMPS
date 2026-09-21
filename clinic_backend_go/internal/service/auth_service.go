package service

import (
	"clinic_backend_go/internal/models"
	"clinic_backend_go/internal/repository"
	"clinic_backend_go/pkg/utils"
	"errors"
	"strings"
)

var (
	ErrInvalidCredentials = errors.New("email atau password salah")
	ErrTokenGeneration    = errors.New("gagal menerbitkan token")
	ErrEmailAlreadyExists = errors.New("Email sudah terdaftar")
)

type AuthService interface {
	Login(email, password string) (*models.User, string, error)
	Register(username, email, password string) (*models.User, string, error)
	GoogleAuth(credential string) (*models.User, string, error)
	LinkGoogle(userID uint, credential string) (*models.User, string, error)
	GetAllUsers() ([]models.User, error)
}

type authService struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo repository.UserRepository, jwtSecret string) AuthService {
	return &authService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

func (s *authService) Login(email, password string) (*models.User, string, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, "", ErrInvalidCredentials
	}

	if user.Password == nil || *user.Password == "" {
		return nil, "", errors.New("Akun ini terdaftar via Google. Silakan login menggunakan tombol Google.")
	}

	if !utils.CheckPasswordHash(password, *user.Password) {
		return nil, "", ErrInvalidCredentials
	}

	username := ""
	if user.Username != nil {
		username = *user.Username
	}

	token, err := utils.GenerateToken(user.ID, username, user.Email, user.Role, s.jwtSecret)
	if err != nil {
		return nil, "", ErrTokenGeneration
	}

	return user, token, nil
}

func (s *authService) Register(username, email, password string) (*models.User, string, error) {
	// 1. Cek apakah email sudah terdaftar
	existing, _ := s.userRepo.FindByEmail(email)
	if existing != nil {
		return nil, "", ErrEmailAlreadyExists
	}

	// 2. Hash password
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, "", errors.New("gagal memproses password")
	}

	// 3. Simpan user baru
	newUser := models.User{
		Username: &username,
		Email:    email,
		Password: &hashedPassword,
		Role:     "CUSTOMER",
		Provider: "LOCAL",
	}

	if err := s.userRepo.Create(&newUser); err != nil {
		return nil, "", err
	}

	// 4. Generate token
	token, err := utils.GenerateToken(newUser.ID, username, newUser.Email, newUser.Role, s.jwtSecret)
	if err != nil {
		return nil, "", ErrTokenGeneration
	}

	return &newUser, token, nil
}

func (s *authService) GoogleAuth(credential string) (*models.User, string, error) {
	payload, err := utils.VerifyGoogleToken(credential)
	if err != nil {
		return nil, "", err
	}

	// 1. Cek apakah user sudah ada di database (by email atau google_id)
	user, _ := s.userRepo.FindByEmailOrGoogleID(payload.Email, payload.Sub)

	if user != nil {
		// Proteksi: jika user sudah terikat dengan akun Google lain
		if user.GoogleID != nil && *user.GoogleID != "" && *user.GoogleID != payload.Sub {
			return nil, "", errors.New("Email ini sudah terhubung dengan akun Google yang berbeda")
		}

		// KASUS AUTO-LINKING: Jika akun lama belum punya google_id, tautkan sekarang
		if user.GoogleID == nil || *user.GoogleID == "" {
			user.GoogleID = &payload.Sub
			if user.Password != nil && *user.Password != "" {
				user.Provider = "LOCAL"
			} else {
				user.Provider = "GOOGLE"
			}
			if err := s.userRepo.Update(user); err != nil {
				return nil, "", err
			}
		}
	} else {
		// KASUS USER BARU: Daftarkan akun baru
		username := payload.Name
		if username == "" {
			username = strings.Split(payload.Email, "@")[0]
		}
		newUser := models.User{
			Username: &username,
			Email:    payload.Email,
			Password: nil,
			Role:     "CUSTOMER",
			GoogleID: &payload.Sub,
			Provider: "GOOGLE",
		}

		if err := s.userRepo.Create(&newUser); err != nil {
			return nil, "", err
		}
		user = &newUser
	}

	// 2. Terbitkan JWT Token Klinik
	username := ""
	if user.Username != nil {
		username = *user.Username
	}

	token, err := utils.GenerateToken(user.ID, username, user.Email, user.Role, s.jwtSecret)
	if err != nil {
		return nil, "", ErrTokenGeneration
	}

	return user, token, nil
}

func (s *authService) LinkGoogle(userID uint, credential string) (*models.User, string, error) {
	payload, err := utils.VerifyGoogleToken(credential)
	if err != nil {
		return nil, "", err
	}

	// 1. Cek user saat ini
	currentUser, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, "", errors.New("User tidak ditemukan")
	}

	// 2. Cek jika akun saat ini memang sudah terhubung dengan Google ini
	if currentUser.GoogleID != nil && *currentUser.GoogleID == payload.Sub {
		return currentUser, "Akun Anda sudah tertaut dengan Google ini", nil
	}

	// 3. Cek apakah googleId ATAU email ini sudah dipakai akun pasien LAIN
	existing, _ := s.userRepo.FindByEmailOrGoogleID(payload.Email, payload.Sub)
	if existing != nil && existing.ID != userID {
		return nil, "", errors.New("Akun Google ini sudah terhubung ke akun pasien lain")
	}

	// 4. Update dan tautkan googleId
	currentUser.GoogleID = &payload.Sub
	if currentUser.Password != nil && *currentUser.Password != "" {
		currentUser.Provider = "LOCAL"
	} else {
		currentUser.Provider = "GOOGLE"
	}

	if err := s.userRepo.Update(currentUser); err != nil {
		return nil, "", err
	}

	return currentUser, "Berhasil menautkan akun Google!", nil
}

func (s *authService) GetAllUsers() ([]models.User, error) {
	return s.userRepo.FindAll()
}

