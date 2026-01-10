'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on role
        if (user.role === 'ADMIN') {
          router.push('/admin')
        } else if (user.role === 'PETUGAS') {
          router.push('/petugas')
        } else if (user.role === 'OWNER') {
          router.push('/manajemen')
        }
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return null
}