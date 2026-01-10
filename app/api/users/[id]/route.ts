import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { hashPassword, createActivityLog } from '@/app/lib/auth'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')
  if (!userCookie) return null
  return JSON.parse(userCookie.value)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id_user: parseInt(id) },
      select: {
        id_user: true,
        nama_lengkap: true,
        username: true,
        role: true,
        status_aktif: true,
        created_at: true,
        updated_at: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
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
    const { nama_lengkap, username, password, role, status_aktif } = body

    const updateData: any = {
      nama_lengkap,
      username,
      role,
      status_aktif,
    }

    if (password) {
      updateData.password = await hashPassword(password)
    }

    const user = await prisma.user.update({
      where: { id_user: parseInt(id) },
      data: updateData,
      select: {
        id_user: true,
        nama_lengkap: true,
        username: true,
        role: true,
        status_aktif: true,
        created_at: true,
        updated_at: true,
      },
    })

    await createActivityLog(session.id_user, `Mengupdate user: ${nama_lengkap}`)

    return NextResponse.json(user)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      )
    }
    console.error('Error updating user:', error)
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
    const userId = parseInt(id)

    if (userId === session.id_user) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun sendiri' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id_user: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    await prisma.user.delete({
      where: { id_user: userId },
    })

    await createActivityLog(session.id_user, `Menghapus user: ${user.nama_lengkap}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
