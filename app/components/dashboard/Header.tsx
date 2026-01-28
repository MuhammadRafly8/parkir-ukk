'use client'

import { useAuth } from '@/app/lib/hooks/useAuth'
import { ArrowLeftOnRectangleIcon, BellIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export function Header() {
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Fetch unread alerts count
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/alerts?unread_only=true')
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.length)
        }
      } catch (error) {
        console.error('Error fetching alerts:', error)
      }
    }

    fetchUnreadCount()
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

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
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-300 hover:text-white group relative"
                title="Notifications"
              >
                <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-slate-700/50">
                    <h3 className="text-sm font-semibold text-white">Recent Alerts</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {unreadCount > 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-slate-300 mb-2">You have {unreadCount} unread alerts</p>
                        <Link href="/admin/alerts" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                          View all alerts →
                        </Link>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-slate-400">No unread alerts</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
