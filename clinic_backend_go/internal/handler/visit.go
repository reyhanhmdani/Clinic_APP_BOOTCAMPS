package handler

import (
	"clinic_backend_go/internal/service"
	"clinic_backend_go/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type VisitHandler struct {
	visitService service.VisitService
}

func NewVisitHandler(visitService service.VisitService) *VisitHandler {
	return &VisitHandler{visitService: visitService}
}

func (h *VisitHandler) GetAllVisits(c *gin.Context) {
	visits, err := h.visitService.GetAllVisits()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil daftar kunjungan", err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", visits)
}

func (h *VisitHandler) GetTodayVisits(c *gin.Context) {
	visits, err := h.visitService.GetTodayVisits()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil daftar antrean", err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", visits)
}

func (h *VisitHandler) GetVisitByID(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id visit tidak valid")
		return
	}

	visit, err := h.visitService.GetVisitByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Data visit tidak ditemukan")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil data Visit dengan Id "+strconv.Itoa(id), visit)
}

func (h *VisitHandler) CreateVisit(c *gin.Context) {
	var input service.CreateVisitInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input antrean tidak valid", err.Error())
		return
	}

	visit, err := h.visitService.RegisterVisit(input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal membuat antrean", err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, "Berhasil Membuat Data baru dengan Id "+strconv.Itoa(int(visit.ID)), visit)
}

func (h *VisitHandler) UpdateVisit(c *gin.Context) {
	idParams := c.Param("id")
	id, err := strconv.Atoi(idParams)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Id visit tidak valid")
		return
	}

	var input service.UpdateVisitInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input antrean tidak valid", err.Error())
		return
	}

	visit, err := h.visitService.UpdateVisit(uint(id), input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengUpdate data Visit dengan Id "+strconv.Itoa(id), visit)
}
