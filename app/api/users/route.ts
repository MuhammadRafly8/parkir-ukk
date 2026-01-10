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

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id_user: true,
        nama_lengkap: true,
        username: true,
        role: true,
        status_aktif: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
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
    const { nama_lengkap, username, password, role, status_aktif } = body

    if (!nama_lengkap || !username || !password || !role) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        nama_lengkap,
        username,
        password: hashedPassword,
        role,
        status_aktif: status_aktif !== undefined ? status_aktif : true,
      },
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

    await createActivityLog(session.id_user, `Menambah user: ${nama_lengkap}`)

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 400 }
      )
    }
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
