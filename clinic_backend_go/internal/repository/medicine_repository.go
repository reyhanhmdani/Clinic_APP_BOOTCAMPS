package repository

import (
	"clinic_backend_go/internal/models"

	"gorm.io/gorm"
)

type MedicineRepository interface {
	FindAll() ([]models.Medicine, error)
	FindByID(id uint) (*models.Medicine, error)
	Create(med *models.Medicine) error
	Update(med *models.Medicine) error
	Delete(id uint) error
	UpdateStock(id uint, newStock int) error
	HasConsultations(id uint) (bool, error)
}

type medicineRepository struct {
	db *gorm.DB
}

func NewMedicineRepository(db *gorm.DB) MedicineRepository {
	return &medicineRepository{db: db}
}

func (r *medicineRepository) FindAll() ([]models.Medicine, error) {
	var medicines []models.Medicine
	err := r.db.Order("name asc").Find(&medicines).Error
	return medicines, err
}

func (r *medicineRepository) FindByID(id uint) (*models.Medicine, error) {
	var med models.Medicine
	err := r.db.First(&med, id).Error
	if err != nil {
		return nil, err
	}
	return &med, nil
}

func (r *medicineRepository) Create(med *models.Medicine) error {
	return r.db.Create(med).Error
}

func (r *medicineRepository) Update(med *models.Medicine) error {
	return r.db.Save(med).Error
}

func (r *medicineRepository) Delete(id uint) error {
	return r.db.Delete(&models.Medicine{}, id).Error
}

func (r *medicineRepository) UpdateStock(id uint, newStock int) error {
	return r.db.Model(&models.Medicine{}).Where("id = ?", id).Update("stock", newStock).Error
}

func (r *medicineRepository) HasConsultations(id uint) (bool, error) {
	var count int64
	err := r.db.Model(&models.ConsultationMedicine{}).Where("medicine_id = ?", id).Count(&count).Error
	return count > 0, err
}
