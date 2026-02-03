import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { StatusTransaksi } from '@/app/lib/types/enums'
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
    const qrCode = searchParams.get('qr') // ID parkir dari QR code
    const platNomor = searchParams.get('plat_nomor')

    let transaksi = null

    if (qrCode) {
      // Cari berdasarkan ID parkir dari QR code
      transaksi = await prisma.transaksi.findFirst({
        where: {
          id_parkir: parseInt(qrCode),
          status: StatusTransaksi.MASUK,
        },
        include: {
          kendaraan: true,
          tarif: true,
          areaParkir: true,
        },
      })
    } else if (platNomor) {
      // Cari berdasarkan plat nomor yang masih masuk
      const kendaraan = await prisma.kendaraan.findUnique({
        where: { plat_nomor: platNomor.toUpperCase() },
      })

      if (kendaraan) {
        transaksi = await prisma.transaksi.findFirst({
          where: {
            id_kendaraan: kendaraan.id_kendaraan,
            status: StatusTransaksi.MASUK,
          },
          include: {
            kendaraan: true,
            tarif: true,
            areaParkir: true,
          },
          orderBy: { waktu_masuk: 'desc' },
        })
      }
    } else {
      // Get all active transactions
      const transaksiList = await prisma.transaksi.findMany({
        where: {
          status: StatusTransaksi.MASUK,
        },
        include: {
          kendaraan: true,
          tarif: true,
          areaParkir: true,
        },
        orderBy: { waktu_masuk: 'desc' },
      })

      return NextResponse.json(transaksiList.map((t: typeof transaksiList[0]) => ({
        ...t,
        tarif: {
          ...t.tarif,
          tarif_per_jam: Number(t.tarif.tarif_per_jam),
        },
      })))
    }

    if (!transaksi) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...transaksi,
      tarif: {
        ...transaksi.tarif,
        tarif_per_jam: Number(transaksi.tarif.tarif_per_jam),
      },
    })
  } catch (error) {
    console.error('Error fetching active transaksi:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
