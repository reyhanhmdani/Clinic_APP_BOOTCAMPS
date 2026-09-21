package service

import (
	"bytes"
	"clinic_backend_go/internal/models"
	"clinic_backend_go/internal/repository"
	"clinic_backend_go/internal/ws"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"time"
)

type PayInvoiceInput struct {
	PaymentMethod    string `json:"paymentMethod"`
	PaymentMethodAlt string `json:"payment_method"`
}

func (p *PayInvoiceInput) GetPaymentMethod() string {
	if p.PaymentMethod != "" {
		return p.PaymentMethod
	}
	if p.PaymentMethodAlt != "" {
		return p.PaymentMethodAlt
	}
	return "CASH"
}

type CreateInvoiceInput struct {
	VisitID              uint    `json:"visitId"`
	VisitIDAlt           uint    `json:"visit_id"`
	TotalConsultationFee float64 `json:"total_consultation_fee"`
	TotalMedicineFee     float64 `json:"total_medicine_fee"`
	TotalAmount          float64 `json:"total_amount"`
	PaymentMethod        string  `json:"paymentMethod"`
	PaymentMethodAlt     string  `json:"payment_method"`
}

func (c *CreateInvoiceInput) GetVisitID() uint {
	if c.VisitID > 0 {
		return c.VisitID
	}
	return c.VisitIDAlt
}

type MidtransSnapResponse struct {
	Token       string  `json:"token"`
	RedirectURL string  `json:"redirectUrl"`
	InvoiceNo   string  `json:"invoiceNo"`
	TotalAmount float64 `json:"totalAmount"`
}

type MidtransItemDetail struct {
	ID       string `json:"id"`
	Price    int64  `json:"price"`
	Quantity int    `json:"quantity"`
	Name     string `json:"name"`
}

type MidtransTransactionDetails struct {
	OrderID     string `json:"order_id"`
	GrossAmount int64  `json:"gross_amount"`
}

type MidtransCustomerDetails struct {
	FirstName string `json:"first_name"`
	Phone     string `json:"phone"`
}

type MidtransSnapPayload struct {
	TransactionDetails MidtransTransactionDetails `json:"transaction_details"`
	ItemDetails        []MidtransItemDetail       `json:"item_details"`
	CustomerDetails    MidtransCustomerDetails    `json:"customer_details"`
}

type InvoiceService interface {
	GetAllInvoices() ([]models.Invoice, error)
	GetInvoiceByID(id uint) (*models.Invoice, error)
	CreateInvoice(input CreateInvoiceInput) (*models.Invoice, error)
	PayInvoice(id uint, method string) (*models.Invoice, error)
	GetMidtransSnapToken(invoiceID uint, userID uint, userRole string) (*MidtransSnapResponse, error)
}

type invoiceService struct {
	invoiceRepo repository.InvoiceRepository
	visitRepo   repository.VisitRepository
	patientRepo repository.PatientRepository
	wsHub       *ws.Hub
}

func NewInvoiceService(invoiceRepo repository.InvoiceRepository, visitRepo repository.VisitRepository, patientRepo repository.PatientRepository, wsHub *ws.Hub) InvoiceService {
	return &invoiceService{invoiceRepo: invoiceRepo, visitRepo: visitRepo, patientRepo: patientRepo, wsHub: wsHub}
}

func (s *invoiceService) GetAllInvoices() ([]models.Invoice, error) {
	return s.invoiceRepo.FindAll()
}

func (s *invoiceService) GetInvoiceByID(id uint) (*models.Invoice, error) {
	return s.invoiceRepo.FindByID(id)
}

func (s *invoiceService) CreateInvoice(input CreateInvoiceInput) (*models.Invoice, error) {
	visitID := input.GetVisitID()
	if visitID == 0 {
		return nil, errors.New("visitId atau visit_id wajib diisi")
	}

	// Jika invoice untuk kunjungan ini sudah dibuat (misal dari sesi konsultasi), kembalikan langsung
	existing, _ := s.invoiceRepo.FindByVisitID(visitID)
	if existing != nil {
		return existing, nil
	}

	visit, err := s.visitRepo.FindByID(visitID)
	if err != nil {
		return nil, errors.New("data kunjungan tidak ditemukan")
	}

	totalAmount := input.TotalAmount
	if totalAmount == 0 {
		totalAmount = input.TotalConsultationFee + input.TotalMedicineFee
	}

	method := input.PaymentMethod
	if method == "" {
		method = input.PaymentMethodAlt
	}
	if method == "" {
		method = "CASH"
	}

	now := time.Now()
	invoice := models.Invoice{
		VisitID:              visit.ID,
		InvoiceNo:            fmt.Sprintf("INV-%d-%d", now.Unix(), visit.ID),
		TotalConsultationFee: input.TotalConsultationFee,
		TotalMedicineFee:     input.TotalMedicineFee,
		TotalAmount:          totalAmount,
		Status:               "UNPAID",
		PaymentMethod:        method,
		CreatedAt:            now,
		UpdatedAt:            now,
	}

	if err := s.invoiceRepo.Create(&invoice); err != nil {
		return nil, err
	}
	return &invoice, nil
}

func (s *invoiceService) PayInvoice(id uint, method string) (*models.Invoice, error) {
	invoice, err := s.invoiceRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("invoice tidak ditemukan")
	}

	now := time.Now()
	invoice.Status = "PAID"
	invoice.PaymentMethod = method
	invoice.PaidAt = &now
	invoice.UpdatedAt = now

	if err := s.invoiceRepo.Update(invoice); err != nil {
		return nil, err
	}

	// Update status kunjungan menjadi COMPLETED
	_ = s.visitRepo.UpdateStatus(invoice.VisitID, "COMPLETED")

	if s.wsHub != nil {
		s.wsHub.BroadcastQueue(map[string]interface{}{
			"type":      "INVOICE_PAID",
			"invoiceId": invoice.ID,
			"visitId":   invoice.VisitID,
		})
	}

	return invoice, nil
}

func (s *invoiceService) GetMidtransSnapToken(invoiceID uint, userID uint, userRole string) (*MidtransSnapResponse, error) {
	invoice, err := s.invoiceRepo.FindByID(invoiceID)
	if err != nil || invoice == nil {
		return nil, errors.New("Tagihan invoice tidak ditemukan")
	}

	if invoice.Status == "PAID" {
		return nil, errors.New("Tagihan invoice ini sudah lunas sebelumnya")
	}

	// Jika pemanggil adalah pasien (CUSTOMER), pastikan ini tagihan miliknya
	if userRole == "CUSTOMER" && userID > 0 {
		patient, err := s.patientRepo.FindByUserID(userID)
		if err != nil || patient == nil || (invoice.Visit != nil && invoice.Visit.PatientID != patient.ID) {
			return nil, errors.New("Anda tidak memiliki hak akses tagihan ini")
		}
	}

	var itemDetails []MidtransItemDetail
	doctorName := "Dokter"
	patientName := "Pasien"
	patientPhone := "08123456789"

	if invoice.Visit != nil {
		if invoice.Visit.Doctor != nil && invoice.Visit.Doctor.Name != "" {
			doctorName = invoice.Visit.Doctor.Name
		}
		if invoice.Visit.Patient != nil {
			if invoice.Visit.Patient.Name != "" {
				patientName = invoice.Visit.Patient.Name
			}
			if invoice.Visit.Patient.Phone != nil && *invoice.Visit.Patient.Phone != "" {
				patientPhone = *invoice.Visit.Patient.Phone
			}
		}
	}

	// 1. Fee Konsultasi Dokter
	consultationFee := int64(math.Round(invoice.TotalConsultationFee))
	if consultationFee > 0 {
		feeName := fmt.Sprintf("Jasa Dokter (%s)", doctorName)
		if len(feeName) > 50 {
			feeName = feeName[:50]
		}
		itemDetails = append(itemDetails, MidtransItemDetail{
			ID:       "FEE-DOKTER",
			Price:    consultationFee,
			Quantity: 1,
			Name:     feeName,
		})
	}

	// 2. Obat-obatan (jika ada)
	if invoice.Visit != nil && invoice.Visit.Consultation != nil {
		for _, m := range invoice.Visit.Consultation.ConsultationMedicines {
			medName := "Obat"
			if m.Medicine != nil && m.Medicine.Name != "" {
				medName = m.Medicine.Name
			}
			if len(medName) > 50 {
				medName = medName[:50]
			}
			itemDetails = append(itemDetails, MidtransItemDetail{
				ID:       fmt.Sprintf("MED-%d", m.MedicineID),
				Price:    int64(math.Round(m.Price)),
				Quantity: m.Qty,
				Name:     medName,
			})
		}
	}

	grossAmount := int64(math.Round(invoice.TotalAmount))

	// Midtrans mewajibkan gross_amount == sum(itemDetails.price * quantity)
	var sumItems int64
	for _, item := range itemDetails {
		sumItems += item.Price * int64(item.Quantity)
	}

	if sumItems != grossAmount || len(itemDetails) == 0 {
		itemDetails = []MidtransItemDetail{
			{
				ID:       fmt.Sprintf("INV-%d", invoice.ID),
				Price:    grossAmount,
				Quantity: 1,
				Name:     fmt.Sprintf("Tagihan %s", invoice.InvoiceNo),
			},
		}
	}

	// Tambahkan unix timestamp pada order_id agar selalu generate token baru di sandbox
	orderID := fmt.Sprintf("%s-%d", invoice.InvoiceNo, time.Now().Unix())

	payload := MidtransSnapPayload{
		TransactionDetails: MidtransTransactionDetails{
			OrderID:     orderID,
			GrossAmount: grossAmount,
		},
		ItemDetails: itemDetails,
		CustomerDetails: MidtransCustomerDetails{
			FirstName: patientName,
			Phone:     patientPhone,
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	if serverKey == "" {
		serverKey = "SB-Mid-server-wQg5dLb3EIDT4kWSGKh4qv6y"
	}
	isProd := os.Getenv("MIDTRANS_IS_PRODUCTION") == "true"
	snapURL := "https://app.sandbox.midtrans.com/snap/v1/transactions"
	if isProd {
		snapURL = "https://app.midtrans.com/snap/v1/transactions"
	}

	req, err := http.NewRequest("POST", snapURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}

	authHeader := "Basic " + base64.StdEncoding.EncodeToString([]byte(serverKey+":"))
	req.Header.Set("Authorization", authHeader)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("gagal menghubungi Midtrans: %w", err)
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("midtrans error (%d): %s", resp.StatusCode, string(respBytes))
	}

	var snapResp struct {
		Token       string `json:"token"`
		RedirectURL string `json:"redirect_url"`
	}
	if err := json.Unmarshal(respBytes, &snapResp); err != nil {
		return nil, fmt.Errorf("gagal membaca respon Midtrans: %w", err)
	}

	return &MidtransSnapResponse{
		Token:       snapResp.Token,
		RedirectURL: snapResp.RedirectURL,
		InvoiceNo:   invoice.InvoiceNo,
		TotalAmount: invoice.TotalAmount,
	}, nil
}
