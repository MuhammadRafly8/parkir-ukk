'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/app/lib/utils'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
}

interface SidebarProps {
  navItems: NavItem[]
}

export function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        {isOpen ? (
          <XMarkIcon className="w-6 h-6" />
        ) : (
          <Bars3Icon className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed sm:static sm:w-64 w-64 h-screen sm:min-h-screen transform sm:transform-none transition-transform duration-300 z-40',
          'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-8 border-b border-slate-700/50">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
                🅿️
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Parkir
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span className={cn(
                    'mr-3 transition-transform duration-200',
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
