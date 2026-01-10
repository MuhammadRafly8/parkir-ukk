import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { createActivityLog } from '@/app/lib/auth'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')
  if (!userCookie) return null
  return JSON.parse(userCookie.value)
}

export async function GET() {
  try {
    const tarifs = await prisma.tarif.findMany({
      orderBy: { jenis_kendaraan: 'asc' },
    })

    return NextResponse.json(tarifs.map(t => ({
      ...t,
      tarif_per_jam: Number(t.tarif_per_jam),
    })))
  } catch (error) {
    console.error('Error fetching tarifs:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { jenis_kendaraan, tarif_per_jam } = body

    if (!jenis_kendaraan || !tarif_per_jam) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const tarif = await prisma.tarif.create({
      data: {
        jenis_kendaraan,
        tarif_per_jam,
      },
    })

    await createActivityLog(session.id_user, `Menambah tarif: ${jenis_kendaraan}`)

    return NextResponse.json({
      ...tarif,
      tarif_per_jam: Number(tarif.tarif_per_jam),
    }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Tarif untuk jenis kendaraan ini sudah ada' },
        { status: 400 }
      )
    }
    console.error('Error creating tarif:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
