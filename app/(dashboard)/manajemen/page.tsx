'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import Link from 'next/link'
import { DocumentChartBarIcon, CreditCardIcon, ArrowTrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function ManajemenDashboard() {
  const [stats, setStats] = useState({
    totalToday: 0,
    pendapatanToday: 0,
    activeTransaksi: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)
      const tomorrow = new Date(todayDate)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [todayRes, activeRes] = await Promise.all([
        fetch(`/api/transaksi?start_date=${todayDate.toISOString()}&end_date=${tomorrow.toISOString()}&status=KELUAR`),
        fetch('/api/transaksi/active'),
      ])

      const todayData = await todayRes.json()
      const active = await activeRes.json()

      const pendapatan = Array.isArray(todayData) ? todayData.reduce((sum: number, t: any) => {
        return sum + (t.biaya_total ? Number(t.biaya_total) : 0)
      }, 0) : 0

      setStats({
        totalToday: Array.isArray(todayData) ? todayData.length : 0,
        pendapatanToday: pendapatan,
        activeTransaksi: Array.isArray(active) ? active.length : 0,
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
      title: 'Transaksi Hari Ini',
      value: stats.totalToday,
      description: 'Transaksi selesai hari ini',
      icon: ArrowTrendingUpIcon,
      iconBgFrom: 'from-blue-600',
      iconBgTo: 'to-cyan-600',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500',
      badgeColor: 'blue',
    },
    {
      title: 'Pendapatan Hari Ini',
      value: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(stats.pendapatanToday),
      description: 'Total pendapatan hari ini',
      icon: CreditCardIcon,
      iconBgFrom: 'from-emerald-600',
      iconBgTo: 'to-teal-600',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-500',
      badgeColor: 'emerald',
    },
    {
      title: 'Parkir Aktif',
      value: stats.activeTransaksi,
      description: 'Kendaraan sedang parkir',
      icon: ClockIcon,
      iconBgFrom: 'from-amber-600',
      iconBgTo: 'to-orange-600',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-500',
      badgeColor: 'amber',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 backdrop-blur-xl border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard Manajemen</h1>
          <p className="text-slate-300 text-lg">Overview dan laporan parkir Anda</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="group relative">
              {/* Glow background on hover */}
              <div className={`absolute inset-0 bg-linear-to-br ${stat.gradientFrom} ${stat.gradientTo} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
              
              {/* Main Card */}
              <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all duration-300">
                {/* Decorative gradient circle */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-bl ${stat.gradientFrom} ${stat.gradientTo} rounded-full -mr-16 -mt-16 opacity-10`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Badge */}
                  <div className={`w-14 h-14 bg-linear-to-br ${stat.iconBgFrom} ${stat.iconBgTo} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">{stat.title}</h3>

                  {/* Value */}
                  <div className="text-3xl font-bold text-white mb-4 break-all">{stat.value}</div>

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

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 gap-6">
        <Link href="/manajemen/laporan" className="group">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-bl from-purple-500/20 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="relative z-10 flex items-center space-x-6">
              <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DocumentChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Laporan Transaksi</h3>
                <p className="text-slate-400">Lihat dan generate laporan transaksi parkir dengan filter tanggal</p>
              </div>
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800/50 group-hover:bg-purple-600/30 transition-colors">
                <svg className="w-6 h-6 text-slate-400 group-hover:text-purple-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Summary */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/20 rounded-full -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-white mb-6">Ringkasan Hari Ini</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Total Transaksi</span>
                </div>
                <span className="font-bold text-cyan-400">{stats.totalToday}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Pendapatan</span>
                </div>
                <span className="font-bold text-emerald-400">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(stats.pendapatanToday)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-slate-300">Sedang Parkir</span>
                </div>
                <span className="font-bold text-amber-400">{stats.activeTransaksi}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-rose-500/20 rounded-full -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-white mb-6">Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Rata-rata Pendapatan/Transaksi</span>
                  <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded-full border border-rose-500/30">Hari Ini</span>
                </div>
                <p className="text-xl font-bold text-rose-300">
                  {stats.totalToday > 0 
                    ? new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(stats.pendapatanToday / stats.totalToday)
                    : 'Rp 0'}
                </p>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Status Operasional</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-400 font-medium">Online</span>
                  </div>
                </div>
                <p className="text-sm text-slate-300">Sistem berjalan normal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
