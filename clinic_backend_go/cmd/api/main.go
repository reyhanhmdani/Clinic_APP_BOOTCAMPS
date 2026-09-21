package main

import (
	"clinic_backend_go/internal/config"
	"clinic_backend_go/internal/database"
	"clinic_backend_go/internal/handler"
	"clinic_backend_go/internal/middleware"
	"clinic_backend_go/internal/repository"
	"clinic_backend_go/internal/service"
	"clinic_backend_go/internal/ws"
	"fmt"
	"net/http"
	"runtime"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Muat Config & Database
	cfg := config.LoadConfig()
	database.ConnectDB(cfg.DatabaseUrl)

	// 2. Start WebSocket Hub
	hub := ws.NewHub()
	go hub.Run()

	// 3. Inisialisasi Seluruh Layer Repository (Query DB)
	userRepo := repository.NewUserRepository(database.DB)
	patientRepo := repository.NewPatientRepository(database.DB)
	doctorRepo := repository.NewDoctorRepository(database.DB)
	medicineRepo := repository.NewMedicineRepository(database.DB)
	visitRepo := repository.NewVisitRepository(database.DB)
	consultationRepo := repository.NewConsultationRepository(database.DB)
	invoiceRepo := repository.NewInvoiceRepository(database.DB)
	pharmacyRepo := repository.NewPharmacyRepository(database.DB)

	// 4. Inisialisasi Seluruh Layer Service (Business Logic)
	authService := service.NewAuthService(userRepo, cfg.JWTSecret)
	patientService := service.NewPatientService(patientRepo)
	doctorService := service.NewDoctorService(doctorRepo)
	medicineService := service.NewMedicineService(medicineRepo)
	visitService := service.NewVisitService(visitRepo, hub)
	consultationService := service.NewConsultationService(consultationRepo, visitRepo, medicineRepo, invoiceRepo, hub)
	invoiceService := service.NewInvoiceService(invoiceRepo, visitRepo, patientRepo, hub)
	customerService := service.NewCustomerService(patientRepo, doctorRepo, visitRepo, invoiceRepo, hub)
	pharmacyService := service.NewPharmacyService(pharmacyRepo, hub)

	// 5. Inisialisasi Seluruh Layer Handler (HTTP Delivery)
	authHandler := handler.NewAuthHandler(authService)
	patientHandler := handler.NewPatientHandler(patientService)
	doctorHandler := handler.NewDoctorHandler(doctorService)
	medicineHandler := handler.NewMedicineHandler(medicineService)
	visitHandler := handler.NewVisitHandler(visitService)
	consultationHandler := handler.NewConsultationHandler(consultationService)
	invoiceHandler := handler.NewInvoiceHandler(invoiceService)
	customerHandler := handler.NewCustomerHandler(customerService)
	pharmacyHandler := handler.NewPharmacyHandler(pharmacyService)

	// 6. Setup Gin Engine
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	// 7. WebSocket Route
	r.GET("/ws", hub.HandleWS)

	// 8. Public Health Check
	r.GET("/api/v1/health", func(c *gin.Context) {
		var m runtime.MemStats
		runtime.ReadMemStats(&m)

		c.JSON(http.StatusOK, gin.H{
			"status":          "online",
			"runtime":         runtime.Version(),
			"database":        "Connected to PostgreSQL via GORM",
			"memory_alloc_mb": fmt.Sprintf("%.2f MB", float64(m.Alloc)/1024/1024),
		})
	})

	// 9. Grouping API Routes
	v1 := r.Group("/api/v1")
	{
		// Auth Routes (Public)
		auth := v1.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
			auth.POST("/google", authHandler.GoogleAuth)
			auth.GET("/users", authHandler.GetAllUsers)
		}

		// Protected Routes (Harus Login)
		protected := v1.Group("/")
		protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			// Auth (Protected: Link Google)
			protected.POST("/auth/link-google", authHandler.LinkGoogle)

			// 1. Shared Routes (Admin & Customer)
			protected.PATCH("/visits/:id", middleware.RequireRoles("ADMIN", "CUSTOMER"), visitHandler.UpdateVisit)
			protected.POST("/invoices/:id/midtrans-token", middleware.RequireRoles("ADMIN", "CUSTOMER"), invoiceHandler.GetMidtransSnapToken)

			// 2. Customers Portal (Pasien Mandiri & Admin Testing)
			customers := protected.Group("/customers")
			customers.Use(middleware.RequireRoles("CUSTOMER", "ADMIN"))
			{
				customers.GET("/check-nik/:nik", customerHandler.CheckNIK)
				customers.POST("/profile", customerHandler.RegisterProfile)
				customers.GET("/profile", customerHandler.GetProfile)
				customers.GET("/doctors", customerHandler.GetActiveDoctors)
				customers.POST("/book-visit", customerHandler.BookVisit)
				customers.GET("/active-visit", customerHandler.GetActiveVisit)
				customers.GET("/history", customerHandler.GetHistory)
				customers.POST("/pay-invoice", customerHandler.PayInvoice)
			}

			// 3. Admin Only Routes (Kelola Pasien, Dokter, Obat, Poli, Kasir, Farmasi)
			admin := protected.Group("/")
			admin.Use(middleware.RequireRoles("ADMIN"))
			{
				// Patients
				admin.GET("/patients", patientHandler.GetAllPatients)
				admin.POST("/patients", patientHandler.CreatePatient)
				admin.GET("/patients/:id", patientHandler.GetPatientById)
				admin.PATCH("/patients/:id", patientHandler.UpdatePatient)
				admin.DELETE("/patients/:id", patientHandler.DeletePatient)
				admin.GET("/patients/:id/history", patientHandler.GetPatientHistory)

				// Doctors
				admin.GET("/doctors", doctorHandler.GetAllDoctors)
				admin.POST("/doctors", doctorHandler.CreateDoctor)
				admin.GET("/doctors/:id", doctorHandler.GetDoctorByID)
				admin.PATCH("/doctors/:id", doctorHandler.UpdateDoctor)
				admin.DELETE("/doctors/:id", doctorHandler.DeleteDoctor)

				// Medicines
				admin.GET("/medicines", medicineHandler.GetAllMedicines)
				admin.POST("/medicines", medicineHandler.CreateMedicine)
				admin.GET("/medicines/:id", medicineHandler.GetMedicineByID)
				admin.PATCH("/medicines/:id", medicineHandler.UpdateMedicine)
				admin.DELETE("/medicines/:id", medicineHandler.DeleteMedicine)

				// Visits / Antrean Loket
				admin.GET("/visits", visitHandler.GetAllVisits)
				admin.POST("/visits", visitHandler.CreateVisit)
				admin.GET("/visits/:id", visitHandler.GetVisitByID)

				// Konsultasi Dokter & Rekam Medis
				admin.GET("/consultations", consultationHandler.GetAllConsultations)
				admin.POST("/consultations", consultationHandler.CreateConsultation)
				admin.GET("/consultations/:id", consultationHandler.GetConsultationByID)
				admin.PATCH("/consultations/:id", consultationHandler.UpdateConsultation)

				// Kasir & Invoices
				admin.GET("/invoices", invoiceHandler.GetAllInvoices)
				admin.POST("/invoices", invoiceHandler.CreateInvoice)
				admin.GET("/invoices/:id", invoiceHandler.GetInvoiceByID)
				admin.PATCH("/invoices/:id/pay", invoiceHandler.PayInvoice)

				// Apotek & Farmasi
				pharmacy := admin.Group("/pharmacy")
				{
					pharmacy.GET("/queue", pharmacyHandler.GetQueue)
					pharmacy.PATCH("/:id/dispense", pharmacyHandler.DispenseMedicine)
				}
			}
		}
	}

	// 10. Jalankan Server
	fmt.Printf("\n🚀 ReyClinic Golang Backend berjalan di port :%s\n", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		panic(err)
	}
}
