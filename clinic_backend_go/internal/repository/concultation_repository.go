package repository

import (
	"clinic_backend_go/internal/models"

	"gorm.io/gorm"
)

type ConsultationRepository interface {
	FindAll() ([]models.Consultation, error)
	FindByID(id uint) (*models.Consultation, error)
	Create(consultation *models.Consultation) error
	Update(consultation *models.Consultation) error
	CreatePrescriptionItem(item *models.ConsultationMedicine) error
}

type consultationRepository struct {
	db *gorm.DB
}

func NewConsultationRepository(db *gorm.DB) ConsultationRepository {
	return &consultationRepository{db: db}
}

func (r *consultationRepository) FindAll() ([]models.Consultation, error) {
	var consultations []models.Consultation
	err := r.db.Preload("ConsultationMedicines.Medicine").Order("created_at desc").Find(&consultations).Error
	return consultations, err
}

func (r *consultationRepository) FindByID(id uint) (*models.Consultation, error) {
	var consultation models.Consultation
	err := r.db.Preload("ConsultationMedicines.Medicine").First(&consultation, id).Error
	if err != nil {
		return nil, err
	}
	return &consultation, nil
}

func (r *consultationRepository) Create(consultation *models.Consultation) error {
	return r.db.Create(consultation).Error
}

func (r *consultationRepository) Update(consultation *models.Consultation) error {
	return r.db.Save(consultation).Error
}

func (r *consultationRepository) CreatePrescriptionItem(item *models.ConsultationMedicine) error {
	return r.db.Create(item).Error
}