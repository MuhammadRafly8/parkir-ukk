// prisma/seed.ts

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

  // User
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nama_lengkap: 'Admin Utama',
      username: 'admin',
      password: hashPassword('admin123'),
      role: 'ADMIN',
      status_aktif: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'petugas1' },
    update: {},
    create: {
      nama_lengkap: 'Petugas Satu',
      username: 'petugas1',
      password: hashPassword('petugas123'),
      role: 'PETUGAS',
      status_aktif: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      nama_lengkap: 'Owner/Manajemen',
      username: 'owner',
      password: hashPassword('owner123'),
      role: 'OWNER',
      status_aktif: true,
    },
  });

  // Area Parkir — pastikan `nama_area` punya @unique di schema!
  await prisma.areaParkir.upsert({
    where: { nama_area: 'Area A' },
    update: {},
    create: {
      nama_area: 'Area A',
      kapasitas: 50,
      terisi: 0,
    },
  });

  await prisma.areaParkir.upsert({
    where: { nama_area: 'Area B' },
    update: {},
    create: {
      nama_area: 'Area B',
      kapasitas: 30,
      terisi: 0,
    },
  });

  // Tarif
  await prisma.tarif.upsert({
    where: { jenis_kendaraan: 'MOTOR' },
    update: {},
    create: {
      jenis_kendaraan: 'MOTOR',
      tarif_per_jam: 2000,
    },
  });

  await prisma.tarif.upsert({
    where: { jenis_kendaraan: 'MOBIL' },
    update: {},
    create: {
      jenis_kendaraan: 'MOBIL',
      tarif_per_jam: 5000,
    },
  });

  // Kendaraan - gunakan user admin yang sudah dibuat
  const adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (adminUser) {
    await prisma.kendaraan.upsert({
      where: { plat_nomor: 'B1234XYZ' },
      update: {},
      create: {
        plat_nomor: 'B1234XYZ',
        jenis_kendaraan: 'MOBIL',
        warna: 'Merah',
        pemilik: 'Rafly',
        id_user: adminUser.id_user,
      },
    });
  }

  console.log('✅ Seeder berhasil dijalankan!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });