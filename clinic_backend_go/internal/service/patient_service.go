package service

import (
	"clinic_backend_go/internal/models"
	"clinic_backend_go/internal/repository"
	"fmt"
	"time"
)

type CreatePatientInput struct {
	NIK     *string `json:"nik"`
	Name    string  `json:"name" binding:"required"`
	Gender  string  `json:"gender" binding:"required"`
	Age     int     `json:"age" binding:"required"`
	Phone   *string `json:"phone"`
	Address *string `json:"address"`
}

type UpdatePatientInput struct {
	NIK     *string `json:"nik"`
	Name    *string `json:"name"`
	Gender  *string `json:"gender"`
	Age     *int    `json:"age"`
	Phone   *string `json:"phone"`
	Address *string `json:"address"`
}

type PatientHistoryResponse struct {
	Patient     *models.Patient `json:"patient"`
	TotalVisits int             `json:"totalVisits"`
	Visits      []models.Visit  `json:"visits"`
}

type PatientService interface {
	GetAllPatients() ([]models.Patient, error)
	GetPatientById(id uint) (*models.Patient, error)
	RegisterPatient(input CreatePatientInput) (*models.Patient, error)
	UpdatePatient(id uint, input UpdatePatientInput) (*models.Patient, error)
	DeletePatient(id uint) error
	GetPatientHistory(id uint) (*PatientHistoryResponse, error)
}

type patientService struct {
	patientRepo repository.PatientRepository
}

func NewPatientService(patientRepo repository.PatientRepository) PatientService {
	return &patientService{patientRepo: patientRepo}
}

func (s *patientService) GetAllPatients() ([]models.Patient, error) {
	return s.patientRepo.FindAll()
}

func (s *patientService) GetPatientById(id uint) (*models.Patient, error) {
	return s.patientRepo.FindByID(id)
}

func (s *patientService) RegisterPatient(input CreatePatientInput) (*models.Patient, error) {
	count, _ := s.patientRepo.CountToday()
	today := time.Now().Format("20060102")
	noRm := fmt.Sprintf("RM-%s-%04d", today, count+1)

	newPatient := models.Patient{
		NIK:       input.NIK,
		NoRM:      noRm,
		Name:      input.Name,
		Gender:    input.Gender,
		Age:       input.Age,
		Phone:     input.Phone,
		Address:   input.Address,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.patientRepo.Create(&newPatient); err != nil {
		return nil, err
	}
	return &newPatient, nil
}

func (s *patientService) UpdatePatient(id uint, input UpdatePatientInput) (*models.Patient, error) {
	patient, err := s.patientRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("pasien yang ingin di-update tidak ditemukan")
	}

	if input.NIK != nil {
		patient.NIK = input.NIK
	}
	if input.Name != nil {
		patient.Name = *input.Name
	}
	if input.Gender != nil {
		patient.Gender = *input.Gender
	}
	if input.Age != nil {
		patient.Age = *input.Age
	}
	if input.Phone != nil {
		patient.Phone = input.Phone
	}
	if input.Address != nil {
		patient.Address = input.Address
	}
	patient.UpdatedAt = time.Now()

	if err := s.patientRepo.Update(patient); err != nil {
		return nil, err
	}
	return patient, nil
}

func (s *patientService) DeletePatient(id uint) error {
	patient, err := s.patientRepo.FindByID(id)
	if err != nil {
		return fmt.Errorf("pasien tidak ditemukan")
	}

	if len(patient.Visits) > 0 {
		return fmt.Errorf("Pasien tidak dapat dihapus karena memiliki riwayat rekam medis/kunjungan")
	}

	return s.patientRepo.Delete(id)
}

func (s *patientService) GetPatientHistory(id uint) (*PatientHistoryResponse, error) {
	patient, err := s.patientRepo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("pasien tidak ditemukan")
	}

	visits, err := s.patientRepo.GetHistory(id)
	if err != nil {
		return nil, err
	}

	return &PatientHistoryResponse{
		Patient:     patient,
		TotalVisits: len(visits),
		Visits:      visits,
	}, nil
}
