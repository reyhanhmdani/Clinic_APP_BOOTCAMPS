# 🏥 ReyClinic - Sistem Informasi & Manajemen Klinik Medis

ReyClinic adalah aplikasi web manajemen klinik kesehatan terpadu yang menghubungkan seluruh alur operasional klinik—mulai dari pendaftaran mandiri pasien, antrean dokter real-time, rekam medis digital (EMR), penyiapan obat di apotek, hingga kasir dengan pembayaran digital QRIS Midtrans.

Project ini awalnya dibangun menggunakan backend **Express.js (TypeScript + Prisma)**, kemudian dieksplorasi dan dibangun ulang (*rewrite*) menggunakan **Golang (Gin + GORM)** untuk mencoba stack modern **React + Go** yang lebih cepat, hemat resource, dan mudah di-deploy sebagai single container Docker.

---

## 📌 Mengapa Migrasi dari Express ke Go?

Eksplorasi ini berfokus pada pengalaman membangun sistem yang sama dengan dua ekosistem berbeda:

* **Eksplorasi Stack React + Go**: Mencoba kombinasi frontend React modern dengan backend Golang yang terkenal efisien dan statically typed.
* **Performa & Efisiensi Resource**: Backend Go berjalan sebagai single static binary di dalam Alpine Linux Docker dengan konsumsi RAM yang jauh lebih ringan (~15-20 MB saat idle).
* **Native Concurrency**: Menggunakan goroutine dan native WebSocket untuk broadcast antrean pasien ke banyak browser secara real-time tanpa overhead library tambahan.
* **Kemudahan Deployment**: Backend Go dikemas dalam multi-stage Docker build yang ringkas dan langsung siap jalan di platform seperti Render.

> *Catatan: Folder backend lama (`clinic_backend`) tetap dipertahankan di repositori ini sebagai arsip perbandingan implementasi Express vs Go.*

---

## 🔄 Alur Sistem (Flow Aplikasi)

Berikut alur perjalanan data dari awal pasien mendaftar hingga selesai pemeriksaan secara end-to-end:

```mermaid
flowchart TD
    subgraph S1["1️⃣ Pendaftaran & Antrean"]
        A["Pasien (Online / Loket Fisik)"] --> B["Pilih Dokter & Ambil Nomor Antrean"]
        B --> C["Pantau Antrean Live (WebSocket)"]
    end

    subgraph S2["2️⃣ Ruang Pemeriksaan (EMR)"]
        C --> D["Dokter Panggil Pasien Sesuai Nomor"]
        D --> E["Input Keluhan, Diagnosa, & Tindakan"]
        E --> F["Terbitkan Resep Obat Digital"]
    end

    subgraph S3["3️⃣ Apotek & Farmasi"]
        F --> G["Apoteker Terima Notifikasi Resep"]
        G --> H["Siapkan & Serahkan Obat ke Pasien"]
        H --> I["Stok Obat Otomatis Terpotong"]
    end

    subgraph S4["4️⃣ Kasir & Penyelesaian"]
        I --> J["Tagihan Terbit Otomatis (Jasa Dokter + Obat)"]
        J --> K["Pembayaran (QRIS Midtrans / Tunai Loket)"]
        K --> L["Kunjungan Selesai & Riwayat Medis Tersimpan"]
    end
```

### 📋 Ringkasan 4 Tahapan Utama:

| Tahap | Penanggung Jawab | Aktivitas Utama | Output Sistem |
| :--- | :--- | :--- | :--- |
| **1. Pendaftaran** | Pasien / Resepsionis | Registrasi akun, penautan NIK, & ambil tiket antrean poli | Nomor Tiket (`A-001`) & Live Tracker |
| **2. Pemeriksaan** | Dokter | Anamnesis pasien, penegakan diagnosa, & peresepan obat | Rekam Medis EMR & Resep Digital |
| **3. Farmasi** | Apoteker | Review resep digital, peracikan, & penyerahan obat | Pengurangan Stok Otomatis (Batch) |
| **4. Kasir** | Kasir / Pasien | Pelunasan tagihan via QRIS Snap mandiri atau tunai di loket | Status `PAID`, Struk Lunas, & Riwayat |

---

## ✨ Fitur Utama Berdasarkan Peran

### 1. Portal Mandiri Pasien (`/customers`)
* **Registrasi & Google SSO**: Daftar akun baru manual atau 1-klik menggunakan akun Google.
* **Penautan Akun (Auto-Link)**: Jika pasien sudah pernah punya rekam medis di loket fisik, akun bisa otomatis terhubung melalui NIK.
* **Ambil Antrean Online**: Booking nomor antrean dokter hari ini langsung dari smartphone.
* **Live Queue Monitor**: Memantau sisa antrean yang sedang berjalan secara real-time.
* **Riwayat Medis & Resep**: Melihat catatan diagnosa masa lalu dan petunjuk aturan minum obat.
* **Bayar Tagihan Mandiri**: Membayar invoice langsung dari portal pasien via QRIS.

### 2. Loket & Resepsionis (`/visits`, `/patients`)
* Pendaftaran pasien baru (nama, NIK, No. RM otomatis, tanggal lahir, kontak).
* Pengambilan nomor antrean loket fisik harian.
* Pemantauan daftar pasien yang sedang menunggu di ruang tunggu.

### 3. Ruang Periksa Dokter (`/consultations`)
* Memanggil antrean pasien berikutnya.
* Input diagnosa medis, catatan keluhan, dan tindakan dokter.
* Peresepan obat digital terintegrasi langsung dengan katalog apotek.

### 4. Apotek & Farmasi (`/pharmacy`)
* Antrean resep obat yang masuk secara live begitu dokter selesai memeriksa.
* Validasi ketersediaan stok obat.
* Pengurangan stok obat secara otomatis dan transaksional saat obat diserahkan (*dispensed*).

### 5. Kasir & Pembayaran (`/invoices`)
* Kalkulasi biaya otomatis: **Biaya Jasa Dokter + Total Harga Obat Resep**.
* Integrasi **Midtrans Snap**: Pembayaran QRIS (GoPay, OVO, Dana, ShopeePay) & Virtual Account.
* Pilihan pembayaran tunai (Cash) di kasir fisik.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Zustand (State Management), Axios.
* **Backend**: Golang 1.26, Gin Gonic Framework, GORM, Gorilla WebSocket.
* **Database**: PostgreSQL (Hosted on Neon Cloud Serverless).
* **Payment Gateway**: Midtrans Snap API (Sandbox).
* **Authentication**: JWT (JSON Web Token), Google OAuth 2.0.
* **DevOps / Deployment**: Docker (Multi-stage build), Render (Backend Web Service), Vercel (Frontend SPA).

---

## 📁 Struktur Folder Project

```text
clinic_web/
├── clinic_backend_go/          # Backend Utama (Golang)
│   ├── cmd/api/main.go         # Entry point server & rute API
│   ├── internal/
│   │   ├── config/             # Load environment variables
│   │   ├── database/           # Setup koneksi PostgreSQL via GORM
│   │   ├── handler/            # Controller / Request Handler Gin
│   │   ├── middleware/         # Auth JWT, CORS, Role-based Access (RBAC)
│   │   ├── models/             # Entity struct GORM & JSON mappings
│   │   ├── repository/         # Database query layer
│   │   ├── service/            # Business logic (Midtrans, Auth, Antrean)
│   │   └── ws/                 # WebSocket Hub & broadcast engine
│   ├── pkg/utils/              # Helper JWT, Hash Password, Google OAuth, Response
│   └── Dockerfile              # Containerization backend
│
├── clinic_frontend/            # Frontend Utama (React + Vite)
│   ├── src/
│   │   ├── components/         # Komponen UI (Navbar, Sidebar, Modals)
│   │   ├── pages/              # Halaman Dashboard, Pasien, Kasir, Dokter, Apotek
│   │   ├── services/           # Axios client & Native WebSocket client
│   │   ├── stores/             # Zustand global state (Auth, UI)
│   │   └── types/              # TypeScript interface & types
│   └── package.json
│
├── clinic_backend/             # Arsip Backend Lama (Node.js Express + Prisma)
│   └── prisma/seed.ts          # Database seeder untuk data dummy awal
│
├── go.work                     # Go Workspace configuration
└── README.md                   # Dokumentasi project
```

---

## 🚀 Panduan Menjalankan Project di Komputer Lokal

### 1. Prasyarat
Pastikan di komputer kamu sudah terpasang:
* [Go](https://go.dev/dl/) (versi 1.24 atau yang lebih baru)
* [Node.js](https://nodejs.org/) (versi 20 atau yang lebih baru)
* Database [PostgreSQL](https://www.postgresql.org/) (bisa lokal atau pakai [Neon.tech](https://neon.tech/) gratis)

---

### 2. Clone Repositori
```bash
git clone https://github.com/reyhanhmdani/Clinic_APP_BOOTCAMPS.git
cd Clinic_APP_BOOTCAMPS
```

---

### 3. Setup Database (Seeder Data Awal)
Untuk mengisi database dengan akun admin, dokter, katalog obat, dan riwayat kunjungan:
```bash
cd clinic_backend

# Install dependensi seeder prisma
npm install

# Sesuaikan DATABASE_URL di clinic_backend/.env
# Lalu jalankan reset & seeding data:
npx prisma db push --force-reset
npx prisma db seed

cd ..
```

---

### 4. Menjalankan Backend Golang
Buka terminal baru di folder `clinic_backend_go`:
```bash
cd clinic_backend_go

# Buat file .env (atau sesuaikan yang sudah ada):
# PORT=8080
# DATABASE_URL=postgresql://user:password@localhost:5432/clinic?sslmode=disable
# JWT_SECRET=rahasia_super_aman
# MIDTRANS_SERVER_KEY=SB-Mid-server-...
# MIDTRANS_CLIENT_KEY=SB-Mid-client-...
# MIDTRANS_IS_PRODUCTION=false

# Download dependencies & jalankan:
go mod download
go run cmd/api/main.go
```
> Server backend akan aktif di: `http://localhost:8080`

---

### 5. Menjalankan Frontend React
Buka terminal baru di folder `clinic_frontend`:
```bash
cd clinic_frontend

# Install dependensi
npm install

# Pastikan file .env mengarah ke backend Go lokal:
# VITE_API_URL="http://localhost:8080"
# VITE_WS_URL="ws://localhost:8080/ws"
# VITE_MIDTRANS_CLIENT_KEY="SB-Mid-client-..."
# VITE_GOOGLE_CLIENT_ID="536069580355-..."

# Jalankan dev server:
npm run dev
```
> Aplikasi web akan aktif di browser: `http://localhost:5173`

---

## 🔑 Akun Uji Coba (Demo Accounts)

Data akun bawaan dari hasil seeding:

| Peran (Role) | Email | Password | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Admin / Staf Klinik** | `admin@gmail.com` | `admin123` | Akses penuh: Pendaftaran, Dokter, Apotek, Kasir, Master Data |
| **Pasien (Customer 1)** | `fajar@gmail.com` | `fajar123` | Coba fitur antrean mandiri & lihat riwayat resep |
| **Pasien (Customer 2)** | `budi@gmail.com` | `budi123` | Coba portal pasien & pembayaran invoice |
| **Google Sign-In** | *Akun Google Anda* | *(Tanpa Password)* | Klik tombol "Daftar Cepat dengan Google" di halaman Login/Register |

---

## 🌐 Informasi Deployment Cloud

* **Frontend**: Di-deploy di **Vercel** (`https://clinic-app-bootcamps.vercel.app`)
* **Backend**: Di-deploy di **Render** menggunakan **Docker Container** (`https://reyclinic-backend-go.onrender.com`)
* **Database**: Hosted di **Neon Cloud PostgreSQL (Singapore Region)**

---

<div align="center">
  <sub>Dibuat dan dikembangkan oleh Reyhan Hamdani untuk kebutuhan bootcamp dan eksplorasi fullstack engineering React + Golang.</sub>
</div>
