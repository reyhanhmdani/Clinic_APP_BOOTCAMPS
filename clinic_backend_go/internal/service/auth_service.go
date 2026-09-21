package service

import (
	"clinic_backend_go/internal/models"
	"clinic_backend_go/internal/repository"
	"clinic_backend_go/pkg/utils"
	"errors"
)

var (
	ErrInvalidCredentials = errors.New("email atau password salah")
	ErrTokenGeneration    = errors.New("gagal menerbitkan token")
	ErrEmailAlreadyExists = errors.New("Email sudah terdaftar")
)

type AuthService interface {
	Login(email, password string) (*models.User, string, error)
	Register(username, email, password string) (*models.User, string, error)
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

	if user.Password == "" {
		return nil, "", errors.New("Akun ini terdaftar via Google. Silakan login menggunakan tombol Google.")
	}

	if !utils.CheckPasswordHash(password, user.Password) {
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
		Password: hashedPassword,
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

func (s *authService) GetAllUsers() ([]models.User, error) {
	return s.userRepo.FindAll()
}
