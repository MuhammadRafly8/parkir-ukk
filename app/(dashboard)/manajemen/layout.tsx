'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { Header } from '@/app/components/dashboard/Header'
import { Sidebar } from '@/app/components/dashboard/Sidebar'
import {
  HomeIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { name: 'Dashboard', href: '/manajemen', icon: <HomeIcon className="w-5 h-5" /> },
  { name: 'Laporan', href: '/manajemen/laporan', icon: <DocumentChartBarIcon className="w-5 h-5" /> },
]

export default function ManajemenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar navItems={navItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {children}
        </main>
      </div>
    </div>
  )
}
