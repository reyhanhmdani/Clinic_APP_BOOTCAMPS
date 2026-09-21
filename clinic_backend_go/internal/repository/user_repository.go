package repository

import (
	"clinic_backend_go/internal/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	FindByEmail(email string) (*models.User, error)
	FindByID(id uint) (*models.User, error)
	FindByEmailOrGoogleID(email, googleID string) (*models.User, error)
	FindAll() ([]models.User, error)
	Create(user *models.User) error
	Update(user *models.User) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).
		Preload("Patient").
		First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.Preload("Patient").
		First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindAll() ([]models.User, error) {
	var users []models.User
	err := r.db.Preload("Patient").Order("id asc").Find(&users).Error
	return users, err
}

func (r *userRepository) FindByEmailOrGoogleID(email, googleID string) (*models.User, error) {
	var user models.User
	query := r.db.Preload("Patient")
	if googleID != "" {
		query = query.Where("email = ? OR google_id = ?", email, googleID)
	} else {
		query = query.Where("email = ?", email)
	}
	err := query.First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}
