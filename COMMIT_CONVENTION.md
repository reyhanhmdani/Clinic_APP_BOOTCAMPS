# 📝 Git Commit & Branching Convention Guide

Dokumen ini berisi standar penamaan **Commit**, **Branch**, dan **Alur Kerja Git (Git Workflow)** di repositori **Clinic App** berbasis standar industri (*Conventional Commits & Feature Branch Workflow*).

---

## 📌 1. Format Commit Dasar

```text
<type>: <deskripsi singkat>
```

Atau jika memiliki cakupan modul spesifik (*scope*):

```text
<type>(<scope>): <deskripsi singkat>
```

---

## 🏷️ Daftar Prefix Commit (`type`) Utama

| Prefix | Penggunaan | Contoh |
| :--- | :--- | :--- |
| **`feat`** | Menambahkan fitur atau modul baru | `feat: add patient CRUD service and controller` |
| **`fix`** | Memperbaiki bug atau error | `fix: resolve 404 infinite loading on patient lookup` |
| **`refactor`** | Merapikan/mengubah struktur kode tanpa ubah logika | `refactor: optimize patient validation schema` |
| **`chore`** | Perubahan konfigurasi, *dependency*, atau file non-fitur | `chore: add root gitignore and docker compose setup` |
| **`docs`** | Perubahan pada file dokumentasi (`.md`) | `docs: add commit convention guide` |
| **`style`** | Format kode (formatting, linter) tanpa ubah logika | `style: format patient controller with prettier` |
| **`perf`** | Peningkatan performa kode atau query database | `perf: update postgres database url to 127.0.0.1` |
| **`test`** | Menambahkan atau memperbarui unit test | `test: add unit test for create patient service` |

---

## 🌿 2. Aturan Penamaan Branch (Branching Convention)

Setiap pengerjaan fitur atau perbaikan wajib menggunakan **branch terpisah** dari `main`.

| Jenis Branch | Format Penamaan | Contoh |
| :--- | :--- | :--- |
| **`main`** | `main` | Branch utama (*production-ready*). Tidak boleh koding langsung di sini. |
| **Fitur Baru** | `feat/<nama-modul>` | `feat/consultation-module`, `feat/invoice-module` |
| **Perbaikan Bug** | `fix/<nama-bug>` | `fix/patient-null-error`, `fix/jwt-auth-bug` |
| **Refactoring** | `refactor/<nama-scope>` | `refactor/route-middlewares` |

---

## 🚀 3. Alur Kerja Git Profesional (Best Practice Workflow)

Ikuti 5 langkah ini untuk setiap pengerjaan modul baru:

### 1️⃣ Buat & Pindah ke Branch Baru
Pastikan kamu berada di branch `main` terbaru, lalu buat branch fitur baru:
```bash
git checkout main
git pull origin main
git checkout -b feat/consultation-module
```

### 2️⃣ Koding & Commit Bertahap
Koding fitur kamu dan simpan commit secara bertahap menggunakan standar Conventional Commits:
```bash
git add .
git commit -m "feat: add create consultation service and stock logic"
```

### 3️⃣ Push Branch Fitur ke GitHub
Upload branch fitur kamu ke repositori GitHub:
```bash
git push origin feat/consultation-module
```

### 4️⃣ Buat & Merge Pull Request (PR) di Web GitHub
1. Buka halaman repositori kamu di **GitHub**.
2. Klik tombol hijau **"Compare & Pull Request"**.
3. Tulis deskripsi singkat perubahannya, lalu klik **"Create Pull Request"**.
4. Review kodenya, lalu klik **"Merge Pull Request"** ➔ **"Confirm Merge"**.

### 5️⃣ Update Branch `main` di Komputer Lokal (Pull dari GitHub)
Setelah Pull Request di-merge di web GitHub, **pindah ke `main` lokal dan tarik (`pull`) kode terbarunya dari GitHub** (JANGAN LAKUKAN MERGE MANUAL DI LOKAL):
```bash
git checkout main
git pull origin main
```

---

## ⚡ 4. Tabel Perbandingan: Perintah BENAR vs SALAH

| Kategori | ✅ BENAR (Standard Industri) | ❌ SALAH (Dilarang) |
| :--- | :--- | :--- |
| **Pesan Commit** | `git commit -m "feat: add consultation service"` | `git commit -m "update"` *(Terlalu samar)* |
| **Pesan Bugfix** | `git commit -m "fix: resolve NaN in consultation id"` | `git commit -m "benerin bug"` *(Tanpa prefix)* |
| **Tempat Koding** | Koding di `feat/consultation-module` | Koding langsung di branch `main` |
| **Penggabungan Kode** | Push ke GitHub ➔ Merge via **Pull Request (PR)** ➔ `git pull origin main` di lokal | `git merge` manual di lokal tanpa Pull Request di GitHub |
| **Perintah Commit** | Gunakan kata kerja perintah: `add`, `fix`, `refactor` | Gunakan kata lampau: *added*, *fixed*, *fixing* |

---

## 💡 4 Aturan Emas Penulisan Commit

1. **Gunakan Kata Kerja Perintah (*Imperative Mood*)**: 
   - Gunakan `add` (bukan *added* / *adding*)
   - Gunakan `fix` (bukan *fixed* / *fixing*)
2. **Huruf Kecil (*Lowercase*)**: Awali deskripsi dengan huruf kecil setelah tanda titik dua (`:`).
3. **Tanpa Titik di Akhir**: Jangan mengakhiri pesan commit dengan tanda titik (`.`).
4. **Singkat & Jelas**: Usahakan judul commit tidak lebih dari 50–72 karakter.
