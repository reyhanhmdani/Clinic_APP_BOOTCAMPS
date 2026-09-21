package service

import (
	"clinic_backend_go/internal/models"
	"clinic_backend_go/internal/repository"
	"clinic_backend_go/internal/ws"
)

type PharmacyQueueStats struct {
	TotalPending   int `json:"totalPending"`
	TotalCompleted int `json:"totalCompleted"`
}

type PharmacyQueueResponse struct {
	Pending   []models.Consultation `json:"pending"`
	Completed []models.Consultation `json:"completed"`
	Stats     PharmacyQueueStats    `json:"stats"`
}

type PharmacyService interface {
	GetQueue() (*PharmacyQueueResponse, error)
	DispenseMedicine(consultationID uint) (*models.Consultation, error)
}

type pharmacyService struct {
	pharmacyRepo repository.PharmacyRepository
	wsHub        *ws.Hub
}

func NewPharmacyService(pharmacyRepo repository.PharmacyRepository, wsHub *ws.Hub) PharmacyService {
	return &pharmacyService{pharmacyRepo: pharmacyRepo, wsHub: wsHub}
}

func (s *pharmacyService) GetQueue() (*PharmacyQueueResponse, error) {
	queues, err := s.pharmacyRepo.GetPharmacyQueue()
	if err != nil {
		return nil, err
	}

	var pending []models.Consultation
	var completed []models.Consultation

	for _, q := range queues {
		if q.IsDispensed {
			completed = append(completed, q)
		} else {
			pending = append(pending, q)
		}
	}

	if pending == nil {
		pending = []models.Consultation{}
	}
	if completed == nil {
		completed = []models.Consultation{}
	}

	return &PharmacyQueueResponse{
		Pending:   pending,
		Completed: completed,
		Stats: PharmacyQueueStats{
			TotalPending:   len(pending),
			TotalCompleted: len(completed),
		},
	}, nil
}

func (s *pharmacyService) DispenseMedicine(consultationID uint) (*models.Consultation, error) {
	dispensed, err := s.pharmacyRepo.Dispense(consultationID)
	if err != nil {
		return nil, err
	}

	if s.wsHub != nil {
		s.wsHub.BroadcastQueue(map[string]interface{}{
			"type":           "MEDICINE_DISPENSED",
			"consultationId": consultationID,
			"visitId":        dispensed.VisitID,
		})
	}

	return dispensed, nil
}
