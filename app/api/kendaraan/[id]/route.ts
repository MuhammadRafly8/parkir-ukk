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
    const { plat_nomor, jenis_kendaraan, warna, pemilik, id_user } = body

    const updateData: any = {}
    if (plat_nomor) updateData.plat_nomor = plat_nomor.toUpperCase()
    if (jenis_kendaraan) updateData.jenis_kendaraan = jenis_kendaraan
    if (warna) updateData.warna = warna
    if (pemilik) updateData.pemilik = pemilik
    if (id_user) updateData.id_user = parseInt(id_user)

    const kendaraan = await prisma.kendaraan.update({
      where: { id_kendaraan: parseInt(id) },
      data: updateData,
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

    await createActivityLog(session.id_user, `Mengupdate kendaraan: ${kendaraan.plat_nomor}`)

    return NextResponse.json(kendaraan)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Plat nomor sudah terdaftar' },
        { status: 400 }
      )
    }
    console.error('Error updating kendaraan:', error)
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
    const kendaraan = await prisma.kendaraan.findUnique({
      where: { id_kendaraan: parseInt(id) },
    })

    if (!kendaraan) {
      return NextResponse.json({ error: 'Kendaraan tidak ditemukan' }, { status: 404 })
    }

    // Cek apakah ada transaksi yang mereferensi kendaraan ini
    const transaksiCount = await prisma.transaksi.count({
      where: { id_kendaraan: parseInt(id) },
    })

    if (transaksiCount > 0) {
      return NextResponse.json(
        { error: 'Kendaraan memiliki transaksi terkait. Hapus transaksi terlebih dahulu.' },
        { status: 400 }
      )
    }

    await prisma.kendaraan.delete({
      where: { id_kendaraan: parseInt(id) },
    })

    await createActivityLog(session.id_user, `Menghapus kendaraan: ${kendaraan.plat_nomor}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting kendaraan:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
