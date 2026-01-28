import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')
  if (!userCookie) return null
  return JSON.parse(userCookie.value)
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'PETUGAS')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const whereClause = unreadOnly ? { is_read: false } : {}

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      include: {
        areaParkir: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id_area, tipe_alert, pesan, severity } = await req.json()

    if (!id_area || !tipe_alert || !pesan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const validSeverities = ['INFO', 'WARNING', 'CRITICAL']
    const validTipeAlerts = ['AREA_FULL', 'AREA_ALMOST_FULL', 'SLOT_AVAILABLE', 'SYSTEM_WARNING', 'KENDARAAN_RUSAK']

    const alert = await prisma.alert.create({
      data: {
        id_area,
        tipe_alert: validTipeAlerts.includes(tipe_alert) ? tipe_alert : 'SYSTEM_WARNING',
        pesan,
        severity: validSeverities.includes(severity) ? severity : 'WARNING',
      },
      include: {
        areaParkir: true,
      },
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') || '0', 10)

    if (!id) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    const alert = await prisma.alert.update({
      where: { id_alert: id },
      data: {
        is_read: true,
      },
      include: {
        areaParkir: true,
      },
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}
