package repository

import (
	"clinic_backend_go/internal/models"

	"gorm.io/gorm"
)

type DoctorRepository interface {
	FindAll() ([]models.Doctor, error)
	FindAllACtive() ([]models.Doctor, error)
	FindByID(id uint) (*models.Doctor, error)
	Create(doctor *models.Doctor) error
	Update(doctor *models.Doctor) error
	Delete(id uint) error
	HasVisits(doctorID uint) (bool, error)
}

type doctorRepository struct {
	db *gorm.DB
}

func NewDoctorRepository(db *gorm.DB) DoctorRepository {
	return &doctorRepository{db: db}
}

func (r *doctorRepository) FindAll() ([]models.Doctor, error) {
	var doctors []models.Doctor
	err := r.db.Order("id desc").Find(&doctors).Error
	return doctors, err
}

func (r *doctorRepository) FindAllACtive() ([]models.Doctor, error) {
	var doctors []models.Doctor
	err := r.db.Where("is_active = ?", true).Order("id asc").Find(&doctors).Error
	return doctors, err
}

func (r *doctorRepository) FindByID(id uint) (*models.Doctor, error) {
	var doctor models.Doctor
	err := r.db.First(&doctor, id).Error
	if err != nil {
		return nil, err
	}
	return &doctor, nil
}

func (r *doctorRepository) Create(doctor *models.Doctor) error {
	return r.db.Create(doctor).Error
}

func (r *doctorRepository) Update(doctor *models.Doctor) error {
	return r.db.Save(doctor).Error
}

func (r *doctorRepository) Delete(id uint) error {
	return r.db.Delete(&models.Doctor{}, id).Error
}

func (r *doctorRepository) HasVisits(doctorID uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.Visit{}).Where("doctor_id = ?", doctorID).Count(&count).Error
	return count > 0, err
}
