/*
  Warnings:

  - A unique constraint covering the columns `[nama_area]` on the table `AreaParkir` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AreaParkir_nama_area_key" ON "AreaParkir"("nama_area");
