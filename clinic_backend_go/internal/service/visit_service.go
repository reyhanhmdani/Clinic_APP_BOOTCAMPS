package service

import (
	"clinic_backend_go/internal/models"
	"clinic_backend_go/internal/repository"
	"clinic_backend_go/internal/ws"
	"errors"
	"time"
)

type CreateVisitInput struct {
	PatientID    uint `json:"patientId"`
	PatientIDAlt uint `json:"patient_id"`
	DoctorID     uint `json:"doctorId"`
	DoctorIDAlt  uint `json:"doctor_id"`
}

func (c *CreateVisitInput) GetPatientID() uint {
	if c.PatientID > 0 {
		return c.PatientID
	}
	return c.PatientIDAlt
}

func (c *CreateVisitInput) GetDoctorID() uint {
	if c.DoctorID > 0 {
		return c.DoctorID
	}
	return c.DoctorIDAlt
}

type UpdateVisitInput struct {
	PatientID    *uint   `json:"patientId"`
	PatientIDAlt *uint   `json:"patient_id"`
	DoctorID     *uint   `json:"doctorId"`
	DoctorIDAlt  *uint   `json:"doctor_id"`
	Status       *string `json:"status"`
}

func (u *UpdateVisitInput) GetPatientID() *uint {
	if u.PatientID != nil {
		return u.PatientID
	}
	return u.PatientIDAlt
}

func (u *UpdateVisitInput) GetDoctorID() *uint {
	if u.DoctorID != nil {
		return u.DoctorID
	}
	return u.DoctorIDAlt
}

type VisitService interface {
	GetAllVisits() ([]models.Visit, error)
	GetTodayVisits() ([]models.Visit, error)
	GetVisitByID(id uint) (*models.Visit, error)
	RegisterVisit(input CreateVisitInput) (*models.Visit, error)
	UpdateVisit(id uint, input UpdateVisitInput) (*models.Visit, error)
}

type visitService struct {
	visitRepo repository.VisitRepository
	wsHub     *ws.Hub
}

func NewVisitService(visitRepo repository.VisitRepository, wsHub *ws.Hub) VisitService {
	return &visitService{visitRepo: visitRepo, wsHub: wsHub}
}

func (s *visitService) GetAllVisits() ([]models.Visit, error) {
	return s.visitRepo.FindAll()
}

func (s *visitService) GetTodayVisits() ([]models.Visit, error) {
	return s.visitRepo.FindTodayVisits()
}

func (s *visitService) GetVisitByID(id uint) (*models.Visit, error) {
	return s.visitRepo.FindByID(id)
}

func (s *visitService) RegisterVisit(input CreateVisitInput) (*models.Visit, error) {
	patientID := input.GetPatientID()
	doctorID := input.GetDoctorID()
	if patientID == 0 || doctorID == 0 {
		return nil, errors.New("pasien dan dokter wajib dipilih")
	}

	count, _ := s.visitRepo.CountDoctorVisitsToday(doctorID)
	queueNum := int(count) + 1
	now := time.Now()

	newVisit := models.Visit{
		PatientID:   patientID,
		DoctorID:    doctorID,
		QueueNumber: queueNum,
		VisitDate:   now,
		Status:      "WAITING",
		CheckInTime: &now,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.visitRepo.Create(&newVisit); err != nil {
		return nil, err
	}

	created, err := s.visitRepo.FindByID(newVisit.ID)
	if err == nil && s.wsHub != nil {
		s.wsHub.BroadcastQueue(map[string]interface{}{
			"type":    "NEW_VISIT",
			"visitId": newVisit.ID,
		})
	}

	return created, err
}

func (s *visitService) UpdateVisit(id uint, input UpdateVisitInput) (*models.Visit, error) {
	visit, err := s.visitRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	if pid := input.GetPatientID(); pid != nil {
		visit.PatientID = *pid
	}
	if did := input.GetDoctorID(); did != nil {
		visit.DoctorID = *did
	}
	if input.Status != nil {
		visit.Status = *input.Status
		if *input.Status == "IN_KONSULTASI" && visit.CheckInTime == nil {
			visit.CheckInTime = &now
		}
	}
	visit.UpdatedAt = now

	if err := s.visitRepo.Update(visit); err != nil {
		return nil, err
	}

	updated, err := s.visitRepo.FindByID(id)
	if err == nil && s.wsHub != nil {
		s.wsHub.BroadcastQueue(map[string]interface{}{
			"type":    "STATUS_UPDATED",
			"visitId": id,
		})
	}

	return updated, err
}
