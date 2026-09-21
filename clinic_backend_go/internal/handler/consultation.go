package handler

import (
	"clinic_backend_go/internal/service"
	"clinic_backend_go/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ConsultationHandler struct {
	consultationService service.ConsultationService
}

func NewConsultationHandler(consultationService service.ConsultationService) *ConsultationHandler {
	return &ConsultationHandler{consultationService: consultationService}
}

func (h *ConsultationHandler) GetAllConsultations(c *gin.Context) {
	consultations, err := h.consultationService.GetAllConsultations()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil data konsultasi", err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", consultations)
}

func (h *ConsultationHandler) GetConsultationByID(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id konsultasi tidak valid")
		return
	}

	consultation, err := h.consultationService.GetConsultationByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Data konsultasi tidak ditemukan")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil data Konsultasi dengan id "+strconv.Itoa(id), consultation)
}

func (h *ConsultationHandler) CreateConsultation(c *gin.Context) {
	var input service.CreateConsultationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input rekam medis tidak valid", err.Error())
		return
	}

	consultation, invoice, err := h.consultationService.ProcessConsultation(input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Berhasil Membuat Data baru dengan id "+strconv.Itoa(int(consultation.ID)), gin.H{
		"consultation": consultation,
		"invoice":      invoice,
	})
}

func (h *ConsultationHandler) UpdateConsultation(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id konsultasi tidak valid")
		return
	}

	var input service.UpdateConsultationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", err.Error())
		return
	}

	consultation, err := h.consultationService.UpdateConsultation(uint(id), input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengUpdate data Konsultasi dengan Id "+strconv.Itoa(id), consultation)
}
