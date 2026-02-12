'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import Link from 'next/link'
import { ArrowDownCircleIcon, ArrowUpCircleIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface TransactionData {
  id_parkir: number
  biaya_total: number
  user: {
    id_user: number
    nama_lengkap: string
    username: string
  }
}

interface OfficerRevenue {
  totalRevenue: number
  transactionCount: number
}

export default function PetugasDashboard() {
  const [stats, setStats] = useState({
    activeTransaksi: 0,
    totalToday: 0,
  })
  const [officerRevenue, setOfficerRevenue] = useState<OfficerRevenue | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get current user session
      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()
      const session = sessionData.user
      setCurrentUser(session)

      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)
      const tomorrow = new Date(todayDate)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [activeRes, keluar] = await Promise.all([
        fetch('/api/transaksi/active'),
        fetch(`/api/transaksi?status=KELUAR&start_date=${todayDate.toISOString()}&end_date=${tomorrow.toISOString()}`),
      ])

      const active = await activeRes.json()
      const keluarData = await keluar.json()

      // Filter dan hitung hanya untuk petugas yang login
      let totalRevenue = 0
      let transactionCount = 0

      if (Array.isArray(keluarData) && session?.id_user) {
        keluarData.forEach((transaksi: TransactionData) => {
          if (transaksi.user.id_user === session.id_user) {
            const amount = transaksi.biaya_total || 0
            totalRevenue += amount
            transactionCount += 1
          }
        })
      }

      setStats({
        activeTransaksi: Array.isArray(active) ? active.length : 0,
        totalToday: Array.isArray(keluarData) ? keluarData.length : 0,
      })
      
      if (session?.id_user) {
        setOfficerRevenue({
          totalRevenue,
          transactionCount,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Dashboard Petugas
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
          <p className="text-slate-300 text-lg">Kelola transaksi parkir dengan mudah dan efisien</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Active Transactions Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-700/50 shadow-lg shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">Parkir Aktif</p>
                  </div>
                  <div className="text-5xl sm:text-6xl font-bold text-white mb-2">
                    {stats.activeTransaksi}
                  </div>
                  <p className="text-sm text-slate-400">Kendaraan sedang parkir</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today Revenue Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-700/50 shadow-lg shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">Pemasukan Hari Ini</p>
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                    {formatCurrency(officerRevenue?.totalRevenue || 0)}
                  </div>
                  <p className="text-sm text-slate-400">{officerRevenue?.transactionCount || 0} transaksi selesai</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Kendaraan Masuk */}
          <Link href="/petugas/masuk" className="group">
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-700/50 shadow-lg shadow-green-500/5 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-500/50 transition-all duration-300 cursor-pointer h-full flex items-center">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ArrowDownCircleIcon className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">Kendaraan Masuk</h3>
                    <p className="text-sm text-slate-400 group-hover:text-green-400/70 transition-colors">Catat kendaraan masuk area parkir</p>
                  </div>
                  <span className="text-3xl text-slate-500 group-hover:text-green-400 group-hover:translate-x-2 transition-all duration-300">→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Kendaraan Keluar */}
          <Link href="/petugas/keluar" className="group">
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-700/50 shadow-lg shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all duration-300 cursor-pointer h-full flex items-center">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ArrowUpCircleIcon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Kendaraan Keluar</h3>
                    <p className="text-sm text-slate-400 group-hover:text-blue-400/70 transition-colors">Proses kendaraan keluar dari parkir</p>
                  </div>
                  <span className="text-3xl text-slate-500 group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-300">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          <div className="relative bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl border border-blue-200/30 p-6 sm:p-8 backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-xl">ℹ️</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">Panduan Penggunaan</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Gunakan menu di atas untuk mencatat kendaraan masuk atau melakukan proses pembayaran untuk kendaraan keluar. Semua data akan tersimpan otomatis di sistem dan dapat diakses kapan saja.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
