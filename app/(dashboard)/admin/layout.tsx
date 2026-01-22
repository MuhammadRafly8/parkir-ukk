'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { Header } from '@/app/components/dashboard/Header'
import { Sidebar } from '@/app/components/dashboard/Sidebar'
import {
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  TruckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: <HomeIcon className="w-5 h-5" /> },
  { name: 'Kelola User', href: '/admin/users', icon: <UserGroupIcon className="w-5 h-5" /> },
  { name: 'Tarif Parkir', href: '/admin/tariffs', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
  { name: 'Area Parkir', href: '/admin/slots', icon: <MapPinIcon className="w-5 h-5" /> },
  { name: 'Kendaraan', href: '/admin/kendaraan', icon: <TruckIcon className="w-5 h-5" /> },
  { name: 'Log Aktifitas', href: '/admin/logs', icon: <DocumentTextIcon className="w-5 h-5" /> },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== 'ADMIN') {
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