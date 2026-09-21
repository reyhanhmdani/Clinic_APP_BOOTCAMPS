package repository

import (
	"clinic_backend_go/internal/models"
	"errors"
	"time"

	"gorm.io/gorm"
)

type PharmacyRepository interface {
	GetPharmacyQueue() ([]models.Consultation, error)
	FindConsultationByID(id uint) (*models.Consultation, error)
	Dispense(consultationID uint) (*models.Consultation, error)
}

type pharmacyRepository struct {
	db *gorm.DB
}

func NewPharmacyRepository(db *gorm.DB) PharmacyRepository {
	return &pharmacyRepository{db: db}
}

func (r *pharmacyRepository) GetPharmacyQueue() ([]models.Consultation, error) {
	var allConsultations []models.Consultation
	err := r.db.
		Joins("JOIN visits ON visits.id = consultations.visit_id").
		Joins("JOIN invoice ON invoice.visit_id = visits.id").
		Where("invoice.status = ?", "PAID").
		Preload("Visit.Patient").
		Preload("Visit.Doctor").
		Preload("Visit.Invoice").
		Preload("ConsultationMedicines.Medicine").
		Order("consultations.created_at desc").
		Find(&allConsultations).Error

	if err != nil {
		return nil, err
	}

	var withMedicines []models.Consultation
	for _, c := range allConsultations {
		if len(c.ConsultationMedicines) > 0 {
			withMedicines = append(withMedicines, c)
		}
	}

	return withMedicines, nil
}

func (r *pharmacyRepository) FindConsultationByID(id uint) (*models.Consultation, error) {
	var consultation models.Consultation
	err := r.db.
		Preload("Visit.Patient").
		Preload("Visit.Doctor").
		Preload("Visit.Invoice").
		Preload("ConsultationMedicines.Medicine").
		First(&consultation, id).Error

	if err != nil {
		return nil, err
	}
	return &consultation, nil
}

func (r *pharmacyRepository) Dispense(consultationID uint) (*models.Consultation, error) {
	var result models.Consultation

	err := r.db.Transaction(func(tx *gorm.DB) error {
		var consultation models.Consultation
		if err := tx.Preload("Visit.Invoice").Preload("ConsultationMedicines").First(&consultation, consultationID).Error; err != nil {
			return errors.New("Data konsul resep ga nemu")
		}

		if consultation.Visit == nil || consultation.Visit.Invoice == nil || consultation.Visit.Invoice.Status != "PAID" {
			return errors.New("Tagihan kasir belum lunas! obat belum bisa di serahkan sebelum pembayaran")
		}

		if consultation.IsDispensed {
			return errors.New("Obat untuk konsul ini sudah pernah di serahkan sebelumnya")
		}

		// Kurangi stok masing-masing obat
		for _, item := range consultation.ConsultationMedicines {
			var med models.Medicine
			if err := tx.First(&med, item.MedicineID).Error; err != nil {
				return errors.New("Obat tidak ditemukan di database")
			}

			if med.Stock < item.Qty {
				return errors.New("Stok obat " + med.Name + " tidak mencukupi")
			}

			if err := tx.Model(&med).Update("stock", med.Stock-item.Qty).Error; err != nil {
				return err
			}
		}

		now := time.Now()
		if err := tx.Model(&models.Consultation{}).
			Where("id = ?", consultationID).
			Updates(map[string]interface{}{
				"isDispensed": true,
				"dispensedAt": now,
				"updated_at":  now,
			}).Error; err != nil {
			return err
		}

		return tx.Preload("Visit.Patient").
			Preload("Visit.Doctor").
			Preload("Visit.Invoice").
			Preload("ConsultationMedicines.Medicine").
			First(&result, consultationID).Error
	})

	if err != nil {
		return nil, err
	}
	return &result, nil
}
