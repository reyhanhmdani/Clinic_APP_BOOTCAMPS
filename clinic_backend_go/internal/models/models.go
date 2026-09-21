package models

import "time"

// User mewakili tabel users
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  *string   `json:"username"`
	Email     string    `json:"email"`
	Password  *string   `json:"-"`
	Role      string    `json:"role"` // ADMIN, CUSTOMER
	GoogleID  *string   `json:"googleId,omitempty" gorm:"column:google_id"`
	Provider  string    `json:"provider"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	Patient *Patient `json:"patient,omitempty" gorm:"foreignKey:UserID"`
}

func (User) TableName() string { return "users" }

// Patient mewakili tabel patients
type Patient struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    *uint     `json:"userId,omitempty"`
	NIK       *string   `json:"nik,omitempty"`
	NoRM      string    `json:"noRm" gorm:"column:no_rm"` // Wajib column:no_rm karena NoRM beda konversi
	Name      string    `json:"name"`
	Gender    string    `json:"gender"` // MALE, FEMALE
	Age       int       `json:"age"`
	Phone     *string   `json:"phone,omitempty"`
	Address   *string   `json:"address,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`

	User   *User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Visits []Visit `json:"visits,omitempty" gorm:"foreignKey:PatientID"`
}

func (Patient) TableName() string { return "patients" }

// Doctor mewakili tabel doctors
type Doctor struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Gender    string    `json:"gender"`
	Spesialis string    `json:"spesialis"`
	Phone     *string   `json:"phone,omitempty"`
	Fee       float64   `json:"fee"`
	IsActive  bool      `json:"isActive" gorm:"column:is_active"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (Doctor) TableName() string { return "doctors" }

// Medicine mewakili tabel medicines
type Medicine struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Code      string    `json:"code"`
	Name      string    `json:"name"`
	Price     float64   `json:"price"`
	Stock     int       `json:"stock"`
	Unit      string    `json:"unit"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (Medicine) TableName() string { return "medicines" }

// Visit mewakili tabel visits (antrean poli & status pemeriksaan)
type Visit struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	PatientID   uint       `json:"patientId"`
	DoctorID    uint       `json:"doctorId"`
	QueueNumber int        `json:"queueNumber"`
	VisitDate   time.Time  `json:"visitDate"`
	Status      string     `json:"status"` // WAITING, IN_KONSULTASI, COMPLETED, CANCELLED
	CheckInTime *time.Time `json:"checkInTime,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`

	Patient      *Patient      `json:"patient,omitempty" gorm:"foreignKey:PatientID"`
	Doctor       *Doctor       `json:"doctor,omitempty" gorm:"foreignKey:DoctorID"`
	Consultation *Consultation `json:"consultation,omitempty" gorm:"foreignKey:VisitID"`
	Invoice      *Invoice      `json:"invoice,omitempty" gorm:"foreignKey:VisitID"`
}

func (Visit) TableName() string { return "visits" }

type Consultation struct {
	ID                    uint                   `json:"id" gorm:"primaryKey"`
	VisitID               uint                   `json:"visitId"`
	Complaint             string                 `json:"complaint"`
	Diagnosis             string                 `json:"diagnosis"`
	Notes                 *string                `json:"notes"`
	ConsultationFee       float64                `json:"consultationFee"`
	IsDispensed           bool                   `json:"isDispensed" gorm:"column:isDispensed"`
	DispensedAt           *time.Time             `json:"dispensedAt,omitempty" gorm:"column:dispensedAt"`
	CreatedAt             time.Time              `json:"createdAt"`
	UpdatedAt             time.Time              `json:"updatedAt"`
	ConsultationMedicines []ConsultationMedicine `json:"consultationMedicines,omitempty" gorm:"foreignKey:ConsultationID"`
	Visit                 *Visit                 `json:"visit,omitempty" gorm:"foreignKey:VisitID"`
}

func (Consultation) TableName() string { return "consultations" }

type ConsultationMedicine struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	ConsultationID uint      `json:"consultationId"`
	MedicineID     uint      `json:"medicineId"`
	Qty            int       `json:"qty"`
	Price          float64   `json:"price"`
	SubTotal       float64   `json:"subTotal"`
	Instructions   *string   `json:"instructions"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`

	Medicine *Medicine `json:"medicine" gorm:"foreignKey:MedicineID"`
}

func (ConsultationMedicine) TableName() string { return "consultation_medicine" }

// Invoice mewakili tagihan pembayaran kasir
type Invoice struct {
	ID                   uint       `json:"id" gorm:"primaryKey"`
	VisitID              uint       `json:"visitId"`
	InvoiceNo            string     `json:"invoiceNo"`
	TotalConsultationFee float64    `json:"totalConsultationFee"`
	TotalMedicineFee     float64    `json:"totalMedicineFee"`
	TotalAmount          float64    `json:"totalAmount"`
	Status               string     `json:"status"` // UNPAID, PAID, CANCELLED
	PaymentMethod        string     `json:"paymentMethod"`
	PaidAt               *time.Time `json:"paidAt,omitempty"`
	CreatedAt            time.Time  `json:"createdAt"`
	UpdatedAt            time.Time  `json:"updatedAt"`

	Visit *Visit `json:"visit,omitempty" gorm:"foreignKey:VisitID"`
}

func (Invoice) TableName() string { return "invoice" }
