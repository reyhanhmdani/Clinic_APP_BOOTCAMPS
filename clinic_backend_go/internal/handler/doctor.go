package handler

import (
	"clinic_backend_go/internal/service"
	"clinic_backend_go/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DoctorHandler struct {
	doctorService service.DoctorService
}

func NewDoctorHandler(doctorService service.DoctorService) *DoctorHandler {
	return &DoctorHandler{doctorService: doctorService}
}

func (h *DoctorHandler) GetAllDoctors(c *gin.Context) {
	doctors, err := h.doctorService.GetAllDoctors()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil data dokter", err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", doctors)
}

func (h *DoctorHandler) GetDoctorByID(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id dokter tidak valid")
		return
	}

	doctor, err := h.doctorService.GetDoctorByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Dokter tidak ditemukan")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil data Doctor dengan Id "+strconv.Itoa(id), doctor)
}

func (h *DoctorHandler) CreateDoctor(c *gin.Context) {
	var input service.CreateDoctorInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", err.Error())
		return
	}

	doctor, err := h.doctorService.CreateDoctor(input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal menyimpan data dokter", err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Berhasil Membuat Data baru dengan no "+strconv.Itoa(int(doctor.ID)), doctor)
}

func (h *DoctorHandler) UpdateDoctor(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id dokter tidak valid")
		return
	}

	var input service.UpdateDoctorInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input tidak valid", err.Error())
		return
	}

	doctor, err := h.doctorService.UpdateDoctor(uint(id), input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengUpdate data Doctor dengan Id "+strconv.Itoa(id), doctor)
}

func (h *DoctorHandler) DeleteDoctor(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id dokter tidak valid")
		return
	}

	if err := h.doctorService.DeleteDoctor(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil menghapus Doctor dengan id "+strconv.Itoa(id), nil)
}
