export enum Role {
  ADMIN = 'ADMIN',
  PETUGAS = 'PETUGAS',
  OWNER = 'OWNER',
}

export enum JenisKendaraan {
  MOTOR = 'MOTOR',
  MOBIL = 'MOBIL',
  LAINNYA = 'LAINNYA',
}

export enum StatusTransaksi {
  MASUK = 'MASUK',
  KELUAR = 'KELUAR',
}

export enum TipeAlert {
  AREA_FULL = 'AREA_FULL',
  AREA_ALMOST_FULL = 'AREA_ALMOST_FULL',
  SLOT_AVAILABLE = 'SLOT_AVAILABLE',
  SYSTEM_WARNING = 'SYSTEM_WARNING',
  KENDARAAN_RUSAK = 'KENDARAAN_RUSAK',
}

export enum Severity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}
