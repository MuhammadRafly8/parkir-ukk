import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')
  if (!userCookie) return null
  return JSON.parse(userCookie.value)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const idKendaraan = searchParams.get('id_kendaraan')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (idKendaraan) {
      where.id_kendaraan = parseInt(idKendaraan)
    }

    if (startDate || endDate) {
      where.waktu_masuk = {}
      if (startDate) {
        where.waktu_masuk.gte = new Date(startDate)
      }
      if (endDate) {
        where.waktu_masuk.lte = new Date(endDate)
      }
    }

    const transaksi = await prisma.transaksi.findMany({
      where,
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
      orderBy: { waktu_masuk: 'desc' },
      take: 100,
    })

    return NextResponse.json(transaksi.map(t => ({
      ...t,
      tarif: {
        ...t.tarif,
        tarif_per_jam: Number(t.tarif.tarif_per_jam),
      },
      biaya_total: t.biaya_total ? Number(t.biaya_total) : null,
    })))
  } catch (error) {
    console.error('Error fetching transaksi:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
