import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parsedId = parseInt(id, 10)
    const { status, reserved, id_transaksi } = await req.json()

    const updateData: any = {}
    if (status) updateData.status = status
    if (typeof reserved !== 'undefined') updateData.reserved = reserved
    if (id_transaksi !== undefined) updateData.id_transaksi = id_transaksi

    const slot = await prisma.slotParkir.update({
      where: { id_slot: parsedId },
      data: updateData,
      include: {
        areaParkir: true,
      },
    })

    return NextResponse.json(slot)
  } catch (error) {
    console.error('Error updating slot:', error)
    return NextResponse.json({ error: 'Failed to update slot' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const parsedId = parseInt(id, 10)

    await prisma.slotParkir.delete({
      where: { id_slot: parsedId },
    })

    return NextResponse.json({ message: 'Slot deleted successfully' })
  } catch (error) {
    console.error('Error deleting slot:', error)
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 })
  }
}
