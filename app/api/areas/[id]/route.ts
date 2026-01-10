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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { nama_area, kapasitas } = body

    const updateData: any = {}
    if (nama_area) updateData.nama_area = nama_area
    if (kapasitas !== undefined) updateData.kapasitas = parseInt(kapasitas)

    const area = await prisma.areaParkir.update({
      where: { id_area: parseInt(id) },
      data: updateData,
    })

    await createActivityLog(session.id_user, `Mengupdate area parkir: ${area.nama_area}`)

    return NextResponse.json(area)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Nama area sudah digunakan' },
        { status: 400 }
      )
    }
    console.error('Error updating area:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const area = await prisma.areaParkir.findUnique({
      where: { id_area: parseInt(id) },
    })

    if (!area) {
      return NextResponse.json({ error: 'Area tidak ditemukan' }, { status: 404 })
    }

    await prisma.areaParkir.delete({
      where: { id_area: parseInt(id) },
    })

    await createActivityLog(session.id_user, `Menghapus area parkir: ${area.nama_area}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting area:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
