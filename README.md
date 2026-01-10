# Sistem Parkir - UKK Project

Aplikasi web sistem parkir lengkap dengan fitur manajemen parkir, transaksi, dan laporan. Dibuat untuk Ujian Kompetensi Kejuruan (UKK).

## Teknologi yang Digunakan

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL dengan Prisma ORM
- **Authentication**: Cookie-based session
- **UI Components**: Custom components dengan Tailwind CSS
- **QR Code**: qrcode.react
- **PDF Generation**: pdf-lib
- **Excel Export**: xlsx

## Fitur Aplikasi

### 1. Authentication
- Login/Logout untuk semua role (Admin, Petugas, Owner)
- Session management dengan cookies

### 2. Admin Dashboard
- ✅ **Kelola User**: CRUD pengguna sistem
- ✅ **Kelola Tarif Parkir**: CRUD tarif per jenis kendaraan
- ✅ **Kelola Area Parkir**: CRUD area dan slot parkir
- ✅ **Kelola Kendaraan**: CRUD data kendaraan
- ✅ **Log Aktifitas**: Lihat riwayat aktivitas sistem
- ✅ Dashboard dengan statistik

### 3. Petugas Dashboard
- ✅ **Kendaraan Masuk**: Catat kendaraan masuk dengan generate QR code tiket
- ✅ **Kendaraan Keluar**: Proses pembayaran dan keluar kendaraan
- ✅ Scan QR code atau input manual
- ✅ Dashboard dengan statistik transaksi

### 4. Owner/Manajemen Dashboard
- ✅ **Laporan Transaksi**: Generate laporan berdasarkan periode
- ✅ Rekap per jenis kendaraan dan per area
- ✅ Export ke Excel
- ✅ Dashboard dengan statistik pendapatan

## Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd parkir-ukk
```

2. Install dependencies:
```bash
npm install
```

3. Setup database:
- Buat file `.env` di root project:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/parkir_db"
```

4. Run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate-dev
```

5. Seed database (optional):
```bash
npm run prisma:seed
```

6. Jalankan development server:
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Akun Default (setelah seed)

### Admin
- Username: `admin`
- Password: `admin123`

### Petugas
- Username: `petugas1`
- Password: `petugas123`

### Owner
- Username: `owner`
- Password: `owner123`

## Struktur Project

```
parkir-ukk/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages
│   │   ├── admin/       # Admin dashboard
│   │   ├── petugas/     # Petugas dashboard
│   │   └── manajemen/   # Owner dashboard
│   ├── api/             # API routes
│   ├── components/      # React components
│   ├── lib/             # Utilities dan hooks
│   └── globals.css      # Global styles
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed
└── public/              # Static files
```

## API Routes

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Tarifs (Admin only)
- `GET /api/tarifs` - Get all tarifs
- `POST /api/tarifs` - Create tarif
- `PUT /api/tarifs/[id]` - Update tarif
- `DELETE /api/tarifs/[id]` - Delete tarif

### Areas (Admin only)
- `GET /api/areas` - Get all areas
- `POST /api/areas` - Create area
- `PUT /api/areas/[id]` - Update area
- `DELETE /api/areas/[id]` - Delete area

### Kendaraan (Admin only)
- `GET /api/kendaraan` - Get all kendaraan
- `POST /api/kendaraan` - Create kendaraan
- `PUT /api/kendaraan/[id]` - Update kendaraan
- `DELETE /api/kendaraan/[id]` - Delete kendaraan

### Transaksi (Petugas)
- `GET /api/transaksi` - Get all transaksi
- `GET /api/transaksi/active` - Get active transaksi
- `POST /api/transaksi/masuk` - Catat kendaraan masuk
- `POST /api/transaksi/keluar` - Proses kendaraan keluar

### Logs (Admin only)
- `GET /api/logs` - Get activity logs

### Laporan (Owner only)
- `GET /api/laporan` - Generate laporan transaksi

## Fitur Tambahan

### QR Code Tiket
- Generate QR code otomatis saat kendaraan masuk
- QR code berisi ID parkir untuk proses keluar
- Cetak tiket dengan QR code

### PDF Struk
- Generate struk pembayaran dalam format PDF
- Download struk setelah pembayaran

### Excel Export
- Export laporan transaksi ke Excel
- Format yang rapi dan mudah dibaca

## Development

```bash
# Development
npm run dev

# Build production
npm run build

# Start production
npm start

# Linting
npm run lint

# Type checking
npm run type-check

# Prisma Studio (database GUI)
npm run prisma:studio
```

## Database Schema

Database menggunakan PostgreSQL dengan schema berikut:
- `User` - Data pengguna
- `AreaParkir` - Data area parkir
- `Kendaraan` - Data kendaraan
- `Tarif` - Data tarif parkir
- `Transaksi` - Data transaksi parkir
- `LogAktivitas` - Log aktivitas sistem

Lihat `prisma/schema.prisma` untuk detail lengkap.

## Lisensi

Project ini dibuat untuk keperluan UKK (Ujian Kompetensi Kejuruan).

## Kontributor

- Dibuat untuk UKK Project