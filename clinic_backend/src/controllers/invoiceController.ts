import { Request, Response, NextFunction } from 'express';
import {
  createInvoiceService,
  getAllInvoiceService,
  getInvoiceByIdService,
  getMidtransSnapTokenService,
  handleMidtransNotificationService,
  payCustomerInvoiceService,
  payInvoiceService,
} from '../services/invoiceService.js';
import { ApiError } from '../utils/apiError.js';

export const getAllInvoiceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await getAllInvoiceService();
    return res.status(200).json({
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

export const createInvoiceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createInvoice = await createInvoiceService(req.body);

    return res.status(201).json({
      message: 'Berhasil membuat invoice',
      data: createInvoice,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idInvoice } = req.params;
    const getInvoice = await getInvoiceByIdService(Number(idInvoice));

    return res.status(200).json({
      message: `Berhasil mengambil data Invoice dengan Id ${getInvoice.id}`,
      data: getInvoice,
    });
  } catch (error) {
    next(error);
  }
};

export const payInvoiceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idInvoice } = req.params;
    const payInvoice = await payInvoiceService(Number(idInvoice), req.body);

    return res.status(200).json({
      message: 'Berhasil melakukan pembayaran invoice',
      data: payInvoice,
    });
  } catch (error) {
    next(error);
  }
};

// CUSTOMERS
export const payCustomerInvoiceController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { invoiceId, paymentMethod } = req.body;

    if (!invoiceId) throw new ApiError(400, 'ID invoice wajib di sertakan');

    const paidInvoice = await payCustomerInvoiceService(userId, Number(invoiceId), paymentMethod);
    return res.status(200).json({
      message: 'Berhasil membayar tagihan (LUNAS)',
      data: paidInvoice,
    });
  } catch (error) {
    next(error);
  }
};

export const getMidtransSnaptokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idInvoice } = req.params;
    const user = (req as any).user;

    // Hanya validasi pasien jika yang memanggil adalah role CUSTOMER
    const userId = user?.role === 'CUSTOMER' ? user.id : undefined;
    const data = await getMidtransSnapTokenService(Number(idInvoice), userId);

    return res.status(200).json({
      message: 'Berhasil generate Midtrans snap token',
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

export const handleMidtransNotificationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await handleMidtransNotificationService(req.body);

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
