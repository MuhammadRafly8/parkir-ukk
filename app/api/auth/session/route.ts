import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json({ user: null })
    }

    const user = JSON.parse(userCookie.value)
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}
