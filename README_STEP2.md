# SIDAPUT v2 - Implementasi Tahap 2

Tahap 2 melanjutkan fondasi backend v2 dengan fokus pada frontend role-based dan data seed demo agar aplikasi dapat diuji end-to-end lebih cepat.

## Yang ditambahkan

### Backend
- Seeder operator demo
- Seeder nelayan demo
- Seeder contoh laporan tangkapan submitted
- Seed relasi operator ke wilayah
- Seed profil nelayan + kapal + alat tangkap

### Frontend
- Login real ke `/api/v2/auth/login`
- Protected route berbasis role `admin`, `operator`, `nelayan`
- Layout terpisah per role
- Dashboard Admin
- Manajemen User Admin
- Master Data Admin
- Laporan Tangkapan Admin
- Dashboard Operator
- Verifikasi Laporan Operator
- Dashboard Nelayan
- Input Tangkapan Nelayan
- Profil Nelayan

## Akun demo
- Admin: `admin` / `admin12345`
- Operator: `operator` / `operator12345`
- Nelayan: `nelayan` / `nelayan12345`

## Cara menjalankan

### Backend
```bash
cd backend-sidaput
cp .env.example .env
# sesuaikan DB ke MySQL
composer install
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

### Frontend
```bash
cd frontend-sidaput
npm install
# optional: buat .env dengan VITE_API_BASE_URL=http://127.0.0.1:8000/api/v2
npm run dev
```

## Catatan
- Endpoint lama `/api/*` masih dipertahankan.
- Endpoint baru memakai namespace `/api/v2/*`.
- Fokus tahap ini adalah membuat flow login dan operasional dasar per role sudah berjalan.
- Export PDF/Excel, notification center, dan report API periodik penuh belum diimplementasikan pada tahap ini.
