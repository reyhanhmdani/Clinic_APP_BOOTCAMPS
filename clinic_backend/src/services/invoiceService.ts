import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { CreateInvoiceInput, payInvoiceInput } from '../validation/invoiceSchema.js';
import { getVisitByIdService } from './visitService.js';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';
import { io } from '../app.js';
import { snap } from '../config/midtrans.js';

const invoiceSelectPayload = {
  // 1. Field Utama Invoice (Faktur Kasir)
  id: true,
  invoiceNo: true,
  totalConsultationFee: true,
  totalMedicineFee: true,
  totalAmount: true,
  status: true,
  paymentMethod: true,
  paidAt: true,
  createdAt: true,

  // 2. Relasi ke Visit (Data Pasien, Dokter, Diagnosa, & Rincian Obat)
  visit: {
    select: {
      id: true,
      visitDate: true,
      patient: {
        select: {
          id: true,
          noRm: true,
          name: true,
          phone: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
          spesialis: true,
        },
      },
      consultation: {
        select: {
          id: true,
          complaint: true,
          diagnosis: true,
          notes: true,
          consultationMedicines: {
            select: {
              id: true,
              qty: true,
              price: true,
              subTotal: true,
              instructions: true,
              medicine: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  unit: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const getAllInvoiceService = async () => {
  const invoices = await prisma.invoice.findMany({
    select: {
      id: true,
      invoiceNo: true,
      totalConsultationFee: true,
      totalMedicineFee: true,
      totalAmount: true,
      status: true,
      paymentMethod: true,
      paidAt: true,
      visit: {
        select: {
          patient: { select: { name: true } },
          doctor: { select: { name: true } },
        },
      },
    },
  });

  if (invoices.length === 0) {
    throw new ApiError(404, 'Invoice nya kosong');
  }

  return invoices;
};

export const createInvoiceService = async (input: CreateInvoiceInput) => {
  await getVisitByIdService(input.visitId);

  // cek dlu apakah pasien sudah punya dokter
  const consultation = await prisma.consultation.findUnique({
    where: { visitId: input.visitId },
    include: { consultationMedicines: true },
  });

  if (!consultation) {
    throw new ApiError(404, 'Pasien ini belum di periksa oleh Dokter');
  }

  //cek apakah invoice sudah pernah di buat sebelumnya
  const existingInvoice = await prisma.invoice.findUnique({
    where: { visitId: input.visitId },
  });

  if (existingInvoice) {
    throw new ApiError(400, 'Invoice ini sudah pernah dibuat sebelumnya');
  }

  const totalConsultationFee = Number(consultation.consultationFee);
  const totalMedicineFee = consultation.consultationMedicines.reduce((sum, item) => sum + Number(item.subTotal), 0);
  const totalAmount = totalConsultationFee + totalMedicineFee;

  const countAll = await prisma.invoice.count();
  const invoiceNo = `INV-${String(countAll + 1).padStart(4, '0')}`;

  const createInvoice = await prisma.invoice.create({
    data: {
      visitId: input.visitId,
      invoiceNo: invoiceNo,
      totalConsultationFee: totalConsultationFee,
      totalMedicineFee: totalMedicineFee,
      totalAmount: totalAmount,
      paymentMethod: input.paymentMethod ?? PaymentMethod.CASH,
    },
  });
  io.emit('QUEUE_UPDATED', { type: 'INVOICE_CREATED', invoiceId: createInvoice.id });

  return createInvoice;
};

export const getInvoiceByIdService = async (id: number) => {
  const getInvoice = await prisma.invoice.findUnique({
    where: { id },
    select: invoiceSelectPayload,
  });

  if (!getInvoice) {
    throw new ApiError(404, 'Data Invoice tidak di temukan');
  }

  return getInvoice;
};

export const payInvoiceService = async (id: number, input?: payInvoiceInput) => {
  const invoice = await getInvoiceByIdService(id);

  if (invoice.status === InvoiceStatus.PAID) {
    throw new ApiError(400, 'Invoice ini sudah lunas sebelumnya');
  }

  const payInvoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
      // Update paymentMethod jika kasir memilih metode bayar baru
      paymentMethod: input?.paymentMethod ?? invoice.paymentMethod,
    },
  });

  io.emit('QUEUE_UPDATED', { type: 'INVOICE_PAID', invoiceId: id });

  return payInvoice;
};

// CUSTOMERS
export const payCustomerInvoiceService = async (
  userId: number,
  invoiceId: number,
  paymentMethod: PaymentMethod = PaymentMethod.QRIS,
) => {
  // ambil data pasien milik user
  const patient = await prisma.patient.findUnique({
    where: { userId },
  });
  if (!patient) throw new ApiError(404, 'Data pasien tidak ditemukan');

  // ambil invoice dan pastikan invoice ini benar milik pasien yang sedang login (security check)
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { visit: true },
  });

  if (!invoice) throw new ApiError(404, 'Tagihan invoice tidak di temukan');

  if (invoice.visit.patientId !== patient.id)
    throw new ApiError(403, 'Anda tidak memiliki hak akses untuk membayar tagihan pasien lain');

  if (invoice.status === InvoiceStatus.PAID) throw new ApiError(400, 'Tagihan ini sudah lunas');

  // update status invoice menjadi PAID
  const updateInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: InvoiceStatus.PAID,
      paymentMethod,
      paidAt: new Date(),
    },
  });

  io.emit('QUEUE_UPDATED', { type: 'INVOICE_PAID', invoiceId });

  return updateInvoice;
};

// MIDTRANS
// request snap token ke midtrans
export const getMidtransSnapTokenService = async (invoiceId: number, userId?: number) => {
  const invoice = await getInvoiceByIdService(invoiceId);

  if (invoice.status === InvoiceStatus.PAID) {
    throw new ApiError(400, 'Tagihan invoice ini sudah lunas sebelumnya');
  }

  // jika di panggil oleh customer, pastikan ini tagihan miliknya
  if (userId) {
    const patient = await prisma.patient.findUnique({
      where: { userId },
    });
    if (!patient || invoice.visit.patient.noRm !== patient.noRm) {
      throw new ApiError(403, 'Anda tidak memiliki hak akses tagihan ini');
    }
  }

  // rincian item invoice buat di kirim ke midtrans
  const itemDetails: Array<{ id: string; price: number; quantity: number; name: string }> = [
    {
      id: 'FEE-DOKTER',
      price: Math.round(Number(invoice.totalConsultationFee)),
      quantity: 1,
      name: `Jasa dokter (${invoice.visit.doctor.name})`.slice(0, 50),
    },
  ];

  if (invoice.visit.consultation?.consultationMedicines) {
    for (const m of invoice.visit.consultation.consultationMedicines) {
      itemDetails.push({
        id: `MED-${m.medicine.id || m.id}`,
        price: Math.round(Number(m.price)),
        quantity: m.qty,
        name: `${m.medicine.name}`.slice(0, 50),
      });
    }
  }

  const transactionDetails = {
    // tambahkan timestamp di order_id agar midtrans sandbox selalu ngizinin generate token baru jika pasien entry
    order_id: `${invoice.invoiceNo}-${Date.now()}`,
    gross_amount: Math.round(Number(invoice.totalAmount)),
  };

  const customerDetails = {
    first_name: invoice.visit.patient.name,
    phone: invoice.visit.patient.phone || '08123456789',
  };

  // minta snap token dari midtrans
  const parameter = {
    transaction_details: transactionDetails,
    item_details: itemDetails,
    customer_details: customerDetails,
  };

  const snapTransaction = await snap.createTransaction(parameter);

  return {
    token: snapTransaction.token,
    redirectUrl: snapTransaction.redirect_url,
    invoiceNo: invoice.invoiceNo,
    totalAmount: invoice.totalAmount,
  };
};

// webhook notifikasi handler (dipanggil oleh midtrans saat bayar lunas)
export const handleMidtransNotificationService = async (notificationPayload: any) => {
  console.log('>>> [MIDTRANS WEBHOOK RECEIVED]:', JSON.stringify(notificationPayload));

  let statusResponse = notificationPayload;
  try {
    statusResponse = await snap.transaction.notification(notificationPayload);
  } catch (err) {
    console.warn('snap.transaction.notification warning, using raw payload:', err);
  }

  const orderId = statusResponse.order_id || notificationPayload.order_id;
  const transactionStatus = statusResponse.transaction_status || notificationPayload.transaction_status;
  const fraudStatus = statusResponse.fraud_status || notificationPayload.fraud_status;

  console.log(`>>> [MIDTRANS STATUS]: orderId=${orderId}, status=${transactionStatus}, fraud=${fraudStatus}`);

  if (!orderId) {
    return { status: 'IGNORED_NO_ORDER_ID' };
  }

  // Extract InvoiceNo asli (buang timestamp di bagian paling belakang)
  // Contoh: "INV-2025-0021-1788229937614" -> "INV-2025-0021"
  const invoiceNo = orderId.includes('-')
    ? orderId.substring(0, orderId.lastIndexOf('-'))
    : orderId;

  const invoice =
    (await prisma.invoice.findFirst({
      where: { invoiceNo },
    })) ||
    (await prisma.invoice.findFirst({
      where: { invoiceNo: orderId },
    }));

  if (!invoice) {
    console.error(`Invoice ${invoiceNo} tidak ditemukan di database`);
    return { status: 'INVOICE_NOT_FOUND', invoiceNo };
  }

  // Cek apakah status transaksi sukses (settlement atau capture)
  if (transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus === 'accept')) {
    if (invoice.status !== InvoiceStatus.PAID) {
      const paymentType = (statusResponse.payment_type || notificationPayload.payment_type || '').toLowerCase();
      const mappedPaymentMethod =
        paymentType.includes('qris') || paymentType.includes('gopay') || paymentType.includes('shopeepay')
          ? PaymentMethod.QRIS
          : paymentType.includes('card')
          ? PaymentMethod.CARD
          : PaymentMethod.TRANSFER;

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: InvoiceStatus.PAID,
          paymentMethod: mappedPaymentMethod,
          paidAt: new Date(),
        },
      });

      console.log(`>>> [INVOICE PAID SUCCESS]: Invoice ${invoice.invoiceNo} marked as PAID via ${mappedPaymentMethod}`);
      // Broadcast Socket.IO agar Dashboard & HP Pasien auto-update ke Farmasi!
      io.emit('QUEUE_UPDATED', { type: 'INVOICE_PAID', invoiceId: invoice.id });
    }
  }

  return { status: 'OK' };
};
