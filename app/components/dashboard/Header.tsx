'use client'

import { useAuth } from '@/app/lib/hooks/useAuth'
import { Button } from '@/app/components/ui/Button'

export function Header() {
  const { user, logout } = useAuth()

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator'
      case 'PETUGAS':
        return 'Petugas'
      case 'OWNER':
        return 'Owner/Manajemen'
      default:
        return role
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Sistem Parkir
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.nama_lengkap}</p>
              <p className="text-xs text-gray-500">{getRoleLabel(user?.role || '')}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
