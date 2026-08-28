import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>PRD - Sistem Manajemen Klinik & Portal Pasien Mandiri</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4;
      margin: 10mm 12mm 10mm 12mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.35;
      font-size: 8.5pt;
      margin: 0;
      padding: 0;
    }

    .header-banner {
      background: linear-gradient(135deg, #072418 0%, #0d402b 100%);
      color: white;
      padding: 12px 18px;
      border-radius: 10px;
      margin-bottom: 12px;
      border: 1px solid #145339;
    }

    .header-tag {
      display: inline-block;
      background: rgba(180, 241, 5, 0.2);
      color: #b4f105;
      border: 1px solid rgba(180, 241, 5, 0.4);
      padding: 1px 7px;
      border-radius: 12px;
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .header-title {
      font-size: 13.5pt;
      font-weight: 800;
      margin: 0 0 3px 0;
      color: #ffffff;
      letter-spacing: -0.3px;
    }

    .header-meta {
      font-size: 7.5pt;
      color: #94a3b8;
      display: flex;
      gap: 12px;
    }

    h2 {
      font-size: 10pt;
      font-weight: 800;
      color: #072418;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 2px;
      margin-top: 10px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    h3 {
      font-size: 8.5pt;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 3px 0;
    }

    p {
      margin: 0 0 5px 0;
      color: #334155;
      font-size: 8.5pt;
    }

    /* 2-Column Grid Layout for Super Compact Screens */
    .screens-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }

    .screen-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 7px 9px;
      break-inside: avoid;
    }

    .screen-card.full-width {
      grid-column: 1 / -1;
    }

    .screen-card h3 {
      color: #072418;
      font-size: 8pt;
      font-weight: 700;
      border-bottom: 1px dashed #e2e8f0;
      padding-bottom: 2px;
      margin-bottom: 4px;
    }

    .wireframe-box {
      background: #f8fafc;
      border: 1px solid #94a3b8;
      border-left: 3px solid #072418;
      border-radius: 4px;
      padding: 5px 7px;
      margin: 3px 0 4px 0;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 6.8pt;
      line-height: 1.25;
      color: #0f172a;
      white-space: pre;
    }

    .screen-desc {
      font-size: 7.5pt;
      color: #475569;
      margin: 0;
      line-height: 1.3;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 6px 0 8px 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      font-size: 8pt;
    }

    th {
      background: #072418;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 5px 8px;
      font-size: 7.5pt;
    }

    td {
      padding: 4.5px 8px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    .badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 7pt;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .badge-admin { background: #fef3c7; color: #92400e; }
    .badge-customer { background: #e0f2fe; color: #0369a1; }
    .badge-method { background: #ecfdf5; color: #065f46; font-weight: 800; }

    .bullet-list {
      margin: 3px 0 6px 0;
      padding-left: 15px;
    }

    .bullet-list li {
      font-size: 8pt;
      color: #334155;
      margin-bottom: 2px;
    }

    .solutions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-top: 4px;
    }

    .card-solution {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 3px solid #059669;
      border-radius: 5px;
      padding: 5px 8px;
    }

    .card-solution h4 {
      margin: 0 0 2px 0;
      color: #065f46;
      font-size: 7.5pt;
      font-weight: 700;
    }

    .card-solution p {
      margin: 0;
      font-size: 7.2pt;
      color: #334155;
      line-height: 1.25;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header-banner">
    <div class="header-tag">Bootcamp Stage 2 Technical PRD</div>
    <h1 class="header-title">PRODUCT REQUIREMENTS DOCUMENT (PRD)</h1>
    <div class="header-meta">
      <span>🏥 <strong>Project:</strong> KlinikKu (Clinic Management & Customer Portal)</span>
      <span>🌿 <strong>Branch:</strong> feat/customer-portal</span>
      <span>📅 <strong>Tanggal:</strong> 27 Agustus 2026</span>
    </div>
  </div>

  <!-- SECTION 1 & 2 DENSE ROW -->
  <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 10px; margin-bottom: 6px;">
    <div>
      <h2>1. Overview & Objective</h2>
      <p>
        <strong>KlinikKu</strong> adalah platform web kesehatan modern yang mengintegrasikan Dashboard Admin/Loket dengan Portal Pasien Mandiri (Customer Mobile-First).
      </p>
      <ul class="bullet-list">
        <li><strong>Efisiensi Antrean:</strong> Pasien ambil nomor antrean & pantau live dari HP.</li>
        <li><strong>Auto-Link Rekam Medis (NIK 16-Digit):</strong> Mencegah duplikasi data pasien loket offline saat baru membuat akun online.</li>
        <li><strong>Transparansi Billing:</strong> Rincian diagnosa, obat, & bayar mandiri QRIS.</li>
      </ul>
    </div>
    <div>
      <h2>2. Roles & Permissions</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 28%;">Role</th>
            <th style="width: 72%;">Wewenang & Fitur</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="badge badge-admin">ADMIN</span></td>
            <td>Master data, panggil antrean live, input diagnosa dokter, invoice loket.</td>
          </tr>
          <tr>
            <td><span class="badge badge-customer">CUSTOMER</span></td>
            <td>Onboarding NIK, booking poli, live queue tracker, bayar QRIS, riwayat resep.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- SECTION 3: COMPACT 2-COLUMN WIREFRAMES -->
  <h2>3. Screen Wireframes & UI Specifications</h2>
  
  <div class="screens-grid">
    <!-- Screen 1 -->
    <div class="screen-card">
      <h3>Screen 1: Login & Register Account</h3>
      <div class="wireframe-box">+-----------------------------------------------+
|                 [ KLINIKKU ]                  |
| Email    : [ budi@gmail.com                 ] |
| Password : [ **********                     ] |
|             [ MASUK SEKARANG ]                |
| Belum punya akun? [Daftar Akun Baru]          |
+-----------------------------------------------+</div>
      <p class="screen-desc">Form login universal. Customer diarahkan ke <code>/portal</code>; Admin ke <code>/dashboard</code>. Register otomatis set role <code>CUSTOMER</code>.</p>
    </div>

    <!-- Screen 2 -->
    <div class="screen-card">
      <h3>Screen 2: Onboarding & Auto-Link NIK</h3>
      <div class="wireframe-box">+-----------------------------------------------+
| <-- Lengkapi Profil Pasien                    |
| NIK (16-Digit) : [ 3201011504950001         ] |
| Nama / Usia    : [ Budi Santoso ] / [ 28 Th ] |
| Gender / No HP : (*) L ( ) P / [ 0812-111... ]|
| [!] NIK cocok -> Otomatis Auto-Link Rekam Medis|
|             [ SIMPAN & HUBUNGKAN ]            |
+-----------------------------------------------+</div>
      <p class="screen-desc">Input data medis pertama kali. Jika NIK cocok data loket offline -> auto link; jika baru -> terbit No. RM (<code>RM-2026-xxx</code>).</p>
    </div>

    <!-- Screen 3 -->
    <div class="screen-card">
      <h3>Screen 3: Customer Portal (Kartu & Booking)</h3>
      <div class="wireframe-box">+-----------------------------------------------+
| Halo, Budi! [🟢 Online]           [👤 Profil] |
| +-------------------------------------------+ |
| | [KARTU PASIEN] RM-2025-001 | NIK: 3201... | |
| +-------------------------------------------+ |
| [ 🩺 DAFTAR ANTREAN BEROBAT ]                 |
| Pilih Poli: [ Dr. Andri - Penyakit Dalam   v] |
|            [ AMBIL NOMOR ANTREAN ]            |
+-----------------------------------------------+</div>
      <p class="screen-desc">Home portal pasien di HP: Kartu pasien digital, status terverifikasi, dan formulir booking poli dokter aktif.</p>
    </div>

    <!-- Screen 4 -->
    <div class="screen-card">
      <h3>Screen 4: Live Queue Tracker (Realtime)</h3>
      <div class="wireframe-box">+-----------------------------------------------+
|            STATUS ANTREAN AKTIF               |
| No. Antrean Anda: [ A-005 ]                   |
| Sedang Diperiksa: [ A-003 ] (Sisa 2 Pasien)   |
| Dokter / Poli   : Dr. Andri (Poli Dalam)      |
| Status Saat Ini : [ ⏳ MENUNGGU PANGGILAN ]   |
+-----------------------------------------------+</div>
      <p class="screen-desc">Pasien memantau nomor antrean aktif live dari HP hingga status berubah jadi <code>IN_KONSULTASI</code>.</p>
    </div>

    <!-- Screen 5 -->
    <div class="screen-card">
      <h3>Screen 5: Billing & Self-Payment QRIS</h3>
      <div class="wireframe-box">+-----------------------------------------------+
| Tagihan No: INV-2026-0009  Status: [🔴 UNPAID]|
| 1. Jasa Konsul Dr. Andri        Rp 150.000    |
| 2. Paracetamol + Neurobion      Rp  20.000    |
| TOTAL TAGIHAN                 : Rp 170.000    |
| Bayar: (*) QRIS  ( ) Transfer   ( ) Loket     |
|               [ 📲 BAYAR SEKARANG ]           |
+-----------------------------------------------+</div>
      <p class="screen-desc">Setelah pemeriksaan selesai, pasien dapat membayar tagihan obat dan jasa dokter langsung via QRIS.</p>
    </div>

    <!-- Screen 6 -->
    <div class="screen-card">
      <h3>Screen 6: Kwitansi & Resep Digital</h3>
      <div class="wireframe-box">+-----------------------------------------------+
|             BUKTI PEMBAYARAN LUNAS            |
| Pasien   : Budi Santoso (RM-2025-001)         |
| Diagnosa : Dispepsia Fungsional (K30)         |
| Resep    : Paracetamol 3x1, Neurobion 1x1     |
| Total    : Rp 170.000 [ 🟢 LUNAS via QRIS ]   |
|            [ 📥 Download Struk PDF ]          |
+-----------------------------------------------+</div>
      <p class="screen-desc">Kwitansi digital dan riwayat diagnosa yang tersimpan permanen di akun pasien.</p>
    </div>

    <!-- Screen 7 Full Width -->
    <div class="screen-card full-width">
      <h3>Screen 7: Admin Live Queue Dashboard</h3>
      <div class="wireframe-box">+-----------------------------------------------------------------------------------------+
| KLINIKKU ADMIN | [Hari: Rp 291k] [7H: Rp 3.3M] [Pasien Hari Ini: 10]    [+ Tambah Antrean]      |
| Search Pasien / NIK: [ 320101...                  ]                                             |
| NO | PASIEN & NIK          | POLI / DOKTER     | STATUS       | AKSI                            |
| 01 | Budi (NIK: 320101...) | Dr. Andri (Poli 1)| WAITING      | [Panggil Masuk Poli]            |
| 02 | Siti (NIK: 320101...) | Dr. Sarah (Gigi)  | IN_KONSULTASI| [Input Rekam Medis & Resep]     |
| 03 | Ahmad (NIK: 32010...) | Dr. Hendra (Tulang| COMPLETED    | [Cetak Struk / Kasir Loket]     |
+-----------------------------------------------------------------------------------------+</div>
      <p class="screen-desc">Dashboard operasional loket admin untuk memantau grafik analitik, memanggil pasien, dan mengontrol antrean dokter.</p>
    </div>
  </div>

  <!-- SECTION 4 & 5 COMPACT -->
  <div style="display: grid; grid-template-columns: 0.95fr 1.05fr; gap: 10px; margin-bottom: 6px;">
    <div>
      <h2>4. Database Schema Changes</h2>
      <ul class="bullet-list">
        <li><strong>User:</strong> <code>id</code>, <code>email (UQ)</code>, <code>password</code>, <code>role (ADMIN / CUSTOMER)</code>.</li>
        <li><strong>Patient:</strong> <code>id</code>, <code>userId (FK UQ Nullable)</code>, <code>nik (16-digit UQ)</code>, <code>noRm (UQ)</code>, <code>name</code>, <code>gender</code>, <code>age</code>, <code>phone</code>, <code>address</code>.</li>
        <li><strong>Relasi:</strong> <code>Doctor</code>, <code>Visit</code>, <code>Consultation</code>, <code>Medicine</code>, <code>Invoice</code>.</li>
      </ul>
    </div>
    <div>
      <h2>5. Kendala Teknis & Solusi Teruji</h2>
      <div class="solutions-grid">
        <div class="card-solution">
          <h4>1. Duplikasi Pasien Loket</h4>
          <p>Klaim via NIK 16-Digit. Auto-update <code>userId</code> pada data pasien lama.</p>
        </div>
        <div class="card-solution">
          <h4>2. Grafik Pendapatan Flat</h4>
          <p>Distribusi multi-hari (H-6 s/d H-0) di <code>seed.ts</code> dengan peak di H-3.</p>
        </div>
        <div class="card-solution">
          <h4>3. Redundansi Modal Dashboard</h4>
          <p>Hapus form pasien baru dari modal antrean; dipusatkan di menu Data Pasien.</p>
        </div>
        <div class="card-solution">
          <h4>4. Isolasi Route Customer</h4>
          <p>Sub-router mandiri (<code>/customers</code>) terikat token JWT (<code>req.user.id</code>).</p>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 6: API CONTRACT -->
  <h2>6. API Endpoints Contract (Portal Customer)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 14%;">Method</th>
        <th style="width: 32%;">Endpoint</th>
        <th style="width: 16%;">Role</th>
        <th style="width: 38%;">Deskripsi & Fungsi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="badge badge-method">POST</span></td>
        <td><code>/auth/register</code></td>
        <td>Public</td>
        <td>Registrasi akun Customer baru (role: CUSTOMER)</td>
      </tr>
      <tr>
        <td><span class="badge badge-method">POST</span></td>
        <td><code>/auth/login</code></td>
        <td>Public</td>
        <td>Login & terbitkan JWT Token</td>
      </tr>
      <tr>
        <td><span class="badge badge-method">POST</span></td>
        <td><code>/customers/profile</code></td>
        <td>CUSTOMER</td>
        <td>Lengkapi profil medis & auto-link NIK</td>
      </tr>
      <tr>
        <td><span class="badge badge-method">GET</span></td>
        <td><code>/customers/my-visits</code></td>
        <td>CUSTOMER</td>
        <td>Ambil antrean live & riwayat berobat</td>
      </tr>
      <tr>
        <td><span class="badge badge-method">POST</span></td>
        <td><code>/customers/book-visit</code></td>
        <td>CUSTOMER</td>
        <td>Booking nomor antrean dokter mandiri</td>
      </tr>
      <tr>
        <td><span class="badge badge-method">POST</span></td>
        <td><code>/customers/pay-invoice</code></td>
        <td>CUSTOMER</td>
        <td>Pembayaran tagihan online mandiri (QRIS)</td>
      </tr>
    </tbody>
  </table>

</body>
</html>`;

const tempHtmlPath = path.resolve("./scripts/prd_temp.html");
const outputPdfPath = path.resolve("../PRD_Customer_Portal_KlinikKu.pdf");

fs.writeFileSync(tempHtmlPath, htmlContent, "utf8");

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

try {
  const cmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${outputPdfPath}" "${tempHtmlPath}"`;
  execSync(cmd);
  console.log(`✅ Ultra-Dense Professional PDF generated at: ${outputPdfPath}`);
} catch (err) {
  console.error("❌ Error generating PDF:", err);
} finally {
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
}
