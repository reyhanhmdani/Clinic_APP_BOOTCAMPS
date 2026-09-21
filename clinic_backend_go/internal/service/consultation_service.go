package service

import (
	"clinic_backend_go/internal/models"
	"clinic_backend_go/internal/repository"
	"clinic_backend_go/internal/ws"
	"errors"
	"fmt"
	"time"
)

type PrescriptionItemInput struct {
	MedicineID    uint    `json:"medicineId"`
	MedicineIDAlt uint    `json:"medicine_id"`
	Qty           int     `json:"qty"`
	Instructions  *string `json:"instructions"`
}

func (p *PrescriptionItemInput) GetMedicineID() uint {
	if p.MedicineID > 0 {
		return p.MedicineID
	}
	return p.MedicineIDAlt
}

type CreateConsultationInput struct {
	VisitID         uint                    `json:"visitId"`
	VisitIDAlt      uint                    `json:"visit_id"`
	Complaint       string                  `json:"complaint" binding:"required"`
	Diagnosis       string                  `json:"diagnosis" binding:"required"`
	Notes           *string                 `json:"notes"`
	ConsultationFee *float64                `json:"consultationFee"`
	Medicine        []PrescriptionItemInput `json:"medicine"`
	Prescription    []PrescriptionItemInput `json:"prescription"`
}

func (c *CreateConsultationInput) GetVisitID() uint {
	if c.VisitID > 0 {
		return c.VisitID
	}
	return c.VisitIDAlt
}

func (c *CreateConsultationInput) GetMedicines() []PrescriptionItemInput {
	if len(c.Medicine) > 0 {
		return c.Medicine
	}
	return c.Prescription
}

type UpdateConsultationInput struct {
	Complaint *string  `json:"complaint"`
	Diagnosis *string  `json:"diagnosis"`
	Notes     *string  `json:"notes"`
	Fee       *float64 `json:"consultation_fee"`
}

type ConsultationService interface {
	GetAllConsultations() ([]models.Consultation, error)
	GetConsultationByID(id uint) (*models.Consultation, error)
	ProcessConsultation(input CreateConsultationInput) (*models.Consultation, *models.Invoice, error)
	UpdateConsultation(id uint, input UpdateConsultationInput) (*models.Consultation, error)
}

type consultationService struct {
	consultationRepo repository.ConsultationRepository
	visitRepo        repository.VisitRepository
	medRepo          repository.MedicineRepository
	invoiceRepo      repository.InvoiceRepository
	wsHub            *ws.Hub
}

func NewConsultationService(
	consultationRepo repository.ConsultationRepository,
	visitRepo repository.VisitRepository,
	medRepo repository.MedicineRepository,
	invoiceRepo repository.InvoiceRepository,
	wsHub *ws.Hub,
) ConsultationService {
	return &consultationService{
		consultationRepo: consultationRepo,
		visitRepo:        visitRepo,
		medRepo:          medRepo,
		invoiceRepo:      invoiceRepo,
		wsHub:            wsHub,
	}
}

func (s *consultationService) ProcessConsultation(input CreateConsultationInput) (*models.Consultation, *models.Invoice, error) {
	visitID := input.GetVisitID()
	if visitID == 0 {
		return nil, nil, errors.New("visitId atau visit_id wajib diisi")
	}

	// 1. Ambil data visit & tarif dokter
	visit, err := s.visitRepo.FindByID(visitID)
	if err != nil {
		return nil, nil, errors.New("data kunjungan visit tidak ditemukan")
	}

	doctorFee := 50000.0
	if input.ConsultationFee != nil && *input.ConsultationFee >= 0 {
		doctorFee = *input.ConsultationFee
	} else if visit.Doctor != nil && visit.Doctor.Fee > 0 {
		doctorFee = visit.Doctor.Fee
	}

	// 2. Simpan Rekam Medis
	consultation := models.Consultation{
		VisitID:         visitID,
		Complaint:       input.Complaint,
		Diagnosis:       input.Diagnosis,
		Notes:           input.Notes,
		ConsultationFee: doctorFee,
		IsDispensed:     false,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := s.consultationRepo.Create(&consultation); err != nil {
		return nil, nil, err
	}

	// 3. Simpan item resep obat & kurangi stok
	totalMedicineFee := 0.0
	for _, item := range input.GetMedicines() {
		medID := item.GetMedicineID()
		if medID == 0 {
			continue
		}
		med, err := s.medRepo.FindByID(medID)
		if err == nil {
			subTotal := med.Price * float64(item.Qty)
			totalMedicineFee += subTotal

			cm := models.ConsultationMedicine{
				ConsultationID: consultation.ID,
				MedicineID:     medID,
				Qty:            item.Qty,
				Price:          med.Price,
				SubTotal:       subTotal,
				Instructions:   item.Instructions,
				CreatedAt:      time.Now(),
				UpdatedAt:      time.Now(),
			}
			_ = s.consultationRepo.CreatePrescriptionItem(&cm)
		}
	}

	// 4. Update status visit
	_ = s.visitRepo.UpdateStatus(visit.ID, "COMPLETED")

	// 5. Generate tagihan invoice kasir otomatis jika belum ada
	invoiceNo := fmt.Sprintf("INV-%d-%d", time.Now().Unix(), visit.ID)
	invoice := models.Invoice{
		VisitID:              visit.ID,
		InvoiceNo:            invoiceNo,
		TotalConsultationFee: doctorFee,
		TotalMedicineFee:     totalMedicineFee,
		TotalAmount:          doctorFee + totalMedicineFee,
		Status:               "UNPAID",
		PaymentMethod:        "CASH",
		CreatedAt:            time.Now(),
		UpdatedAt:            time.Now(),
	}
	_ = s.invoiceRepo.Create(&invoice)

	if s.wsHub != nil {
		s.wsHub.BroadcastQueue(map[string]interface{}{
			"type":      "CONSULTATION_COMPLETED",
			"visitId":   visit.ID,
			"invoiceId": invoice.ID,
		})
	}

	return &consultation, &invoice, nil
}

func (s *consultationService) GetAllConsultations() ([]models.Consultation, error) {
	return s.consultationRepo.FindAll()
}

func (s *consultationService) GetConsultationByID(id uint) (*models.Consultation, error) {
	return s.consultationRepo.FindByID(id)
}

func (s *consultationService) UpdateConsultation(id uint, input UpdateConsultationInput) (*models.Consultation, error) {
	consultation, err := s.consultationRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if input.Complaint != nil {
		consultation.Complaint = *input.Complaint
	}
	if input.Diagnosis != nil {
		consultation.Diagnosis = *input.Diagnosis
	}
	if input.Notes != nil {
		consultation.Notes = input.Notes
	}
	if input.Fee != nil {
		consultation.ConsultationFee = *input.Fee
	}
	consultation.UpdatedAt = time.Now()

	if err := s.consultationRepo.Update(consultation); err != nil {
		return nil, err
	}
	return consultation, nil
}
