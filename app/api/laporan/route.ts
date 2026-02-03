import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import { StatusTransaksi } from '@/app/lib/types/enums'

async function getSession() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')
  if (!userCookie) return null
  return JSON.parse(userCookie.value)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Tanggal mulai dan tanggal akhir harus diisi' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    // Get all completed transactions in date range
    const transaksi = await prisma.transaksi.findMany({
      where: {
        status: StatusTransaksi.KELUAR,
        waktu_keluar: {
          gte: start,
          lte: end,
        },
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
      orderBy: { waktu_keluar: 'desc' },
    })

    // Calculate summary
    const totalTransaksi = transaksi.length
    const totalPendapatan = transaksi.reduce((sum: number, t: typeof transaksi[0]) => {
      return sum + (t.biaya_total ? Number(t.biaya_total) : 0)
    }, 0)

    const summaryByJenis = transaksi.reduce((acc: Record<string, { count: number; total: number }>, t: typeof transaksi[0]) => {
      const jenis = t.kendaraan.jenis_kendaraan
      if (!acc[jenis]) {
        acc[jenis] = { count: 0, total: 0 }
      }
      acc[jenis].count++
      acc[jenis].total += t.biaya_total ? Number(t.biaya_total) : 0
      return acc
    }, {})

    const summaryByArea = transaksi.reduce((acc: Record<string, { count: number; total: number }>, t: typeof transaksi[0]) => {
      const area = t.areaParkir.nama_area
      if (!acc[area]) {
        acc[area] = { count: 0, total: 0 }
      }
      acc[area].count++
      acc[area].total += t.biaya_total ? Number(t.biaya_total) : 0
      return acc
    }, {})

    return NextResponse.json({
      periode: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalTransaksi,
        totalPendapatan,
        summaryByJenis,
        summaryByArea,
      },
      transaksi: transaksi.map((t: typeof transaksi[0]) => ({
        ...t,
        tarif: {
          ...t.tarif,
          tarif_per_jam: Number(t.tarif.tarif_per_jam),
        },
        biaya_total: t.biaya_total ? Number(t.biaya_total) : null,
      })),
    })
  } catch (error) {
    console.error('Error generating laporan:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
