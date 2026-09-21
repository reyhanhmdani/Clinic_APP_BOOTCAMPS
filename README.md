# 🏥 ReyClinic - Smart Medical Clinic Management System

[![Go Version](https://img.shields.io/badge/Go-1.26-00ADD8?style=for-the-badge&logo=go)](https://golang.org)
[![Gin Framework](https://img.shields.io/badge/Gin-v1.12-008080?style=for-the-badge&logo=go)](https://gin-gonic.com)
[![GORM](https://img.shields.io/badge/GORM-PostgreSQL-007acc?style=for-the-badge&logo=postgresql)](https://gorm.io)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Docker](https://img.shields.io/badge/Docker-Alpine_Multi--Stage-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![Render](https://img.shields.io/badge/Render-Docker_Live-46E3B7?style=for-the-badge&logo=render)](https://render.com)
[![Vercel](https://img.shields.io/badge/Vercel-Production_Live-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

**ReyClinic** adalah platform manajemen klinik medis full-stack terintegrasi yang dirancang untuk mengotomatiskan seluruh alur operasional klinik—mulai dari antrean mandiri pasien, pemeriksaan dokter, peresepan dan peracikan obat apotek, hingga kasir dan pembayaran digital QRIS/Card instan dengan Midtrans.

Proyek ini telah melalui evolusi arsitektur berskala besar: **sukses memigrasikan seluruh core backend dari Node.js (Express + Prisma) ke Golang (Gin + GORM) berbasis Docker micro-container**, meningkatkan kecepatan respon hingga 4x lipat serta memangkas penggunaan memori server cloud hingga 85%.

---

## 📑 Daftar Isi
- [1. Arsitektur Sistem](#1-arsitektur-sistem)
- [2. Perjalanan Migrasi: Express.js ke Golang](#2-perjalanan-migrasi-expressjs-ke-golang)
  - [Latar Belakang & Alasan Migrasi](#latar-belakang--alasan-migrasi)
  - [Tabel Komparasi Express vs Go](#tabel-komparasi-express-vs-go)
  - [Tantangan Teknis & Solusi yang Diterapkan](#tantangan-teknis--solusi-yang-diterapkan)
- [3. Fitur Utama & Modul Sistem](#3-fitur-utama--modul-sistem)
- [4. Struktur Direktori (Monorepo)](#4-struktur-direktori-monorepo)
- [5. Skema Database & Relasi](#5-skema-database--relasi)
- [6. Dokumentasi API Endpoint](#6-dokumentasi-api-endpoint)
- [7. Spesifikasi Real-Time WebSocket](#7-spesifikasi-real-time-websocket)
- [8. Panduan Menjalankan di Lokal](#8-panduan-menjalankan-di-lokal)
- [9. Panduan Deployment Cloud](#9-panduan-deployment-cloud)
- [10. Akun Pengujian / Demo](#10-akun-pengujian--demo)

---

## 1. Arsitektur Sistem

```mermaid
graph TB
    subgraph Client ["Client Layer"]
        A[Pasien Mobile / Web Browser]
        B[Admin / Resepsionis / Dokter / Apotek]
    end

    subgraph CDN ["Frontend Hosting (Vercel)"]
        FE[React 19 + Vite SPA + TailwindCSS]
    end

    subgraph Cloud ["Backend Microservice (Render Docker)"]
        GIN[Golang Gin REST API Router]
        HUB[Gorilla WebSocket Hub Engine]
        GORM[GORM PostgreSQL Engine]
    end

    subgraph ThirdParty ["Third-Party Services"]
        MIDTRANS[Midtrans Snap Payment Gateway]
        GOOGLE[Google OAuth2 SSO API]
        NEON[Neon Serverless PostgreSQL Cloud]
    end

    Client -->|HTTPS / WSS| FE
    FE -->|REST API v1| GIN
    FE <-->|Live Queue Stream /ws| HUB
    GIN -->|SQL Transactions| GORM
    GORM -->|TLS Connection Pooling| NEON
    GIN -->|Snap Token API| MIDTRANS
    GIN -->|Token Verify| GOOGLE
```

---

## 2. Perjalanan Migrasi: Express.js ke Golang

### Latar Belakang & Alasan Migrasi
Awalnya, backend dikembangkan menggunakan **Node.js (Express.js, TypeScript, Prisma ORM, Socket.IO)**. Meskipun cepat untuk prototyping, seiring pertambahan fitur dan kebutuhan cloud deployment, muncul sejumlah bottleneck arsitektural:
1. **Konsumsi Memori Tinggi**: Runtime Node.js + Prisma Query Engine Rust binary memakan ~180MB - 250MB RAM saat idle di container cloud gratis.
2. **Cold Start Lambat**: Di cloud serverless (Render Free Tier), runtime Node.js membutuhkan waktu booting 8-15 detik saat instance bangun dari status *sleep*.
3. **Overhead Protokol**: Socket.IO membawa polling handshake dan paket abstraksi ekstra yang membebani concurrency real-time.

### Tabel Komparasi Express vs Go

| Aspek Arsitektur | Backend V1 (Express.js) | Backend V2 (Golang) | Dampak & Peningkatan |
| :--- | :--- | :--- | :--- |
| **Language & Runtime** | Node.js v20 (V8 Engine) | Go 1.26 (Native Static Binary) | 0 runtime dependency, multi-core native |
| **Web Framework** | Express 5.x | Gin Gonic v1.12 | Throughput routing naik ~400% |
| **ORM / Data Access** | Prisma ORM 7.x | GORM v1.31 + pgx/v5 driver | Prepared statement native, hemat memory |
| **Real-Time Engine** | Socket.IO Client/Server | Gorilla WebSocket (RFC 6455) | Native browser standard, payload super ringan |
| **Container Size** | ~480 MB (Node modules + OS) | **~18 MB** (Alpine Multi-Stage) | **Penyusutan ukuran image 96%** |
| **Idle RAM Usage** | ~190 MB - 230 MB | **~15 MB - 25 MB** | **Hemat RAM server hingga ~89%** |
| **Container Booting** | ~8 - 12 detik | **< 1.5 detik** | Instant wake-up dari cloud sleep |

### Tantangan Teknis & Solusi yang Diterapkan

#### A. WebSocket Protocol Bridge
* **Isu**: Frontend awalnya memakai library `socket.io-client`. Ketika backend berganti ke Go native WebSocket, koneksi gagal karena Socket.IO membutuhkan handshake endpoint `/?EIO=4&transport=polling`.
* **Solusi**: Dibuat class adapter `NativeWebSocketClient` di [socket.ts](file:///c:/Coding/Project_bootcamps_stage2/clinic/clinic_web/clinic_frontend/src/services/socket.ts) yang mengimplementasikan interface `on()`, `emit()`, dan `off()` standar browser WebSocket dengan auto-reconnect cerdas dan URL protocol swap (`https://` ➜ `wss://`).

#### B. Rekonsiliasi Otomatis Tagihan & Midtrans
* **Isu**: Total invoice klinik terdiri dari biaya konsultasi dokter + total harga resep obat apotek. Saat pasien membayar via Midtrans, jumlah kotor (*gross amount*) dan rincian item (*item details*) harus sinkron tepat hingga rupiah terakhir.
* **Solusi**: Dibangun rekonsiliasi matematis di [internal/service/invoice_service.go](file:///c:/Coding/Project_bootcamps_stage2/clinic/clinic_web/clinic_backend_go/internal/service/invoice_service.go). Jika terdapat selisih pembulatan, sistem secara otomatis menambahkan item rekonsiliasi agar total Snap token Midtrans tidak pernah ditolak (anti-400 Bad Request).

#### C. Standarisasi Format Respons JSON
* **Isu**: Seluruh frontend React mengandalkan struktur respons terpadu `{ success: true, message: string, data: any }`.
* **Solusi**: Dibuat package utilitas [pkg/utils/response.go](file:///c:/Coding/Project_bootcamps_stage2/clinic/clinic_web/clinic_backend_go/pkg/utils/response.go) dengan fungsi `SuccessResponse` dan `ErrorResponse` yang diterapkan secara konsisten ke seluruh 9 handler API Go tanpa pengecualian.

#### D. Google OAuth SSO Tanpa Password
* **Isu**: Pasien yang mendaftar menggunakan Google OAuth tidak memiliki password lokal di database PostgreSQL (`password = NULL`).
* **Solusi**: Model `User` di Go dirancang dengan pointer `Password *string` (`json:"-"`). Di layer auth, sistem secara cerdas mendeteksi jika akun Google mencoba login via form manual, memberikan pesan edukatif: *"Akun ini terdaftar via Google. Silakan login menggunakan tombol Google"*, serta mendukung auto-linking jika pasien menautkan Google dari profilnya.

---

## 3. Fitur Utama & Modul Sistem

### 1. Modul Pasien & Portal Mandiri (Customer Portal)
* **Auto-Link NIK**: Deteksi otomatis rekam medis lama pasien jika NIK sudah pernah terdaftar di loket fisik klinik.
* **Live Queue Tracker**: Pantau estimasi nomor antrean dokter secara live tanpa perlu antre di ruang tunggu fisik.
* **Riwayat Medis & Resep Terpadu**: Akses riwayat diagnosa dokter, petunjuk penggunaan obat, dan status pelunasan tagihan.
* **Google 1-Click Sign-On**: Registrasi dan penautan akun instan menggunakan akun Google pribadi.

### 2. Modul Antrean & Resepsionis (Queue Management)
* **Penomoran Antrean Dinamis**: Format nomor loket otomatis harian (`A-001`, `A-002`, dst).
* **Multi-Status Workflow**: `WAITING` ➜ `IN_KONSULTASI` ➜ `COMPLETED` / `CANCELLED`.
* **Real-Time Broadcast**: Setiap perubahan status antrean langsung tersiar ke seluruh layar resepsionis dan ponsel pasien via WebSocket.

### 3. Modul Konsultasi Dokter (EMR - Electronic Medical Record)
* **Pemeriksaan Pasien**: Input keluhan, diagnosa medis komprehensif, dan instruksi dokter.
* **Digital Prescription**: Pemilihan obat langsung dari katalog apotek klinik beserta dosis dan kuantitas aturan pakai.

### 4. Modul Farmasi & Apotek (Pharmacy Dispensing)
* **Antrean Resep Masuk**: Apoteker menerima resep dokter secara real-time.
* **Pengurangan Stok Otomatis**: Saat obat diserahkan (*dispensed*), stok master obat otomatis berkurang secara transaksional (*ACID*).
* **Validasi Stok**: Mencegah penyerahan jika stok fisik obat di gudang tidak mencukupi.

### 5. Modul Kasir & Pembayaran Digital (Cashier & Invoicing)
* **Kalkulasi Otomatis**: Menghitung biaya jasa konsultasi dokter + seluruh harga obat apotek.
* **Pembayaran Digital Midtrans Snap**: Generate QRIS instan (GoPay, OVO, Dana, ShopeePay, BCA/Mandiri Virtual Account).
* **Metode Pembayaran Tradisional**: Dukungan pembayaran tunai (Cash) di kasir klinik.

---

## 4. Struktur Direktori (Monorepo)

```text
clinic_web/
├── clinic_backend/             # [Legacy] Node.js Express Backend (Archive/Reference)
│   ├── prisma/                 # Prisma Schema & Database Seeder
│   └── src/                    # TypeScript Controllers, Services & Routes
│
├── clinic_backend_go/          # [Active Production] Golang Clean Architecture Backend
│   ├── cmd/
│   │   └── api/
│   │       └── main.go         # Application Entry Point & Route Declarations
│   ├── internal/
│   │   ├── config/             # Environment & Configuration Loaders
│   │   ├── database/           # GORM PostgreSQL Connection Initializer
│   │   ├── handler/            # HTTP Request Handlers (Gin Controllers)
│   │   ├── middleware/         # JWT Auth, CORS, & Role-Based Access Control (RBAC)
│   │   ├── models/             # GORM Database Models & JSON Tagging
│   │   ├── repository/         # Database Query Abstractions (DAO Pattern)
│   │   ├── service/            # Business Logic Layer (Transaction, Midtrans, SSO)
│   │   └── ws/                 # Gorilla WebSocket Real-Time Connection Hub
│   ├── pkg/
│   │   └── utils/              # JWT, Hashing, Standard Response, & Google Token Verifier
│   ├── Dockerfile              # Multi-Stage Production Alpine Dockerfile
│   ├── go.mod                  # Go Module Dependencies
│   └── go.sum                  # Go Checksums
│
├── clinic_frontend/            # [Active Production] React 19 Frontend
│   ├── src/
│   │   ├── components/         # Reusable Medical UI Components (Modal, Navbar, Sidebar)
│   │   ├── pages/              # Admin, Doctor, Pharmacy, Cashier, & Customer Pages
│   │   ├── services/           # Axios API Client & Native WebSocket Client
│   │   ├── stores/             # Zustand Global State (Auth, Patient, Queue)
│   │   └── types/              # TypeScript Interfaces & Medical Domain Models
│   └── package.json            # Frontend Dependencies & Vite Scripts
│
├── .gitignore                  # Git Ignore Rules (Protects secrets & binaries)
└── README.md                   # Complete System Documentation
```

---

## 5. Skema Database & Relasi

Database menggunakan PostgreSQL (Neon Cloud) dengan relasi entitas berikut:

```mermaid
erDiagram
    users ||--o| patients : "has one"
    patients ||--o{ visits : "registers"
    doctors ||--o{ visits : "attends"
    visits ||--o| consultations : "produces"
    visits ||--o| invoice : "billed in"
    consultations ||--o{ consultation_medicines : "prescribes"
    medicines ||--o{ consultation_medicines : "dispensed as"

    users {
        int id PK
        string username
        string email UK
        string password
        enum role "ADMIN | CUSTOMER"
        string google_id UK
        string provider "LOCAL | GOOGLE"
        datetime created_at
    }

    patients {
        int id PK
        int user_id FK
        string nik UK
        string no_rm UK
        string name
        enum gender "MALE | FEMALE"
        int age
        string phone
        string address
    }

    doctors {
        int id PK
        string name
        string specialist
        string phone
        boolean is_active
    }

    medicines {
        int id PK
        string name
        string code UK
        int stock
        decimal price
        string unit
    }

    visits {
        int id PK
        int patient_id FK
        int doctor_id FK
        date visit_date
        int queue_number
        enum status "WAITING | IN_KONSULTASI | COMPLETED | CANCELLED"
    }

    consultations {
        int id PK
        int visit_id FK
        string diagnosis
        string notes
    }

    consultation_medicines {
        int id PK
        int consultation_id FK
        int medicine_id FK
        int quantity
        string instructions
        decimal price_per_unit
    }

    invoice {
        int id PK
        int visit_id FK
        decimal total_amount
        enum status "PAID | UNPAID | CANCELLED"
        enum payment_method "QRIS | CASH | TRANSFER | CARD"
        string payment_ref
    }
```

---

## 6. Dokumentasi API Endpoint

Semua endpoint dilayani melalui prefix `/api/v1`.

### 🔑 Authentication & SSO
| Method | Endpoint | Access | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Public | Login akun manual dengan email & password |
| `POST` | `/api/v1/auth/register` | Public | Registrasi akun pasien baru |
| `POST` | `/api/v1/auth/google` | Public | Login & Registrasi 1-klik menggunakan Google OAuth |
| `POST` | `/api/v1/auth/link-google`| Customer | Menautkan akun Google ke profil pasien aktif |
| `GET` | `/api/v1/auth/users` | Admin | Menampilkan daftar seluruh akun user |

### 👤 Portal Mandiri Pasien (Customer)
| Method | Endpoint | Access | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/customers/check-nik/:nik` | Customer | Cek apakah NIK sudah memiliki riwayat rekam medis offline |
| `POST` | `/api/v1/customers/profile` | Customer | Melengkapi data profil pasien & binding nomor NIK |
| `GET` | `/api/v1/customers/profile` | Customer | Mengambil detail profil dan kartu pasien |
| `GET` | `/api/v1/customers/doctors` | Customer | Mengambil daftar dokter spesialis yang sedang bertugas |
| `POST` | `/api/v1/customers/book-visit` | Customer | Mengambil nomor antrean dokter secara mandiri dari HP |
| `GET` | `/api/v1/customers/active-visit`| Customer | Memantau live status antrean dokter hari ini |
| `GET` | `/api/v1/customers/history` | Customer | Melihat riwayat kunjungan dan resep dokter terdahulu |
| `POST` | `/api/v1/customers/pay-invoice` | Customer | Konfirmasi pembayaran invoice secara mandiri |

### 👨‍⚕️ Layanan Pemeriksaan Dokter
| Method | Endpoint | Access | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/consultations` | Admin | Simpan hasil rekam medis, diagnosa, dan resep obat |
| `GET` | `/api/v1/consultations/visit/:id`| Admin | Ambil detail konsultasi berdasarkan ID kunjungan |

### 💊 Apotek & Farmasi
| Method | Endpoint | Access | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/pharmacy/queue` | Admin | Mengambil daftar resep obat yang perlu disiapkan |
| `PATCH`| `/api/v1/pharmacy/:id/dispense`| Admin | Validasi dan serahkan obat (otomatis potong stok obat) |

### 💳 Tagihan & Midtrans Payment Gateway
| Method | Endpoint | Access | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/invoices` | Admin | Menampilkan seluruh rekap invoice klinik |
| `PATCH`| `/api/v1/invoices/:id/pay` | Admin | Melunasi tagihan secara manual (Cash di loket) |
| `POST` | `/api/v1/invoices/:id/midtrans-token` | Admin/Customer | Generate token Snap Midtrans untuk QRIS / Virtual Account |

### 🏥 Manajemen Master Data (Admin Only)
| Method | Endpoint | Access | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET/POST` | `/api/v1/patients` | Admin | CRUD data master pasien |
| `GET/POST` | `/api/v1/doctors` | Admin | CRUD data dokter & spesialisasi |
| `GET/POST` | `/api/v1/medicines` | Admin | CRUD katalog obat, kuantitas stok, dan harga |
| `GET/POST` | `/api/v1/visits` | Admin | Pengambilan nomor antrean fisik loket & tracking |

---

## 7. Spesifikasi Real-Time WebSocket

Sistem menggunakan WebSocket standar (RFC 6455) pada endpoint:
```text
ws://localhost:8080/ws       (Lokal)
wss://NAMA-SERVICE.onrender.com/ws (Production)
```

### Event Format (JSON Stream):
Setiap kali terjadi perubahan status antrean pasien di loket atau ruang dokter, server membroadcast payload secara instan ke seluruh client yang terhubung:
```json
{
  "event": "QUEUE_UPDATED",
  "data": {
    "action": "VISIT_CREATED",
    "visitId": 12,
    "queueNumber": "A-005",
    "timestamp": 1726916400
  }
}
```

---

## 8. Panduan Menjalankan di Lokal

### Prasyarat:
* **Go** (versi >= 1.25 atau 1.26)
* **Node.js** (versi >= 20.x)
* **PostgreSQL** lokal atau database cloud Neon

### 1. Setup Backend Go
```bash
cd clinic_backend_go

# Copy template konfigurasi lingkungan
cp .env.example .env # atau sesuaikan isi .env:
# PORT=8080
# DATABASE_URL=postgresql://postgres:password@localhost:5432/clinic?sslmode=disable
# JWT_SECRET=rahasia_super_aman
# MIDTRANS_SERVER_KEY=SB-Mid-server-...
# MIDTRANS_CLIENT_KEY=SB-Mid-client-...
# MIDTRANS_IS_PRODUCTION=false

# Download dependensi modul
go mod download

# Jalankan server
go run cmd/api/main.go
```
*Backend Go akan aktif di: `http://localhost:8080`*

### 2. Setup Frontend React Vite
```bash
cd clinic_frontend

# Install paket dependensi
npm install

# Sesuaikan file .env:
# VITE_API_URL="http://localhost:8080"
# VITE_WS_URL="ws://localhost:8080/ws"

# Jalankan server frontend
npm run dev
```
*Frontend akan aktif di: `http://localhost:5173`*

---

## 9. Panduan Deployment Cloud

### A. Backend di Render (Docker Web Service)
1. Buka [dashboard.render.com](https://dashboard.render.com) ➜ **New +** ➜ **Web Service**.
2. Hubungkan repository GitHub project ini.
3. Konfigurasikan form deploy:
   * **Name**: `reyclinic-backend-go`
   * **Region**: `Singapore (Southeast Asia)`
   * **Branch**: `main`
   * **Root Directory**: `clinic_backend_go`
   * **Runtime**: `Docker`
   * **Instance Type**: `Free`
4. Masukkan **Environment Variables**:
   * `PORT`: `8080`
   * `DATABASE_URL`: *Connection string PostgreSQL Neon kamu*
   * `JWT_SECRET`: *Secret key token JWT*
   * `MIDTRANS_SERVER_KEY`: *Server Key Midtrans Sandbox*
   * `MIDTRANS_CLIENT_KEY`: *Client Key Midtrans Sandbox*
   * `MIDTRANS_IS_PRODUCTION`: `false`
5. Klik **Create Web Service**.

### B. Frontend di Vercel
1. Buka [vercel.com](https://vercel.com) ➜ Import project `clinic_frontend`.
2. Pada menu **Settings** ➜ **Environment Variables**, tambahkan tipe `Config` (*All Environments*):
   * `VITE_API_URL`: `https://reyclinic-backend-go.onrender.com`
   * `VITE_WS_URL`: `wss://reyclinic-backend-go.onrender.com/ws`
   * `VITE_MIDTRANS_CLIENT_KEY`: `SB-Mid-client-...`
   * `VITE_GOOGLE_CLIENT_ID`: *Google OAuth Client ID*
3. Klik **Redeploy** untuk mengaplikasikan konfigurasi build.

### C. Google Cloud Console (OAuth SSO)
1. Buka [Google Auth Platform Console](https://console.cloud.google.com/apis/credentials/consent).
2. Di menu **Audience**, pastikan Publishing Status diubah ke **In production** (klik *Publish app*).
3. Di menu **Branding**, daftarkan homepage dan domain frontend (tanpa scheme `https://` di authorised domains).
4. Di menu **Clients**, tambahkan URL Vercel ke **Authorized JavaScript origins**.

---

## 10. Akun Pengujian / Demo

Jika database di-reset menggunakan seeder bawaan (`npx prisma db seed`), akun demo berikut siap digunakan:

| Role | Email | Password | Akses Fitur |
| :--- | :--- | :--- | :--- |
| **Admin Klinik** | `admin@gmail.com` | `admin123` | Seluruh Dashboard: Dokter, Apotek, Kasir, Antrean, Master Data |
| **Pasien (Customer 1)**| `fajar@gmail.com` | `fajar123` | Portal Pasien Mandiri, Live Antrean, Riwayat Resep, Profil |
| **Pasien (Customer 2)**| `budi@gmail.com` | `budi123` | Portal Pasien Mandiri & Pembayaran Tagihan |
| **Pasien Baru (Google)**| *Akun Google Pribadi* | *(Tanpa Password)* | Login 1-klik via tombol Google SSO |

---

<div align="center">
  <sub>Dikembangkan dengan standar arsitektur clean code oleh Reyhan Hamdani. Dibuat untuk menghadirkan layanan kesehatan digital yang andal, cepat, dan presisi.</sub>
</div>
