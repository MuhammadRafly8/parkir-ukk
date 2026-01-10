import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/app/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      )
    }

    const user = await loginUser(username, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Set cookie untuk session (simplified - dalam production gunakan JWT atau session store)
    const cookieStore = await cookies()
    cookieStore.set('user', JSON.stringify({
      id_user: user.id_user,
      username: user.username,
      role: user.role,
      nama_lengkap: user.nama_lengkap,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: {
        id_user: user.id_user,
        username: user.username,
        role: user.role,
        nama_lengkap: user.nama_lengkap,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
}
