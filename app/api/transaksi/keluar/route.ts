import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { createActivityLog } from '@/app/lib/auth'
import { cookies } from 'next/headers'
import { StatusTransaksi } from '@prisma/client'

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
    const { id_parkir } = body

    if (!id_parkir) {
      return NextResponse.json(
        { error: 'ID parkir harus diisi' },
        { status: 400 }
      )
    }

    // Cari transaksi
    const transaksi = await prisma.transaksi.findUnique({
      where: { id_parkir: parseInt(id_parkir) },
      include: {
        kendaraan: true,
        tarif: true,
        areaParkir: true,
      },
    })

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    if (transaksi.status === StatusTransaksi.KELUAR) {
      return NextResponse.json(
        { error: 'Kendaraan sudah keluar' },
        { status: 400 }
      )
    }

    // Hitung durasi dan biaya
    const waktuKeluar = new Date()
    const durasiMs = waktuKeluar.getTime() - transaksi.waktu_masuk.getTime()
    const durasiJam = Math.ceil(durasiMs / (1000 * 60 * 60)) // Pembulatan ke atas
    const tarifPerJam = Number(transaksi.tarif.tarif_per_jam)
    const biayaTotal = durasiJam * tarifPerJam

    // Update transaksi
    const updatedTransaksi = await prisma.transaksi.update({
      where: { id_parkir: parseInt(id_parkir) },
      data: {
        waktu_keluar: waktuKeluar,
        durasi_jam: durasiJam,
        biaya_total: biayaTotal,
        status: StatusTransaksi.KELUAR,
      },
      include: {
        kendaraan: true,
        tarif: true,
        areaParkir: true,
        user: {
          select: {
            id_user: true,
            nama_lengkap: true,
            username: true,
          },
        },
      },
    })

    // Update terisi area
    await prisma.areaParkir.update({
      where: { id_area: transaksi.id_area },
      data: { terisi: { decrement: 1 } },
    })

    await createActivityLog(
      session.id_user,
      `Mencatat kendaraan keluar: ${transaksi.kendaraan.plat_nomor} - ${biayaTotal}`
    )

    return NextResponse.json({
      ...updatedTransaksi,
      tarif: {
        ...updatedTransaksi.tarif,
        tarif_per_jam: Number(updatedTransaksi.tarif.tarif_per_jam),
      },
      biaya_total: Number(updatedTransaksi.biaya_total),
    })
  } catch (error) {
    console.error('Error updating transaksi keluar:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
