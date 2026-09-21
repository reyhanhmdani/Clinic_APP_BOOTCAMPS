package service

import (
	"clinic_backend_go/internal/models"
	"clinic_backend_go/internal/repository"
	"fmt"
	"time"
)

type CreateDoctorInput struct {
	Name      string  `json:"name" binding:"required"`
	Gender    string  `json:"gender" binding:"required"`
	Spesialis string  `json:"spesialis" binding:"required"`
	Phone     *string `json:"phone"`
	Fee       float64 `json:"fee" binding:"required"`
}

type UpdateDoctorInput struct {
	Name        *string  `json:"name"`
	Gender      *string  `json:"gender"`
	Spesialis   *string  `json:"spesialis"`
	Phone       *string  `json:"phone"`
	Fee         *float64 `json:"fee"`
	IsActive    *bool    `json:"isActive"`
	IsActiveAlt *bool    `json:"is_active"`
}

func (u *UpdateDoctorInput) GetIsActive() *bool {
	if u.IsActive != nil {
		return u.IsActive
	}
	return u.IsActiveAlt
}

type DoctorService interface {
	GetAllDoctors() ([]models.Doctor, error)
	GetActiveDoctors() ([]models.Doctor, error)
	GetDoctorByID(id uint) (*models.Doctor, error)
	CreateDoctor(input CreateDoctorInput) (*models.Doctor, error)
	UpdateDoctor(id uint, input UpdateDoctorInput) (*models.Doctor, error)
	DeleteDoctor(id uint) error
}

type doctorService struct {
	doctorRepo repository.DoctorRepository
}

func NewDoctorService(doctorRepo repository.DoctorRepository) DoctorService {
	return &doctorService{doctorRepo: doctorRepo}
}

func (s *doctorService) GetAllDoctors() ([]models.Doctor, error) {
	return s.doctorRepo.FindAll()
}

func (s *doctorService) GetActiveDoctors() ([]models.Doctor, error) {
	return s.doctorRepo.FindAllACtive()
}

func (s *doctorService) GetDoctorByID(id uint) (*models.Doctor, error) {
	return s.doctorRepo.FindByID(id)
}

func (s *doctorService) CreateDoctor(input CreateDoctorInput) (*models.Doctor, error) {
	newDoctor := models.Doctor{
		Name:      input.Name,
		Gender:    input.Gender,
		Spesialis: input.Spesialis,
		Phone:     input.Phone,
		Fee:       input.Fee,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.doctorRepo.Create(&newDoctor); err != nil {
		return nil, err
	}
	return &newDoctor, nil
}

func (s *doctorService) UpdateDoctor(id uint, input UpdateDoctorInput) (*models.Doctor, error) {
	doctor, err := s.doctorRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if input.Name != nil {
		doctor.Name = *input.Name
	}
	if input.Gender != nil {
		doctor.Gender = *input.Gender
	}
	if input.Spesialis != nil {
		doctor.Spesialis = *input.Spesialis
	}
	if input.Phone != nil {
		doctor.Phone = input.Phone
	}
	if input.Fee != nil {
		doctor.Fee = *input.Fee
	}
	if active := input.GetIsActive(); active != nil {
		doctor.IsActive = *active
	}
	doctor.UpdatedAt = time.Now()

	if err := s.doctorRepo.Update(doctor); err != nil {
		return nil, err
	}
	return doctor, nil
}

func (s *doctorService) DeleteDoctor(id uint) error {
	_, err := s.doctorRepo.FindByID(id)
	if err != nil {
		return err
	}

	hasVisits, err := s.doctorRepo.HasVisits(id)
	if err != nil {
		return err
	}
	if hasVisits {
		return fmt.Errorf("Dokter tidak dapat dihapus karena memiliki riwayat kunjungan/antrian")
	}

	return s.doctorRepo.Delete(id)
}
