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
    const { tarif_per_jam } = body

    if (!tarif_per_jam) {
      return NextResponse.json(
        { error: 'Tarif per jam harus diisi' },
        { status: 400 }
      )
    }

    const tarif = await prisma.tarif.update({
      where: { id_tarif: parseInt(id) },
      data: { tarif_per_jam },
    })

    await createActivityLog(session.id_user, `Mengupdate tarif: ${tarif.jenis_kendaraan}`)

    return NextResponse.json({
      ...tarif,
      tarif_per_jam: Number(tarif.tarif_per_jam),
    })
  } catch (error) {
    console.error('Error updating tarif:', error)
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
    const tarif = await prisma.tarif.findUnique({
      where: { id_tarif: parseInt(id) },
    })

    if (!tarif) {
      return NextResponse.json({ error: 'Tarif tidak ditemukan' }, { status: 404 })
    }

    await prisma.tarif.delete({
      where: { id_tarif: parseInt(id) },
    })

    await createActivityLog(session.id_user, `Menghapus tarif: ${tarif.jenis_kendaraan}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tarif:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
