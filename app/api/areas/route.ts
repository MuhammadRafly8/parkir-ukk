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
    const areas = await prisma.areaParkir.findMany({
      orderBy: { nama_area: 'asc' },
    })

    return NextResponse.json(areas)
  } catch (error) {
    console.error('Error fetching areas:', error)
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
    const { nama_area, kapasitas } = body

    if (!nama_area || !kapasitas) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const area = await prisma.areaParkir.create({
      data: {
        nama_area,
        kapasitas: parseInt(kapasitas),
        terisi: 0,
      },
    })

    await createActivityLog(session.id_user, `Menambah area parkir: ${nama_area}`)

    return NextResponse.json(area, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Nama area sudah digunakan' },
        { status: 400 }
      )
    }
    console.error('Error creating area:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
