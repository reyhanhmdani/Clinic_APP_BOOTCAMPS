package handler

import (
	"clinic_backend_go/internal/service"
	"clinic_backend_go/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PharmacyHandler struct {
	pharmacyService service.PharmacyService
}

func NewPharmacyHandler(pharmacyService service.PharmacyService) *PharmacyHandler {
	return &PharmacyHandler{pharmacyService: pharmacyService}
}

func (h *PharmacyHandler) GetQueue(c *gin.Context) {
	data, err := h.pharmacyService.GetQueue()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil antrean farmasi", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil antrian farmasi", data)
}

func (h *PharmacyHandler) DispenseMedicine(c *gin.Context) {
	idParam := c.Param("id")
	if idParam == "" {
		idParam = c.Param("consultationId")
	}

	consultationID, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID konsultasi tidak valid")
		return
	}

	data, err := h.pharmacyService.DispenseMedicine(uint(consultationID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Obat berhasil di serahkan kepada pasien", data)
}
