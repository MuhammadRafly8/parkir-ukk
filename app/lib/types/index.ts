import { Role, JenisKendaraan, StatusTransaksi } from '@prisma/client'

export type { Role, JenisKendaraan, StatusTransaksi }

export interface User {
  id_user: number
  nama_lengkap: string
  username: string
  password: string
  role: Role
  status_aktif: boolean
  created_at: Date
  updated_at: Date
}

export interface AreaParkir {
  id_area: number
  nama_area: string
  kapasitas: number
  terisi: number
  created_at: Date
  updated_at: Date
}

export interface Kendaraan {
  id_kendaraan: number
  plat_nomor: string
  jenis_kendaraan: JenisKendaraan
  warna: string
  pemilik: string
  id_user: number
  created_at: Date
  updated_at: Date
}

export interface Tarif {
  id_tarif: number
  jenis_kendaraan: JenisKendaraan
  tarif_per_jam: number
  created_at: Date
  updated_at: Date
}

export interface Transaksi {
  id_parkir: number
  id_kendaraan: number
  waktu_masuk: Date
  waktu_keluar: Date | null
  id_tarif: number
  durasi_jam: number | null
  biaya_total: number | null
  status: StatusTransaksi
  id_user: number
  id_area: number
  created_at: Date
  updated_at: Date
}

export interface LogAktivitas {
  id_log: number
  id_user: number
  aktivitas: string
  waktu_aktivitas: Date
}
