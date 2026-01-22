'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { Header } from '@/app/components/dashboard/Header'
import { Sidebar } from '@/app/components/dashboard/Sidebar'
import {
  HomeIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { name: 'Dashboard', href: '/petugas', icon: <HomeIcon className="w-5 h-5" /> },
  { name: 'Kendaraan Masuk', href: '/petugas/masuk', icon: <ArrowDownCircleIcon className="w-5 h-5" /> },
  { name: 'Kendaraan Keluar', href: '/petugas/keluar', icon: <ArrowUpCircleIcon className="w-5 h-5" /> },
]

export default function PetugasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && user.role !== 'PETUGAS' && user.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user || (user.role !== 'PETUGAS' && user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-slate-900">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div className="hidden sm:block sm:w-64 sm:flex-shrink-0">
        <Sidebar navItems={navItems} />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="sm:hidden">
        <Sidebar navItems={navItems} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
