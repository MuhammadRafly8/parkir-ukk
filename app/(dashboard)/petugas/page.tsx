'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import Link from 'next/link'
import { ArrowDownCircleIcon, ArrowUpCircleIcon, ClockIcon, CalendarIcon, BellIcon, XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface Alert {
  id_alert: number
  id_area: number
  tipe_alert: string
  pesan: string
  severity: string
  is_read: boolean
  created_at: string
  areaParkir: {
    nama_area: string
  }
}

export default function PetugasDashboard() {
  const [stats, setStats] = useState({
    activeTransaksi: 0,
    totalToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showAlertsModal, setShowAlertsModal] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchStats()
    fetchUnreadCount()
  }, [])

  const fetchStats = async () => {
    try {
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)
      const tomorrow = new Date(todayDate)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [activeRes, todayRes] = await Promise.all([
        fetch('/api/transaksi/active'),
        fetch(`/api/transaksi?start_date=${todayDate.toISOString()}&end_date=${tomorrow.toISOString()}`),
      ])

      const active = await activeRes.json()
      const todayData = await todayRes.json()

      setStats({
        activeTransaksi: Array.isArray(active) ? active.length : 0,
        totalToday: Array.isArray(todayData) ? todayData.length : 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/alerts?unread_only=true')
      const data = await response.json()
      setUnreadCount(Array.isArray(data) ? data.length : 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const openAlertsModal = async () => {
    setShowAlertsModal(true)
    setAlertsLoading(true)
    try {
      const response = await fetch('/api/alerts')
      const data = await response.json()
      setAlerts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setAlertsLoading(false)
    }
  }

  const markAsRead = async (alertId: number) => {
    try {
      await fetch(`/api/alerts?id=${alertId}`, {
        method: 'PATCH',
      })
      setAlerts(alerts.map(alert =>
        alert.id_alert === alertId ? { ...alert, is_read: true } : alert
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      case 'WARNING':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'INFO':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'border-red-500/50 bg-red-500/10'
      case 'WARNING':
        return 'border-yellow-500/50 bg-yellow-500/10'
      case 'INFO':
        return 'border-blue-500/50 bg-blue-500/10'
      default:
        return 'border-gray-500/50 bg-gray-500/10'
    }
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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              Dashboard Petugas
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
            <p className="text-slate-300 text-lg">Kelola transaksi parkir dengan mudah dan efisien</p>
          </div>

          {/* Alerts Button */}
          <button
            onClick={openAlertsModal}
            className="relative p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl border border-slate-700/50 transition-all duration-300 group"
          >
            <BellIcon className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
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

          {/* Today Transactions Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-700/50 shadow-lg shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">Hari Ini</p>
                  </div>
                  <div className="text-5xl sm:text-6xl font-bold text-white mb-2">
                    {stats.totalToday}
                  </div>
                  <p className="text-sm text-slate-400">Total transaksi</p>
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
