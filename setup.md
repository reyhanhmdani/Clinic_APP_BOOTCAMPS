1. Npm init dlu, install express nya, cors, prisma

A["1. CRUD Patient (Selesai ✅)"] --> B["2. CRUD Doctor (Selesai ✅)"]
B --> C["3. CRUD Medicine (Master Obat - LANGKAH SEKARANG 🚀)"]
C --> D["4. Visit / Queue (Pendaftaran Antrian Berobat)"]
D --> E["5. Consultation (Pemeriksaan & Resep Obat)"]
E --> F["6. Invoice & Payment (Pembayaran Kasir)"]
F --> G["7. Auth & JWT (Login & Guard)"]

**Jawabannya: TIDAK SELALU! (Tergantung jenis datanya).**

Di sinilah peran prinsip arsitektur **YAGNI** (_You Aren't Gonna Need It_) — **Jangan buat apa yang tidak dibutuhkan oleh sistem.**

---

### 🧱 2 Kategori Entitas di Aplikasi:

#### 1. Data Master (Butuh CRUD Lengkap ✅)

- **Contoh**: `Patient`, `Doctor`, `Medicine`.
- **Kenapa?**: Karena data master ini akan terus berubah sepanjang waktu (ditambah, diedit jika ada typo, atau dinonaktifkan jika sudah tidak dipakai).

---

#### 2. Data Transaksi / Proses (TIDAK Butuh CRUD Lengkap 🛑)

Data yang tercipta dari proses bisnis klinik **tidak semuanya butuh 4 fungsi CRUD**:

- **Antrian / Kunjungan (`Visit`)**:
  - Butuh: `Create` (Daftar antrian), `Read` (Lihat antrian hari ini), `PATCH` (Ubah status antrian).
  - _Tidak butuh full Update/Delete_.

- **Hasil Pemeriksaan (`Consultation`)**:
  - Butuh: `Create` (Dokter simpan diagnosa & resep), `Read` (Lihat rekam medis).
  - _SANGAT TIDAK BOLEH di-Edit / di-Delete bebas_, karena rekam medis adalah dokumen legal hukum yang tidak boleh diubah-ubah secara ilegal.

- **Pembayaran Kasir (`Invoice`)**:
  - Butuh: `Create` (Generate tagihan), `Read` (Lihat nota), `PATCH` (Ubah status jadi `PAID`).
  - _Tidak boleh di-Delete_ agar pembukuan keuangan kasir tidak bocor.

---

💡 **Kesimpulan**:

- **Data Master** (`Patient`, `Doctor`, `Medicine`) -> Buat **Full CRUD**.
- **Data Transaksi** (`Visit`, `Consultation`, `Invoice`) -> Buat **Endpoint Spesifik sesuai Flow Bisnis saja**.
