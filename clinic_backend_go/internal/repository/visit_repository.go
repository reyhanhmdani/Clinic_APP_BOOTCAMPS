package repository

import (
	"clinic_backend_go/internal/models"
	"time"

	"gorm.io/gorm"
)

type VisitRepository interface {
	FindAll() ([]models.Visit, error)
	FindTodayVisits() ([]models.Visit, error)
	FindByID(id uint) (*models.Visit, error)
	CountDoctorVisitsToday(doctorID uint) (int64, error)
	GetMaxQueueNumberToday() (int, error)
	FindActiveVisitByPatientID(patientID uint) (*models.Visit, error)
	CountQueueAhead(doctorId uint, queueNumber int) (int64, error)
	Create(visit *models.Visit) error
	Update(visit *models.Visit) error
	UpdateStatus(id uint, status string) error
}

type visitRepository struct {
	db *gorm.DB
}

func NewVisitRepository(db *gorm.DB) VisitRepository {
	return &visitRepository{db: db}
}

func (r *visitRepository) FindAll() ([]models.Visit, error) {
	var visits []models.Visit
	err := r.db.Preload("Patient").
		Preload("Doctor").
		Preload("Invoice").
		Preload("Consultation.ConsultationMedicines.Medicine").
		Order("visit_date desc, queue_number desc").
		Find(&visits).Error
	return visits, err
}

func (r *visitRepository) FindTodayVisits() ([]models.Visit, error) {
	todayStart := time.Now().Truncate(24 * time.Hour)
	todayEnd := todayStart.Add(24 * time.Hour)

	var visits []models.Visit
	err := r.db.Where("visit_date >= ? AND visit_date < ?", todayStart, todayEnd).
		Preload("Patient").
		Preload("Doctor").
		Preload("Invoice").
		Preload("Consultation.ConsultationMedicines.Medicine").
		Order("queue_number asc").Find(&visits).Error
	return visits, err
}

func (r *visitRepository) FindByID(id uint) (*models.Visit, error) {
	var visit models.Visit
	err := r.db.Preload("Patient").
		Preload("Doctor").
		Preload("Invoice").
		Preload("Consultation.ConsultationMedicines.Medicine").
		First(&visit, id).Error
	if err != nil {
		return nil, err
	}
	return &visit, nil
}

func (r *visitRepository) CountDoctorVisitsToday(doctorID uint) (int64, error) {
	todayStart := time.Now().Truncate(24 * time.Hour)
	todayEnd := todayStart.Add(24 * time.Hour)

	var count int64
	err := r.db.Model(&models.Visit{}).
		Where("doctor_id = ? AND visit_date >= ? AND visit_date < ?", doctorID, todayStart, todayEnd).
		Count(&count).Error
	return count, err
}

func (r *visitRepository) GetMaxQueueNumberToday() (int, error) {
	todayStart := time.Now().Truncate(24 * time.Hour)
	todayEnd := todayStart.Add(24 * time.Hour)

	var maxQueue int
	row := r.db.Model(&models.Visit{}).
		Where("visit_date >= ? AND visit_date < ?", todayStart, todayEnd).
		Select("COALESCE(MAX(queue_number), 0)").
		Row()
	err := row.Scan(&maxQueue)
	return maxQueue, err
}

func (r *visitRepository) FindActiveVisitByPatientID(patientID uint) (*models.Visit, error) {
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	todayEnd := todayStart.Add(24 * time.Hour)

	var visits []models.Visit
	err := r.db.Where("patient_id = ? AND visit_date >= ? AND visit_date < ?", patientID, todayStart, todayEnd).
		Preload("Doctor").
		Preload("Patient").
		Preload("Invoice").
		Preload("Consultation.ConsultationMedicines.Medicine").
		Order("created_at DESC").
		Find(&visits).Error
	if err != nil {
		return nil, err
	}

	// Filter status aktif sesuai siklus kunjungan pasien (sama persis dengan Express)
	for _, v := range visits {
		// 1. Masih menunggu giliran atau sedang diperiksa dokter
		if v.Status == "WAITING" || v.Status == "IN_KONSULTASI" {
			return &v, nil
		}
		// 2. Dokter selesai periksa, tapi tagihan belum dibayar di kasir
		if v.Invoice != nil && v.Invoice.Status == "UNPAID" {
			return &v, nil
		}
		// 3. Sudah bayar, tapi masih menunggu obat diserahkan oleh farmasi
		if v.Consultation != nil && len(v.Consultation.ConsultationMedicines) > 0 && !v.Consultation.IsDispensed {
			return &v, nil
		}
	}

	return nil, nil
}

// Menghitung jumlah pasien yang sedang antre (WAITING) di depan pasien ini untuk dokter yang sama
func (r *visitRepository) CountQueueAhead(doctorID uint, queueNumber int) (int64, error) {
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	todayEnd := todayStart.Add(24 * time.Hour)

	var count int64
	err := r.db.Model(&models.Visit{}).
		Where("doctor_id = ? AND visit_date >= ? AND visit_date < ? AND status = ? AND queue_number < ?",
			doctorID, todayStart, todayEnd, "WAITING", queueNumber).
		Count(&count).Error
	return count, err
}

func (r *visitRepository) Create(visit *models.Visit) error {
	return r.db.Create(visit).Error
}

func (r *visitRepository) Update(visit *models.Visit) error {
	return r.db.Save(visit).Error
}

func (r *visitRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&models.Visit{}).Where("id = ?", id).Update("status", status).Error
}
