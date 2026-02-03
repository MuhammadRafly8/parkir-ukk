import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { createActivityLog } from '@/app/lib/auth'
import { cookies } from 'next/headers'
import { StatusTransaksi } from '@/app/lib/types/enums'

async function getSession() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')
  if (!userCookie) return null
  return JSON.parse(userCookie.value)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'PETUGAS' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { plat_nomor, jenis_kendaraan, warna, pemilik, id_area } = body

    if (!plat_nomor || !jenis_kendaraan || !warna || !pemilik || !id_area) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Check slot tersedia
    const area = await prisma.areaParkir.findUnique({
      where: { id_area: parseInt(id_area) },
    })

    if (!area) {
      return NextResponse.json(
        { error: 'Area parkir tidak ditemukan' },
        { status: 404 }
      )
    }

    if (area.terisi >= area.kapasitas) {
      return NextResponse.json(
        { error: 'Slot parkir penuh' },
        { status: 400 }
      )
    }

    // Cari atau buat kendaraan
    let kendaraan = await prisma.kendaraan.findUnique({
      where: { plat_nomor: plat_nomor.toUpperCase() },
    })

    if (!kendaraan) {
      // Buat kendaraan baru dengan user default (bisa diubah sesuai kebutuhan)
      const defaultUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      })

      if (!defaultUser) {
        return NextResponse.json(
          { error: 'User default tidak ditemukan' },
          { status: 500 }
        )
      }

      kendaraan = await prisma.kendaraan.create({
        data: {
          plat_nomor: plat_nomor.toUpperCase(),
          jenis_kendaraan,
          warna,
          pemilik,
          id_user: defaultUser.id_user,
        },
      })
    }

    // Cari tarif
    const tarif = await prisma.tarif.findUnique({
      where: { jenis_kendaraan },
    })

    if (!tarif) {
      return NextResponse.json(
        { error: 'Tarif untuk jenis kendaraan ini tidak ditemukan' },
        { status: 404 }
      )
    }

    // Buat transaksi
    const transaksi = await prisma.transaksi.create({
      data: {
        id_kendaraan: kendaraan.id_kendaraan,
        waktu_masuk: new Date(),
        id_tarif: tarif.id_tarif,
        status: StatusTransaksi.MASUK,
        id_user: session.id_user,
        id_area: parseInt(id_area),
      },
      include: {
        kendaraan: true,
        tarif: true,
        areaParkir: true,
      },
    })

    // Update terisi area
    await prisma.areaParkir.update({
      where: { id_area: parseInt(id_area) },
      data: { terisi: { increment: 1 } },
    })

    await createActivityLog(session.id_user, `Mencatat kendaraan masuk: ${plat_nomor}`)

    return NextResponse.json({
      ...transaksi,
      tarif: {
        ...transaksi.tarif,
        tarif_per_jam: Number(transaksi.tarif.tarif_per_jam),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaksi masuk:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
