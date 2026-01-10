'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/app/lib/utils'

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

  return (
    <aside className="w-64 bg-gray-900 min-h-screen">
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
