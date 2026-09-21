package handler

import (
	"clinic_backend_go/internal/service"
	"clinic_backend_go/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type InvoiceHandler struct {
	invoiceService service.InvoiceService
}

func NewInvoiceHandler(invoiceService service.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{invoiceService: invoiceService}
}

func (h *InvoiceHandler) GetAllInvoices(c *gin.Context) {
	invoices, err := h.invoiceService.GetAllInvoices()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil daftar tagihan", err.Error())
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "", invoices)
}

func (h *InvoiceHandler) GetInvoiceByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID invoice tidak valid")
		return
	}

	invoice, err := h.invoiceService.GetInvoiceByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Invoice tidak ditemukan")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil mengambil data Invoice dengan Id "+strconv.Itoa(id), invoice)
}

func (h *InvoiceHandler) CreateInvoice(c *gin.Context) {
	var input service.CreateInvoiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Input invoice tidak valid", err.Error())
		return
	}

	invoice, err := h.invoiceService.CreateInvoice(input)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Berhasil membuat invoice", invoice)
}

func (h *InvoiceHandler) PayInvoice(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID invoice tidak valid")
		return
	}

	var input service.PayInvoiceInput
	_ = c.ShouldBindJSON(&input)

	method := input.GetPaymentMethod()
	invoice, err := h.invoiceService.PayInvoice(uint(id), method)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil melakukan pembayaran invoice", invoice)
}

func (h *InvoiceHandler) GetMidtransSnapToken(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "ID invoice tidak valid")
		return
	}

	userID := c.GetUint("UserID")
	role := c.GetString("Role")

	data, err := h.invoiceService.GetMidtransSnapToken(uint(id), userID, role)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Berhasil generate Midtrans snap token", data)
}