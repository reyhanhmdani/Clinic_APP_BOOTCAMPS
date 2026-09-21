package handler

import (
	"clinic_backend_go/internal/service"
	"clinic_backend_go/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type MedicineHandler struct {
	medService service.MedicineService
}

func NewMedicineHandler(medService service.MedicineService) *MedicineHandler {
	return &MedicineHandler{medService: medService}
}

func (h *MedicineHandler) GetAllMedicines(c *gin.Context) {
	medicines, err := h.medService.GetAllMedicines()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil inventori obat", err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "Berhasil", medicines)
}

func (h *MedicineHandler) GetMedicineByID(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id obat tidak valid")
		return
	}

	med, err := h.medService.GetMedicineByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Data obat tidak ditemukan")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil data medicine dengan Id "+strconv.Itoa(id), med)
}

func (h *MedicineHandler) CreateMedicine(c *gin.Context) {
	var input service.CreateMedicineInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input obat tidak valid", err.Error())
		return
	}

	med, err := h.medService.CreateMedicine(input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal menyimpan obat", err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Berhasil Membuat Data baru dengan no "+strconv.Itoa(int(med.ID)), med)
}

func (h *MedicineHandler) UpdateMedicine(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id obat tidak valid")
		return
	}

	var input service.UpdateMedicineInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input obat tidak valid", err.Error())
		return
	}

	med, err := h.medService.UpdateMedicine(uint(id), input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengUpdate data medicine dengan Id "+strconv.Itoa(id), med)
}

func (h *MedicineHandler) DeleteMedicine(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id obat tidak valid")
		return
	}

	if err := h.medService.DeleteMedicine(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil menghapus medicine dengan id "+strconv.Itoa(id), nil)
}
