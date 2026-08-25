import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { useVisitStore } from "../stores/visitStore";
import { useInvoiceStore } from "../stores/invoiceStore";
import { payInvoiceService } from "../services/invoiceService";
import { formatRupiah } from "../utils/formatRupiah";

export const InvoicePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const visitId = searchParams.get("visitId");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "TRANSFER" | "CARD">("CASH");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const navigate = useNavigate();
  const { visits, fetchVisits } = useVisitStore();
  const { fetchInvoices } = useInvoiceStore();

  // Strict Route Guard: Harus ada visitId
  useEffect(() => {
    if (!visitId) {
      alert("Halaman kasir & tagihan hanya dapat diakses melalui antrean pasien di Dashboard.");
      navigate("/dashboard", { replace: true });
      return;
    }
    fetchVisits();
    fetchInvoices();
  }, [visitId]);

  const activeVisit = visits.find((v) => v.id === Number(visitId));

  const handlePayInvoice = async () => {
    if (!activeVisit?.invoice?.id) {
      return alert("Data tagihan invoice tidak ditemukan!");
    }

    setIsProcessing(true);
    try {
      await payInvoiceService(activeVisit.invoice.id, {
        paymentMethod: paymentMethod,
      });

      await fetchVisits();
      await fetchInvoices();

      alert("Pembayaran berhasil dilunasi (PAID)!");
      navigate("/dashboard");
    } catch (error: any) {
      alert(`Gagal memproses pembayaran: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!visitId) {
    return null;
  }

  const isAlreadyPaid = activeVisit?.invoice?.status === "PAID";
  const totalConsultationFee = Number(activeVisit?.invoice?.totalConsultationFee || 0);
  const totalMedicineFee = Number(activeVisit?.invoice?.totalMedicineFee || 0);
  const invoiceTotal = activeVisit?.invoice?.totalAmount ? Number(activeVisit.invoice.totalAmount) : 0;

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl p-5">
        <div className="flex items-center gap-3.5">
          <Link
            to="/dashboard"
            className="w-10 h-10 bg-white border-2 border-[#18181b] shadow-[2px_2px_0px_#18181b] rounded-xl flex items-center justify-center text-[#18181b] hover:bg-[#fef08a] active:translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <div className="inline-block bg-[#a3e635] text-[#18181b] font-black text-[9px] px-2 py-0.5 border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase tracking-wider mb-0.5">
              BILLING & POS SYSTEM
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#18181b] tracking-tight uppercase">
              KASIR & PELUNASAN PASIEN
            </h1>
            <p className="text-xs font-bold text-[#52525b]">
              Proses pelunasan nota transaksi (Kunjungan #{visitId})
            </p>
          </div>
        </div>

        <span
          className={`text-[#18181b] border-2 border-[#18181b] font-black text-xs px-3.5 py-1.5 rounded-xl shadow-[3px_3px_0px_#18181b] uppercase tracking-wider ${
            isAlreadyPaid ? "bg-[#a3e635]" : "bg-[#f472b6]"
          }`}
        >
          Status: {isAlreadyPaid ? "Lunas (PAID)" : "Belum Bayar (UNPAID)"}
        </span>
      </div>

      {/* Main Grid: Struk Nota + Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Rincian Nota Struk Tagihan (7 Cols) */}
        <div className="lg:col-span-7 p-6 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl space-y-5">
          {/* Header Struk */}
          <div className="flex justify-between items-start pb-4 border-b-2 border-[#18181b]">
            <div>
              <h2 className="text-lg font-black text-[#18181b] uppercase">
                ReyClinic Outpatient Receipt
              </h2>
              <p className="text-xs font-bold text-[#52525b]">
                No. Faktur:{" "}
                <b className="text-[#18181b] font-mono">
                  {activeVisit?.invoice?.invoiceNo || "-"}
                </b>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-[#18181b]">
                {activeVisit?.invoice?.createdAt
                  ? new Date(activeVisit.invoice.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </p>
              <span className="text-[10px] font-bold text-[#71717a]">Kasir Rawat Jalan</span>
            </div>
          </div>

          {/* Info Pasien & Dokter */}
          <div className="bg-[#f4f3ed] p-3.5 border-2 border-[#18181b] rounded-xl text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[#71717a] font-bold">Nama Pasien:</span>
              <span className="font-black text-[#18181b] uppercase">
                {activeVisit?.patient?.name || "-"} ({activeVisit?.patient?.noRm || "-"})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71717a] font-bold">Dokter Pemeriksa:</span>
              <span className="font-black text-[#18181b]">
                {activeVisit?.doctor?.name || "-"} ({activeVisit?.doctor?.spesialis || "Umum"})
              </span>
            </div>
          </div>

          {/* Rincian Item Tagihan */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-[#18181b]">Rincian Biaya Medis</h3>
            <div className="border-2 border-[#18181b] rounded-xl overflow-hidden text-xs">
              <div className="flex justify-between p-3 bg-white border-b border-zinc-200 font-bold">
                <span>Jasa Medis & Konsultasi Dokter</span>
                <span className="font-mono font-black">{formatRupiah(totalConsultationFee)}</span>
              </div>

              {activeVisit?.consultation?.consultationMedicines &&
              activeVisit.consultation.consultationMedicines.length > 0 ? (
                activeVisit.consultation.consultationMedicines.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex justify-between p-3 bg-[#f8fafc] border-b border-zinc-200"
                  >
                    <div>
                      <p className="font-black text-[#18181b]">{item.medicine?.name}</p>
                      <p className="text-[11px] text-[#71717a]">
                        {item.qty} {item.medicine?.unit} × {formatRupiah(item.price)}
                      </p>
                    </div>
                    <span className="font-mono font-black text-[#18181b] self-center">
                      {formatRupiah(item.subTotal)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between p-3 bg-white border-b border-zinc-200 font-bold text-[#71717a]">
                  <span>Biaya Obat & Farmasi</span>
                  <span className="font-mono font-black">{formatRupiah(totalMedicineFee)}</span>
                </div>
              )}

              {/* Total Row */}
              <div className="flex justify-between p-4 bg-[#a3e635] text-[#18181b] font-black text-sm border-t-2 border-[#18181b]">
                <span className="uppercase">TOTAL TAGIHAN AKHIR</span>
                <span className="font-mono text-base">{formatRupiah(invoiceTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Action Box (5 Cols) */}
        <div className="lg:col-span-5 p-6 bg-white border-3 border-[#18181b] shadow-[4px_4px_0px_#18181b] rounded-2xl space-y-5">
          <div>
            <div className="inline-block bg-[#fde047] text-[#18181b] text-[10px] font-black tracking-wider px-2 py-0.5 border-2 border-[#18181b] shadow-[1px_1px_0px_#18181b] uppercase mb-1">
              METODE PEMBAYARAN
            </div>
            <h2 className="text-xl font-black uppercase text-[#18181b]">PILIH METODE BAYAR</h2>
          </div>

          <div className="space-y-2">
            {[
              { id: "CASH", label: "Tunai (Cash)", icon: "payments" },
              { id: "QRIS", label: "QRIS Dinamis", icon: "qr_code_2" },
              { id: "TRANSFER", label: "Transfer Bank", icon: "account_balance" },
              { id: "CARD", label: "Kartu Debit / Kredit", icon: "credit_card" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={isAlreadyPaid}
                onClick={() => setPaymentMethod(m.id as any)}
                className={`w-full p-3.5 rounded-xl border-2 border-[#18181b] font-black text-xs uppercase flex items-center justify-between transition-all cursor-pointer ${
                  paymentMethod === m.id
                    ? "bg-[#18181b] text-white shadow-[3px_3px_0px_#a3e635]"
                    : "bg-[#f4f3ed] text-[#18181b] hover:bg-[#fef08a]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                  <span>{m.label}</span>
                </div>
                {paymentMethod === m.id && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635] border border-black" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t-2 border-zinc-200">
            {isAlreadyPaid ? (
              <div className="space-y-2">
                <div className="p-3 bg-[#d9f99d] border-2 border-[#18181b] rounded-xl text-center text-xs font-black text-[#166534] uppercase">
                  ✓ Tagihan Telah Dilunasi
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-3 bg-[#18181b] text-white border-2 border-[#18181b] rounded-xl font-black text-xs uppercase hover:bg-zinc-800 cursor-pointer"
                >
                  Cetak Ulang Nota
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePayInvoice}
                className="w-full py-3.5 bg-[#a3e635] text-[#18181b] border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] rounded-xl font-black text-xs uppercase hover:bg-lime-400 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>{isProcessing ? "Memproses Pelunasan..." : "Konfirmasi Pembayaran Lunas"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
