import React, { useState } from 'react';

export const InvoicePage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER' | 'EDC'>('CASH');

  const invoiceItems = [
    { name: 'Jasa Konsultasi Dokter Spesialis', category: 'Tindakan', price: 150000, qty: 1 },
    { name: 'Paracetamol 500mg (10 tablet)', category: 'Obat', price: 25000, qty: 1 },
    { name: 'Vitamin C 500mg (10 tablet)', category: 'Obat', price: 30000, qty: 1 },
    { name: 'Biaya Administrasi Klinik', category: 'Layanan', price: 15000, qty: 1 },
  ];

  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalAmount);

  return (
    <div className="organic-bg min-h-screen w-full p-4 sm:p-6 md:p-8 text-[#18181b] font-sans antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="w-10 h-10 rounded-xl bg-white border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] flex items-center justify-center text-[#18181b] hover:bg-[#fde047] transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </a>
            <div>
              <h1 className="text-2xl font-black text-[#18181b] tracking-tight">
                Kasir & Pelunasan Tagihan Pasien
              </h1>
              <p className="text-xs font-semibold text-[#52525b]">
                Proses pembayaran nota dan cetak bukti transaksi resmi klinik
              </p>
            </div>
          </div>

          <span className="bg-[#f472b6] text-[#18181b] border-2 border-[#18181b] font-black text-xs px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#18181b]">
            Status: Belum Bayar (UNPAID)
          </span>
        </div>

        {/* Main Grid: Struk Nota (7 Cols) + Payment Form (5 Cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Rincian Nota Struk Tagihan (7 Cols) */}
          <div className="md:col-span-7 neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[5px_5px_0px_#18181b] space-y-5">
            {/* Header Struk */}
            <div className="flex justify-between items-start pb-4 border-b-2 border-[#18181b]">
              <div>
                <h2 className="text-lg font-black text-[#18181b]">ReyClinic Outpatient Receipt</h2>
                <p className="text-xs font-semibold text-[#52525b]">No. Faktur: INV-2026-0089</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-[#18181b]">13 Agu 2026</p>
                <p className="text-[11px] font-semibold text-[#52525b]">Kasir: Rey Admin</p>
              </div>
            </div>

            {/* Info Pasien */}
            <div className="p-3.5 rounded-xl bg-[#fef08a] border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] flex justify-between items-center text-xs">
              <div>
                <p className="font-black text-[#18181b]">Pasien: Budi Santoso</p>
                <p className="font-semibold text-[#52525b]">RM: RM-2025-001</p>
              </div>
              <div className="text-right font-bold text-[#18181b]">
                Dokter: Dr. Andri Wijaya
              </div>
            </div>

            {/* Tabel Item Tagihan */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase text-[#18181b] tracking-wider mb-2">
                Rincian Layanan & Obat
              </h3>
              {invoiceItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-[#18181b]/10 text-xs"
                >
                  <div>
                    <span className="font-bold text-[#18181b] block">{item.name}</span>
                    <span className="text-[10px] font-semibold text-[#52525b]">{item.category}</span>
                  </div>
                  <span className="font-black text-[#18181b]">
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Pembayaran Banner */}
            <div className="p-4 rounded-xl bg-[#a3e635] border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-[#18181b]">
                Total Yang Harus Dibayar:
              </span>
              <span className="text-xl font-black text-[#18181b]">
                {formattedTotal}
              </span>
            </div>
          </div>

          {/* Form Pembayaran (5 Cols) */}
          <div className="md:col-span-5 neubrutal-card p-6 bg-white border-2 border-[#18181b] shadow-[5px_5px_0px_#18181b] space-y-5">
            <h3 className="text-sm font-black text-[#18181b] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">payments</span>
              <span>Pilih Metode Pembayaran</span>
            </h3>

            {/* Radio Buttons Payment Methods */}
            <div className="space-y-2.5">
              {[
                { id: 'CASH', label: 'Tunai (Cash)', icon: 'payments', color: 'bg-[#fde047]' },
                { id: 'QRIS', label: 'QRIS / E-Wallet', icon: 'qr_code_2', color: 'bg-[#38bdf8]' },
                { id: 'TRANSFER', label: 'Bank Transfer', icon: 'account_balance', color: 'bg-[#a3e635]' },
                { id: 'EDC', label: 'Kartu Debit / EDC', icon: 'credit_card', color: 'bg-[#f472b6]' },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`w-full p-3 rounded-xl border-2 border-[#18181b] text-left transition-all flex items-center gap-3 cursor-pointer ${
                    paymentMethod === method.id
                      ? `${method.color} text-[#18181b] font-black shadow-[3px_3px_0px_#18181b] scale-[1.02]`
                      : 'bg-white text-[#18181b] font-bold hover:bg-zinc-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{method.icon}</span>
                  <span className="text-xs font-black flex-1">{method.label}</span>
                  {paymentMethod === method.id && (
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  )}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t-2 border-[#18181b]/10 space-y-3">
              <button
                type="button"
                className="w-full py-3 rounded-xl neubrutal-btn-primary text-xs font-black text-[#18181b] cursor-pointer shadow-[3px_3px_0px_#18181b] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>Bayar Lunas & Selesai (PAID)</span>
              </button>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl border-2 border-[#18181b] bg-white text-xs font-extrabold text-[#18181b] hover:bg-zinc-100 transition-all shadow-[2px_2px_0px_#18181b] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Cetak Nota Struk Fisik</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
