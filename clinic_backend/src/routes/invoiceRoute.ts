import { Router } from 'express';
import {
  createInvoiceController,
  getAllInvoiceController,
  getInvoiceByIdController,
  getMidtransSnaptokenController,
  payInvoiceController,
} from '../controllers/invoiceController.js';
import { validateZod } from '../middlewares/validateZod.js';
import { createInvoiceSchema, payInvoiceSchema } from '../validation/invoiceSchema.js';
import { authorization } from '../middlewares/authorization.js';

const router = Router();

// 1. Endpoint Generate Snap Token (Boleh diakses Admin & Customer)
router.post('/:idInvoice/midtrans-token', authorization('ADMIN', 'CUSTOMER'), getMidtransSnaptokenController);

// 2. Endpoint Khusus Admin Kasir
router.get('/', authorization('ADMIN'), getAllInvoiceController);
router.post('/', authorization('ADMIN'), validateZod(createInvoiceSchema), createInvoiceController);
router.get('/:idInvoice', authorization('ADMIN'), getInvoiceByIdController);
router.patch('/:idInvoice/pay', authorization('ADMIN'), validateZod(payInvoiceSchema), payInvoiceController);

export default router;
