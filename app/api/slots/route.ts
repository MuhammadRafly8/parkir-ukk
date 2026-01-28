import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id_area = searchParams.get('id_area')
    const status = searchParams.get('status')

    const whereClause: any = {}
    if (id_area) whereClause.id_area = parseInt(id_area, 10)
    if (status) whereClause.status = status

    const slots = await prisma.slotParkir.findMany({
      where: whereClause,
      include: {
        areaParkir: true,
      },
      orderBy: {
        nomor_slot: 'asc',
      },
    })

    return NextResponse.json(slots)
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id_area, nomor_slot, status } = await req.json()

    if (!id_area || !nomor_slot) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const slot = await prisma.slotParkir.create({
      data: {
        id_area,
        nomor_slot,
        status: status || 'TERSEDIA',
      },
      include: {
        areaParkir: true,
      },
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (error: any) {
    console.error('Error creating slot:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Slot dengan nomor ini sudah ada di area tersebut' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}
