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
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const userId = searchParams.get('user_id')

    const where: any = {}

    if (userId) {
      where.id_user = parseInt(userId)
    }

    if (startDate || endDate) {
      where.waktu_aktivitas = {}
      if (startDate) {
        where.waktu_aktivitas.gte = new Date(startDate)
      }
      if (endDate) {
        where.waktu_aktivitas.lte = new Date(endDate)
      }
    }

    const logs = await prisma.logAktivitas.findMany({
      where,
      include: {
        user: {
          select: {
            id_user: true,
            nama_lengkap: true,
            username: true,
          },
        },
      },
      orderBy: { waktu_aktivitas: 'desc' },
      take: 500,
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
