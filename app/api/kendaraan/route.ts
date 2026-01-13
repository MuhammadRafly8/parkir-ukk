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

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'PETUGAS')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const platNomor = searchParams.get('plat_nomor')

    const kendaraan = await prisma.kendaraan.findMany({
      where: platNomor ? {
        plat_nomor: { contains: platNomor, mode: 'insensitive' },
      } : undefined,
      include: {
        user: {
          select: {
            id_user: true,
            nama_lengkap: true,
            username: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(kendaraan)
  } catch (error) {
    console.error('Error fetching kendaraan:', error)
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
    const { plat_nomor, jenis_kendaraan, warna, pemilik, id_user } = body

    if (!plat_nomor || !jenis_kendaraan || !warna || !pemilik || !id_user) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const kendaraan = await prisma.kendaraan.create({
      data: {
        plat_nomor: plat_nomor.toUpperCase(),
        jenis_kendaraan,
        warna,
        pemilik,
        id_user: parseInt(id_user),
      },
      include: {
        user: {
          select: {
            id_user: true,
            nama_lengkap: true,
            username: true,
          },
        },
      },
    })

    await createActivityLog(session.id_user, `Menambah kendaraan: ${plat_nomor}`)

    return NextResponse.json(kendaraan, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Plat nomor sudah terdaftar' },
        { status: 400 }
      )
    }
    console.error('Error creating kendaraan:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
