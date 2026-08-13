src/
├── assets/ # Gambar, logo, & ikon statis
├── components/ # Komponen UI kecil yang bisa dipakai berulang kali
│ ├── Layout.tsx # Bingkai utama (Header, Sidebar, <Outlet />)
│ ├── Navbar.tsx # Menu navigasi atas/samping
│ ├── PatientTable.tsx # Tabel khusus data pasien
│ └── PatientModal.tsx # Popup form Tambah/Edit pasien
├── pages/ # Halaman-halaman utama (Sesuai rute URL)
│ ├── PatientsPage.tsx # Halaman CRUD Pasien (/patients)
│ ├── DoctorsPage.tsx # Halaman CRUD Dokter (/doctors)
│ └── DashboardPage.tsx # Halaman Utama Dashboard (/)
├── services/ # Logika panggilan API Axios/Fetch ke backend
│ ├── api.ts # Konfigurasi dasar Axios (baseURL backend)
│ └── patientService.ts # Fungsi: getPatients(), createPatient(), deletePatient()
├── types/ # Definisi Interface / Type TypeScript
│ ├── patient.ts # interface Patient { id: number; name: string; age: number; }
│ └── doctor.ts # interface Doctor { ... }
├── index.css # Styling CSS Utama/Global
├── router.tsx # Peta Rute URL (createBrowserRouter)
└── main.tsx # Pintu Utama React (RouterProvider)
