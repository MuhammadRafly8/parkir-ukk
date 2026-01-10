-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PETUGAS', 'OWNER');

-- CreateEnum
CREATE TYPE "JenisKendaraan" AS ENUM ('MOTOR', 'MOBIL', 'LAINNYA');

-- CreateEnum
CREATE TYPE "StatusTransaksi" AS ENUM ('MASUK', 'KELUAR');

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "nama_lengkap" VARCHAR(50) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PETUGAS',
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "AreaParkir" (
    "id_area" SERIAL NOT NULL,
    "nama_area" VARCHAR(50) NOT NULL,
    "kapasitas" INTEGER NOT NULL DEFAULT 0,
    "terisi" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AreaParkir_pkey" PRIMARY KEY ("id_area")
);

-- CreateTable
CREATE TABLE "Kendaraan" (
    "id_kendaraan" SERIAL NOT NULL,
    "plat_nomor" VARCHAR(15) NOT NULL,
    "jenis_kendaraan" "JenisKendaraan" NOT NULL,
    "warna" VARCHAR(20) NOT NULL,
    "pemilik" VARCHAR(100) NOT NULL,
    "id_user" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kendaraan_pkey" PRIMARY KEY ("id_kendaraan")
);

-- CreateTable
CREATE TABLE "Tarif" (
    "id_tarif" SERIAL NOT NULL,
    "jenis_kendaraan" "JenisKendaraan" NOT NULL,
    "tarif_per_jam" DECIMAL(10,0) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarif_pkey" PRIMARY KEY ("id_tarif")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id_parkir" SERIAL NOT NULL,
    "id_kendaraan" INTEGER NOT NULL,
    "waktu_masuk" TIMESTAMP(3) NOT NULL,
    "waktu_keluar" TIMESTAMP(3),
    "id_tarif" INTEGER NOT NULL,
    "durasi_jam" INTEGER DEFAULT 0,
    "biaya_total" DECIMAL(10,0),
    "status" "StatusTransaksi" NOT NULL DEFAULT 'MASUK',
    "id_user" INTEGER NOT NULL,
    "id_area" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id_parkir")
);

-- CreateTable
CREATE TABLE "LogAktivitas" (
    "id_log" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "aktivitas" VARCHAR(100) NOT NULL,
    "waktu_aktivitas" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAktivitas_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Kendaraan_plat_nomor_key" ON "Kendaraan"("plat_nomor");

-- CreateIndex
CREATE UNIQUE INDEX "Tarif_jenis_kendaraan_key" ON "Tarif"("jenis_kendaraan");

-- CreateIndex
CREATE INDEX "Transaksi_waktu_masuk_idx" ON "Transaksi"("waktu_masuk");

-- CreateIndex
CREATE INDEX "Transaksi_status_idx" ON "Transaksi"("status");

-- AddForeignKey
ALTER TABLE "Kendaraan" ADD CONSTRAINT "Kendaraan_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_id_kendaraan_fkey" FOREIGN KEY ("id_kendaraan") REFERENCES "Kendaraan"("id_kendaraan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_id_tarif_fkey" FOREIGN KEY ("id_tarif") REFERENCES "Tarif"("id_tarif") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "AreaParkir"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAktivitas" ADD CONSTRAINT "LogAktivitas_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
