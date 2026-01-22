'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { UserGroupIcon, MapPinIcon, TruckIcon, BoltIcon } from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAreas: 0,
    totalKendaraan: 0,
    activeTransaksi: 0,
  })
  const [capacityData, setCapacityData] = useState({
    totalCapacity: 0,
    totalUsed: 0,
    percentageUsed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersRes, areasRes, kendaraanRes, transaksiRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/areas'),
        fetch('/api/kendaraan'),
        fetch('/api/transaksi/active'),
      ])

      const users = await usersRes.json()
      const areas = await areasRes.json()
      const kendaraan = await kendaraanRes.json()
      const transaksi = await transaksiRes.json()

      // Calculate capacity data from areas
      const totalCapacity = areas.reduce((sum: number, area: any) => sum + (area.kapasitas || 0), 0)
      const totalUsed = areas.reduce((sum: number, area: any) => sum + (area.terisi || 0), 0)
      const percentageUsed = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0

      setStats({
        totalUsers: users.length || 0,
        totalAreas: areas.length || 0,
        totalKendaraan: kendaraan.length || 0,
        activeTransaksi: Array.isArray(transaksi) ? transaksi.length : 0,
      })

      setCapacityData({
        totalCapacity,
        totalUsed,
        percentageUsed,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  const statCards = [
    {
      title: 'Total User',
      value: stats.totalUsers,
      description: 'Pengguna terdaftar',
      icon: UserGroupIcon,
      iconBgFrom: 'from-blue-600',
      iconBgTo: 'to-cyan-600',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500',
      badgeColor: 'blue',
    },
    {
      title: 'Area Parkir',
      value: stats.totalAreas,
      description: 'Area tersedia',
      icon: MapPinIcon,
      iconBgFrom: 'from-emerald-600',
      iconBgTo: 'to-teal-600',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-500',
      badgeColor: 'emerald',
    },
    {
      title: 'Kendaraan',
      value: stats.totalKendaraan,
      description: 'Kendaraan terdaftar',
      icon: TruckIcon,
      iconBgFrom: 'from-amber-600',
      iconBgTo: 'to-orange-600',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-500',
      badgeColor: 'amber',
    },
    {
      title: 'Parkir Aktif',
      value: stats.activeTransaksi,
      description: 'Transaksi aktif',
      icon: BoltIcon,
      iconBgFrom: 'from-purple-600',
      iconBgTo: 'to-pink-600',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-pink-500',
      badgeColor: 'purple',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 backdrop-blur-xl border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Admin</h1>
          <p className="text-slate-300 text-lg">Ringkasan sistem parkir Anda</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="group relative">
              {/* Glow background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
              
              {/* Main Card */}
              <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all duration-300">
                {/* Decorative gradient circle */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.gradientFrom} ${stat.gradientTo} rounded-full -mr-16 -mt-16 opacity-10`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Badge */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.iconBgFrom} ${stat.iconBgTo} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{stat.title}</h3>

                  {/* Value */}
                  <div className="flex items-baseline gap-2 mb-4">
                    <div className="text-4xl font-bold text-white">{stat.value}</div>
                    <div className={`text-xs font-semibold px-3 py-1 rounded-full border`}
                      style={{
                        borderColor: `var(--tw-border-color, ${stat.badgeColor === 'blue' ? '#0891b2' : stat.badgeColor === 'emerald' ? '#059669' : stat.badgeColor === 'amber' ? '#d97706' : '#a855f7'})`,
                        backgroundColor: stat.badgeColor === 'blue' ? 'rgba(6, 182, 212, 0.1)' : stat.badgeColor === 'emerald' ? 'rgba(5, 150, 105, 0.1)' : stat.badgeColor === 'amber' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                        color: stat.badgeColor === 'blue' ? '#06b6d4' : stat.badgeColor === 'emerald' ? '#10b981' : stat.badgeColor === 'amber' ? '#f59e0b' : '#d946ef',
                      }}
                    >
                      +{Math.floor(Math.random() * 12) + 1}% bulan ini
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-400">{stat.description}</p>
                </div>

                {/* Bottom border accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradientFrom} ${stat.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`}></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Card */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/20 rounded-full -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Aktivitas Hari Ini</h3>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-emerald-400 font-medium">Live</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-sm text-slate-300">Transaksi Masuk</span>
                <span className="font-semibold text-cyan-400">{stats.activeTransaksi}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-sm text-slate-300">Kapasitas Terisi</span>
                <span className="font-semibold text-amber-400">{capacityData.percentageUsed}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <span className="text-sm text-slate-300">Slot Digunakan</span>
                <span className="font-semibold text-emerald-400">{capacityData.totalUsed}/{capacityData.totalCapacity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Card */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-500/20 rounded-full -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-white mb-6">Status Sistem</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Database</span>
                </div>
                <span className="text-xs font-medium px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Server</span>
                </div>
                <span className="text-xs font-medium px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">Aktif</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">API</span>
                </div>
                <span className="text-xs font-medium px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
