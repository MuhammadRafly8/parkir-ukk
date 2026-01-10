'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id_user: number
  username: string
  role: 'ADMIN' | 'PETUGAS' | 'OWNER'
  nama_lengkap: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking session:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok && data.user) {
        setUser(data.user)
        // Redirect based on role
        if (data.user.role === 'ADMIN') {
          router.push('/admin')
        } else if (data.user.role === 'PETUGAS') {
          router.push('/petugas')
        } else if (data.user.role === 'OWNER') {
          router.push('/manajemen')
        }
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login gagal' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Terjadi kesalahan saat login' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    checkSession,
    isAuthenticated: !!user,
  }
}
