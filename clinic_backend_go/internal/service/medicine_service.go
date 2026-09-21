package service

import (
	"clinic_backend_go/internal/models"
	"clinic_backend_go/internal/repository"
	"fmt"
	"time"
)

type CreateMedicineInput struct {
	Code  string  `json:"code" binding:"required"`
	Name  string  `json:"name" binding:"required"`
	Price float64 `json:"price" binding:"required"`
	Stock int     `json:"stock" binding:"required"`
	Unit  string  `json:"unit" binding:"required"` // tablet, botol, strip
}

type UpdateMedicineInput struct {
	Code  *string  `json:"code"`
	Name  *string  `json:"name"`
	Price *float64 `json:"price"`
	Stock *int     `json:"stock"`
	Unit  *string  `json:"unit"`
}

type MedicineService interface {
	GetAllMedicines() ([]models.Medicine, error)
	GetMedicineByID(id uint) (*models.Medicine, error)
	CreateMedicine(input CreateMedicineInput) (*models.Medicine, error)
	UpdateMedicine(id uint, input UpdateMedicineInput) (*models.Medicine, error)
	DeleteMedicine(id uint) error
}

type medicineService struct {
	medRepo repository.MedicineRepository
}

func NewMedicineService(medRepo repository.MedicineRepository) MedicineService {
	return &medicineService{medRepo: medRepo}
}

func (s *medicineService) GetAllMedicines() ([]models.Medicine, error) {
	return s.medRepo.FindAll()
}

func (s *medicineService) GetMedicineByID(id uint) (*models.Medicine, error) {
	return s.medRepo.FindByID(id)
}

func (s *medicineService) CreateMedicine(input CreateMedicineInput) (*models.Medicine, error) {
	newMed := models.Medicine{
		Code:      input.Code,
		Name:      input.Name,
		Price:     input.Price,
		Stock:     input.Stock,
		Unit:      input.Unit,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.medRepo.Create(&newMed); err != nil {
		return nil, err
	}
	return &newMed, nil
}

func (s *medicineService) UpdateMedicine(id uint, input UpdateMedicineInput) (*models.Medicine, error) {
	med, err := s.medRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if input.Code != nil {
		med.Code = *input.Code
	}
	if input.Name != nil {
		med.Name = *input.Name
	}
	if input.Price != nil {
		med.Price = *input.Price
	}
	if input.Stock != nil {
		med.Stock = *input.Stock
	}
	if input.Unit != nil {
		med.Unit = *input.Unit
	}
	med.UpdatedAt = time.Now()

	if err := s.medRepo.Update(med); err != nil {
		return nil, err
	}
	return med, nil
}

func (s *medicineService) DeleteMedicine(id uint) error {
	_, err := s.medRepo.FindByID(id)
	if err != nil {
		return err
	}

	isUsed, err := s.medRepo.HasConsultations(id)
	if err != nil {
		return err
	}
	if isUsed {
		return fmt.Errorf("Obat tidak dapat dihapus karena pernah diresepkan ke pasien")
	}

	return s.medRepo.Delete(id)
}
