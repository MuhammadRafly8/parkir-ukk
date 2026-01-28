-- CreateEnum
CREATE TYPE "TipeAlert" AS ENUM ('AREA_FULL', 'AREA_ALMOST_FULL', 'SLOT_AVAILABLE', 'SYSTEM_WARNING');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "StatusSlot" AS ENUM ('TERSEDIA', 'TERISI', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "Alert" (
    "id_alert" SERIAL NOT NULL,
    "id_area" INTEGER NOT NULL,
    "tipe_alert" "TipeAlert" NOT NULL,
    "pesan" VARCHAR(255) NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'WARNING',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id_alert")
);

-- CreateTable
CREATE TABLE "SlotParkir" (
    "id_slot" SERIAL NOT NULL,
    "id_area" INTEGER NOT NULL,
    "nomor_slot" VARCHAR(10) NOT NULL,
    "status" "StatusSlot" NOT NULL DEFAULT 'TERSEDIA',
    "reserved" BOOLEAN NOT NULL DEFAULT false,
    "id_transaksi" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlotParkir_pkey" PRIMARY KEY ("id_slot")
);

-- CreateIndex
CREATE INDEX "Alert_id_area_idx" ON "Alert"("id_area");

-- CreateIndex
CREATE INDEX "Alert_is_read_idx" ON "Alert"("is_read");

-- CreateIndex
CREATE INDEX "SlotParkir_id_area_idx" ON "SlotParkir"("id_area");

-- CreateIndex
CREATE INDEX "SlotParkir_status_idx" ON "SlotParkir"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SlotParkir_id_area_nomor_slot_key" ON "SlotParkir"("id_area", "nomor_slot");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "AreaParkir"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotParkir" ADD CONSTRAINT "SlotParkir_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "AreaParkir"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;
