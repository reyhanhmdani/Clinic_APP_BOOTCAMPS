package service

import (
	"clinic_backend_go/internal/models"
	"clinic_backend_go/internal/repository"
	"clinic_backend_go/internal/ws"
	"errors"
	"fmt"
	"strings"
	"time"
)

type CheckNikResponse struct {
	Exists   bool            `json:"exists"`
	IsLinked bool            `json:"isLinked"`
	Message  string          `json:"message"`
	Data     *models.Patient `json:"data"`
}

type BookVisitInput struct {
	DoctorID uint `json:"doctorId" binding:"required"`
}

type PayCustomerInvoiceInput struct {
	InvoiceID     uint   `json:"invoiceId" binding:"required"`
	PaymentMethod string `json:"paymentMethod"`
}

type ActiveCustomerVisitResponse struct {
	Visit      *models.Visit `json:"visit"`
	QueueAhead int64         `json:"queueAhead"`
}

type CustomerService interface {
	CheckNIK(nik string) (*CheckNikResponse, error)
	RegisterProfile(userID uint, input CreatePatientInput) (*models.Patient, error)
	GetProfile(userID uint) (*models.Patient, error)
	GetActiveDoctors() ([]models.Doctor, error)
	BookVisit(userID, doctorID uint) (*models.Visit, error)
	GetActiveVisit(userID uint) (*ActiveCustomerVisitResponse, error)
	GetHistory(userID uint) (*PatientHistoryResponse, error)
	PayInvoice(userID, invoiceID uint, method string) (*models.Invoice, error)
}

type customerService struct {
	patientRepo repository.PatientRepository
	doctorRepo  repository.DoctorRepository
	visitRepo   repository.VisitRepository
	invoiceRepo repository.InvoiceRepository
	wsHub       *ws.Hub
}

func NewCustomerService(
	patientRepo repository.PatientRepository,
	doctorRepo repository.DoctorRepository,
	visitRepo repository.VisitRepository,
	invoiceRepo repository.InvoiceRepository,
	wsHub *ws.Hub,
) CustomerService {
	return &customerService{
		patientRepo: patientRepo,
		doctorRepo:  doctorRepo,
		visitRepo:   visitRepo,
		invoiceRepo: invoiceRepo,
		wsHub:       wsHub,
	}
}

func (s *customerService) CheckNIK(nik string) (*CheckNikResponse, error) {
	nikTrimmed := strings.TrimSpace(nik)
	if len(nikTrimmed) != 16 {
		return nil, errors.New("NIK harus terdiri 16 angka")
	}

	patient, err := s.patientRepo.FindByNIK(nikTrimmed)
	if err != nil || patient == nil {
		return &CheckNikResponse{
			Exists:   false,
			IsLinked: false,
			Message:  "NIK belum terdaftar di klinik. Silakan lengkapi profil pasien baru.",
			Data:     nil,
		}, nil
	}

	if patient.UserID != nil {
		return &CheckNikResponse{
			Exists:   true,
			IsLinked: true,
			Message:  "NIK ini sudah terhubung ke akun lain",
			Data:     nil,
		}, nil
	}

	return &CheckNikResponse{
		Exists:   true,
		IsLinked: false,
		Message:  fmt.Sprintf("Data rekam medis ditemukan atas nama %s (%s).", patient.Name, patient.NoRM),
		Data:     patient,
	}, nil
}

func (s *customerService) RegisterProfile(userID uint, input CreatePatientInput) (*models.Patient, error) {
	var nik *string
	if input.NIK != nil && strings.TrimSpace(*input.NIK) != "" {
		cleanNik := strings.TrimSpace(*input.NIK)
		nik = &cleanNik
	}

	// 1. Cek apakah user sudah punya data pasien (Update mode)
	existing, _ := s.patientRepo.FindByUserID(userID)
	if existing != nil {
		if nik != nil {
			existing.NIK = nik
		}
		if input.Name != "" {
			existing.Name = input.Name
		}
		if input.Gender != "" {
			existing.Gender = input.Gender
		}
		if input.Age > 0 {
			existing.Age = input.Age
		}
		if input.Phone != nil {
			existing.Phone = input.Phone
		}
		if input.Address != nil {
			existing.Address = input.Address
		}
		existing.UpdatedAt = time.Now()
		if err := s.patientRepo.Update(existing); err != nil {
			return nil, err
		}
		return existing, nil
	}

	// 2. Jika NIK ada di sistem (pasien loket offline) -> Hubungkan!
	if nik != nil {
		offlinePatient, _ := s.patientRepo.FindByNIK(*nik)
		if offlinePatient != nil {
			if offlinePatient.UserID != nil {
				return nil, fmt.Errorf("NIK %s sudah terhubung ke akun lain", *nik)
			}
			offlinePatient.UserID = &userID
			if input.Phone != nil {
				offlinePatient.Phone = input.Phone
			}
			if input.Address != nil {
				offlinePatient.Address = input.Address
			}
			offlinePatient.UpdatedAt = time.Now()
			if err := s.patientRepo.Update(offlinePatient); err != nil {
				return nil, err
			}
			return offlinePatient, nil
		}
	}

	// 3. Pasien baru murni -> Terbitkan No. RM baru
	if input.Name == "" || input.Gender == "" || input.Age <= 0 {
		return nil, errors.New("Untuk pasien baru, Nama, Jenis Kelamin, dan Usia wajib diisi")
	}

	year := time.Now().Format("2006")
	count, _ := s.patientRepo.CountByYear(fmt.Sprintf("RM-%s", year))
	noRm := fmt.Sprintf("RM-%s-%03d", year, count+1)

	newPatient := models.Patient{
		UserID:    &userID,
		NIK:       nik,
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

func (s *customerService) GetProfile(userID uint) (*models.Patient, error) {
	patient, err := s.patientRepo.FindByUserID(userID)
	if err != nil {
		return nil, nil // Profil belum ada
	}
	return patient, nil
}

func (s *customerService) GetActiveDoctors() ([]models.Doctor, error) {
	return s.doctorRepo.FindAllACtive()
}

func (s *customerService) BookVisit(userID, doctorID uint) (*models.Visit, error) {
	patient, err := s.patientRepo.FindByUserID(userID)
	if err != nil || patient == nil {
		return nil, errors.New("Silahkan lengkapi profil pasien Anda terlebih dahulu sebelum mendaftar antrian")
	}

	doctor, err := s.doctorRepo.FindByID(doctorID)
	if err != nil || doctor == nil {
		return nil, errors.New("Dokter yang dipilih tidak ditemukan")
	}
	if !doctor.IsActive {
		return nil, errors.New("Dokter yang dipilih sedang tidak bertugas")
	}

	// Cek apakah sudah punya antrean aktif hari ini
	existingActive, _ := s.visitRepo.FindActiveVisitByPatientID(patient.ID)
	if existingActive != nil {
		return nil, fmt.Errorf("Anda sudah memiliki antrian aktif (No. %d) yang belum selesai", existingActive.QueueNumber)
	}

	// Hitung nomor antrian
	maxQueue, _ := s.visitRepo.GetMaxQueueNumberToday()
	queueNumber := maxQueue + 1

	now := time.Now()
	newVisit := models.Visit{
		PatientID:   patient.ID,
		DoctorID:    doctorID,
		QueueNumber: queueNumber,
		VisitDate:   now,
		Status:      "WAITING",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.visitRepo.Create(&newVisit); err != nil {
		return nil, err
	}

	created, err := s.visitRepo.FindByID(newVisit.ID)
	if err == nil && s.wsHub != nil {
		s.wsHub.BroadcastQueue(ginH{"type": "CUSTOMER_BOOKED", "visitId": created.ID})
	}

	return created, err
}

func (s *customerService) GetActiveVisit(userID uint) (*ActiveCustomerVisitResponse, error) {
	patient, err := s.patientRepo.FindByUserID(userID)
	if err != nil || patient == nil {
		return nil, nil
	}

	visit, err := s.visitRepo.FindActiveVisitByPatientID(patient.ID)
	if err != nil || visit == nil {
		return nil, nil
	}

	queueAhead, _ := s.visitRepo.CountQueueAhead(visit.DoctorID, visit.QueueNumber)

	return &ActiveCustomerVisitResponse{
		Visit:      visit,
		QueueAhead: queueAhead,
	}, nil
}

func (s *customerService) GetHistory(userID uint) (*PatientHistoryResponse, error) {
	patient, err := s.patientRepo.FindByUserID(userID)
	if err != nil || patient == nil {
		return nil, errors.New("Profil pasien tidak ditemukan")
	}

	visits, err := s.patientRepo.GetHistory(patient.ID)
	if err != nil {
		return nil, err
	}

	return &PatientHistoryResponse{
		Patient:     patient,
		TotalVisits: len(visits),
		Visits:      visits,
	}, nil
}

func (s *customerService) PayInvoice(userID, invoiceID uint, method string) (*models.Invoice, error) {
	patient, err := s.patientRepo.FindByUserID(userID)
	if err != nil || patient == nil {
		return nil, errors.New("Profil pasien tidak ditemukan")
	}

	invoice, err := s.invoiceRepo.FindByID(invoiceID)
	if err != nil || invoice == nil {
		return nil, errors.New("Invoice tidak ditemukan")
	}

	visit, err := s.visitRepo.FindByID(invoice.VisitID)
	if err != nil || visit == nil || visit.PatientID != patient.ID {
		return nil, errors.New("Invoice ini bukan milik pasien Anda")
	}

	if method == "" {
		method = "QRIS"
	}

	now := time.Now()
	invoice.Status = "PAID"
	invoice.PaymentMethod = method
	invoice.PaidAt = &now
	invoice.UpdatedAt = now

	if err := s.invoiceRepo.Update(invoice); err != nil {
		return nil, err
	}

	_ = s.visitRepo.UpdateStatus(visit.ID, "COMPLETED")

	if s.wsHub != nil {
		s.wsHub.BroadcastQueue(ginH{"type": "INVOICE_PAID", "invoiceId": invoice.ID, "visitId": visit.ID})
	}

	return invoice, nil
}

type ginH map[string]interface{}
