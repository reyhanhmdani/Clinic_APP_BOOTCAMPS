package repository

import (
	"clinic_backend_go/internal/models"

	"gorm.io/gorm"
)

type InvoiceRepository interface {
	FindAll() ([]models.Invoice, error)
	FindByID(id uint) (*models.Invoice, error)
	FindByVisitID(visitID uint) (*models.Invoice, error)
	Create(invoice *models.Invoice) error
	Update(invoice *models.Invoice) error
}

type invoiceRepository struct {
	db *gorm.DB
}

func NewInvoiceRepository(db *gorm.DB) InvoiceRepository {
	return &invoiceRepository{db: db}
}

func (r *invoiceRepository) FindAll() ([]models.Invoice, error) {
	var invoices []models.Invoice
	err := r.db.Preload("Visit.Patient").Preload("Visit.Doctor").Order("id desc").Find(&invoices).Error
	return invoices, err
}

func (r *invoiceRepository) FindByID(id uint) (*models.Invoice, error) {
	var invoice models.Invoice
	err := r.db.Preload("Visit.Patient").
		Preload("Visit.Doctor").
		Preload("Visit.Consultation.ConsultationMedicines.Medicine").
		First(&invoice, id).Error
	if err != nil {
		return nil, err
	}
	return &invoice, nil
}

func (r *invoiceRepository) FindByVisitID(visitID uint) (*models.Invoice, error) {
	var invoice models.Invoice
	err := r.db.Preload("Visit.Patient").Preload("Visit.Doctor").Where("visit_id = ?", visitID).First(&invoice).Error
	if err != nil {
		return nil, err
	}
	return &invoice, nil
}

func (r *invoiceRepository) Create(invoice *models.Invoice) error {
	return r.db.Create(invoice).Error
}

func (r *invoiceRepository) Update(invoice *models.Invoice) error {
	return r.db.Save(invoice).Error
}