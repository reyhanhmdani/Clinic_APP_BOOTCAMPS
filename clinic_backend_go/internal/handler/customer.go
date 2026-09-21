package handler

import (
	"clinic_backend_go/internal/service"
	"clinic_backend_go/pkg/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CustomerHandler struct {
	customerService service.CustomerService
}

func NewCustomerHandler(customerService service.CustomerService) *CustomerHandler {
	return &CustomerHandler{customerService: customerService}
}

func (h *CustomerHandler) CheckNIK(c *gin.Context) {
	nik := c.Param("nik")
	res, err := h.customerService.CheckNIK(nik)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, res.Message, res)
}

func (h *CustomerHandler) RegisterProfile(c *gin.Context) {
	userID := c.GetUint("UserID")
	var input service.CreatePatientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", err.Error())
		return
	}

	patient, err := h.customerService.RegisterProfile(userID, input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Profil data pasien berhasil didaftarkan dan terhubung ke akun anda", patient)
}

func (h *CustomerHandler) GetProfile(c *gin.Context) {
	userID := c.GetUint("UserID")
	profile, err := h.customerService.GetProfile(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	msg := "Profil pasien belum dilengkapi"
	if profile != nil {
		msg = "Profile pasien berhasil diambil"
	}

	utils.SuccessResponse(c, http.StatusOK, msg, profile)
}

func (h *CustomerHandler) GetActiveDoctors(c *gin.Context) {
	doctors, err := h.customerService.GetActiveDoctors()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil daftar dokter aktif", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil daftar dokter aktif", doctors)
}

func (h *CustomerHandler) BookVisit(c *gin.Context) {
	userID := c.GetUint("UserID")
	var input service.BookVisitInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Silahkan pilih dokter yang bertugas", err.Error())
		return
	}

	visit, err := h.customerService.BookVisit(userID, input.DoctorID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Berhasil mendaftarkan antrian dokter", visit)
}

func (h *CustomerHandler) GetActiveVisit(c *gin.Context) {
	userID := c.GetUint("UserID")
	activeData, err := h.customerService.GetActiveVisit(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	msg := "Tidak ada antrian aktif saat ini"
	if activeData != nil {
		msg = "Antrian aktif ditemukan"
	}

	utils.SuccessResponse(c, http.StatusOK, msg, activeData)
}

func (h *CustomerHandler) GetHistory(c *gin.Context) {
	userID := c.GetUint("UserID")
	history, err := h.customerService.GetHistory(userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil riwayat kunjungan dan resep medis", history)
}

func (h *CustomerHandler) PayInvoice(c *gin.Context) {
	userID := c.GetUint("UserID")
	var input service.PayCustomerInvoiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID invoice wajib disertakan", err.Error())
		return
	}

	invoice, err := h.customerService.PayInvoice(userID, input.InvoiceID, input.PaymentMethod)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil membayar tagihan (LUNAS)", invoice)
}
