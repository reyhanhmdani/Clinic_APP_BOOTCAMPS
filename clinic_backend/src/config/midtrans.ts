// @ts-ignore
import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';
dotenv.config();

// inisialisasi midtrans
export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-demo-key',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-demo-key',
});
  