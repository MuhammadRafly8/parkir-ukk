import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Default ke hari ini jika tidak ada parameter
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const start = startDate ? new Date(startDate) : today
    const end = endDate ? new Date(endDate) : tomorrow

    // Total transaksi hari ini
    const totalTransaksiHariIni = await prisma.transaksi.count({
      where: {
        created_at: {
          gte: start,
          lt: end,
        },
      },
    })

    // Total revenue hari ini
    const revenueResult = await prisma.transaksi.aggregate({
      where: {
        created_at: {
          gte: start,
          lt: end,
        },
        waktu_keluar: {
          not: null,
        },
      },
      _sum: {
        biaya_total: true,
      },
    })

    const totalRevenue = revenueResult._sum.biaya_total || 0

    // Occupancy per area
    const areas = await prisma.areaParkir.findMany({
      include: {
        _count: {
          select: {
            transaksi: {
              where: {
                status: 'MASUK',
              },
            },
          },
        },
      },
    })

    const occupancyByArea = areas.map((area) => ({
      id_area: area.id_area,
      nama_area: area.nama_area,
      kapasitas: area.kapasitas,
      terisi: area.terisi,
      aktif: area._count.transaksi,
      persentase: area.kapasitas > 0 ? (area.terisi / area.kapasitas) * 100 : 0,
    }))

    // Transaksi per jam (24 jam terakhir)
    const transaksiPerJam = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('hour', created_at) as jam,
        COUNT(*) as count
      FROM "Transaksi"
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY jam ASC
    ` as any[]

    const transaksiByHour = transaksiPerJam.map((item: any) => ({
      jam: new Date(item.jam).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      count: parseInt(item.count),
    }))

    // Revenue per jenis kendaraan
    const revenueByJenis = await prisma.$queryRaw(Prisma.sql`
      SELECT 
        k.jenis_kendaraan,
        COUNT(t.id_parkir) as count,
        COALESCE(SUM(t.biaya_total), 0) as total_revenue
      FROM "Transaksi" t
      JOIN "Kendaraan" k ON t.id_kendaraan = k.id_kendaraan
      WHERE t.created_at >= ${start} AND t.created_at < ${end} AND t.waktu_keluar IS NOT NULL
      GROUP BY k.jenis_kendaraan
    `) as any[]

    const revenueByVehicleType = revenueByJenis.map((item: any) => ({
      jenis_kendaraan: item.jenis_kendaraan,
      count: parseInt(item.count),
      total_revenue: parseFloat(item.total_revenue),
      average_revenue: parseFloat(item.total_revenue) / parseInt(item.count),
    }))

    // Kendaraan aktif saat ini
    const kendaraanAktif = await prisma.transaksi.count({
      where: {
        status: 'MASUK',
      },
    })

    // Unread alerts
    const unreadAlerts = await prisma.alert.count({
      where: {
        is_read: false,
      },
    })

    return NextResponse.json({
      summary: {
        totalTransaksiHariIni,
        totalRevenue,
        kendaraanAktif,
        unreadAlerts,
      },
      occupancyByArea,
      transaksiByHour,
      revenueByVehicleType,
      periode: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
