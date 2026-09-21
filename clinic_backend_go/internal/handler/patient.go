package handler

import (
	"clinic_backend_go/internal/service"
	"clinic_backend_go/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PatientHandler struct {
	patientService service.PatientService
}

func NewPatientHandler(patientService service.PatientService) *PatientHandler {
	return &PatientHandler{patientService: patientService}
}

func (h *PatientHandler) GetAllPatients(c *gin.Context) {
	patients, err := h.patientService.GetAllPatients()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil data")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", patients)
}

func (h *PatientHandler) GetPatientById(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id pasien tidak valid")
		return
	}

	patient, err := h.patientService.GetPatientById(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Pasien tidak ditemukan")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil data pasien dengan id "+strconv.Itoa(id), patient)
}

func (h *PatientHandler) CreatePatient(c *gin.Context) {
	var input service.CreatePatientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", err.Error())
		return
	}

	patient, err := h.patientService.RegisterPatient(input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Gagal menyimpan pasien", err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Data Pasien dengan Nama "+patient.Name+" Sudah Berhasil di Buat", patient)
}

func (h *PatientHandler) UpdatePatient(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id pasien tidak valid")
		return
	}

	var input service.UpdatePatientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", err.Error())
		return
	}

	patient, err := h.patientService.UpdatePatient(uint(id), input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengUpdate data pasien dengan Id "+strconv.Itoa(id), patient)
}

func (h *PatientHandler) DeletePatient(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id pasien tidak valid")
		return
	}

	if err := h.patientService.DeletePatient(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil menghapus pasien dengan id "+strconv.Itoa(id), nil)
}

func (h *PatientHandler) GetPatientHistory(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id pasien tidak valid")
		return
	}

	history, err := h.patientService.GetPatientHistory(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil riwayat rekam medis pasien", history)
}
