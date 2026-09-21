package repository

import (
	"clinic_backend_go/internal/models"

	"gorm.io/gorm"
)

type PatientRepository interface {
	FindAll() ([]models.Patient, error)
	FindByID(id uint) (*models.Patient, error)
	FindByUserID(userID uint) (*models.Patient, error)
	FindByNIK(nik string) (*models.Patient, error)
	Create(patient *models.Patient) error
	Update(patient *models.Patient) error
	Delete(id uint) error
	CountToday() (int64, error)
	CountByYear(prefix string) (int64, error)
	GetHistory(patientID uint) ([]models.Visit, error)
}

type patientRepository struct {
	db *gorm.DB
}

func NewPatientRepository(db *gorm.DB) PatientRepository {
	return &patientRepository{db: db}
}

func (r *patientRepository) FindAll() ([]models.Patient, error) {
	var patients []models.Patient
	err := r.db.Order("id desc").Find(&patients).Error
	return patients, err
}

func (r *patientRepository) FindByID(id uint) (*models.Patient, error) {
	var patient models.Patient
	err := r.db.Preload("Visits").First(&patient, id).Error
	if err != nil {
		return nil, err
	}
	return &patient, err
}

func (r *patientRepository) FindByUserID(userID uint) (*models.Patient, error) {
	var patient models.Patient
	err := r.db.Where("user_id = ?", userID).First(&patient).Error
	if err != nil {
		return nil, err
	}
	return &patient, nil
}

func (r *patientRepository) FindByNIK(nik string) (*models.Patient, error) {
	var patient models.Patient
	err := r.db.Where("nik = ?", nik).First(&patient).Error
	if err != nil {
		return nil, err
	}
	return &patient, nil
}

func (r *patientRepository) Create(patient *models.Patient) error {
	return r.db.Create(patient).Error
}

func (r *patientRepository) Update(patient *models.Patient) error {
	return r.db.Save(patient).Error
}

func (r *patientRepository) Delete(id uint) error {
	return r.db.Delete(&models.Patient{}, id).Error
}

func (r *patientRepository) CountToday() (int64, error) {
	var count int64
	err := r.db.Model(&models.Patient{}).Count(&count).Error
	return count, err
}

func (r *patientRepository) CountByYear(prefix string) (int64, error) {
	var count int64
	err := r.db.Model(&models.Patient{}).Where("no_rm LIKE ?", prefix+"%").Count(&count).Error
	return count, err
}

func (r *patientRepository) GetHistory(patientID uint) ([]models.Visit, error) {
	var visits []models.Visit
	err := r.db.Where("patient_id = ?", patientID).
		Preload("Doctor").
		Preload("Consultation.ConsultationMedicines.Medicine").
		Preload("Invoice").
		Order("visit_date desc").
		Find(&visits).Error
	return visits, err
}
