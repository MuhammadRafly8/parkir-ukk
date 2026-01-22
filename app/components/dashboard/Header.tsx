'use client'

import { useAuth } from '@/app/lib/hooks/useAuth'
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

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
    <header className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-lg border-b border-slate-700/50 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Title - Hide on very small screens */}
          <div className="hidden sm:flex items-center">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Sistem Parkir
            </h1>
          </div>

          {/* User Info and Logout */}
          <div className="flex items-center space-x-3 sm:space-x-4 ml-auto">
            <div className="text-right hidden xs:block">
              <p className="text-xs sm:text-sm font-semibold text-slate-100 truncate max-w-[150px] sm:max-w-none">
                {user?.nama_lengkap}
              </p>
              <p className="text-xs text-slate-400">{getRoleLabel(user?.role || '')}</p>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
              {user?.nama_lengkap?.[0] || 'U'}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-white group"
              title="Logout"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
