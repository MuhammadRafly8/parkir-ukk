'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { Button } from '@/app/components/ui/Button'
import { Card } from '@/app/components/ui/Card'

interface Analytics {
  summary: {
    totalTransaksiHariIni: number
    totalRevenue: number
    kendaraanAktif: number
    unreadAlerts: number
  }
  occupancyByArea: Array<{
    id_area: number
    nama_area: string
    kapasitas: number
    terisi: number
    aktif: number
    persentase: number
  }>
  transaksiByHour: Array<{
    jam: string
    count: number
  }>
  revenueByVehicleType: Array<{
    jenis_kendaraan: string
    count: number
    total_revenue: number
    average_revenue: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    
    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 30000) // Refresh setiap 30 detik
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics')
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
        setError('')
      } else {
        setError('Gagal memuat analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value)
  }

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Dashboard Analytics</h1>
        <ErrorAlert message="Tidak ada data analytics" onClose={() => setError('')} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 backdrop-blur-xl border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Analytics</h1>
            <p className="text-slate-400 mt-2">Realtime parking analytics & insights</p>
          </div>
          <Button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`${autoRefresh ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-600'} text-white border-0`}
          >
            {autoRefresh ? '🔄 Live' : '⏸ Paused'}
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert message={error} onClose={() => setError('')} />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Transaksi */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Transaksi Hari Ini</p>
              <div className="text-3xl font-bold text-white mb-2">{analytics.summary.totalTransaksiHariIni}</div>
              <div className="text-xs text-slate-500">Transaksi parkir</div>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Pendapatan</p>
              <div className="text-2xl font-bold text-emerald-400 mb-2">{formatCurrency(analytics.summary.totalRevenue)}</div>
              <div className="text-xs text-slate-500">Hari ini</div>
            </div>
          </div>
        </div>

        {/* Kendaraan Aktif */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Kendaraan Aktif</p>
              <div className="text-3xl font-bold text-amber-400 mb-2">{analytics.summary.kendaraanAktif}</div>
              <div className="text-xs text-slate-500">Sedang parkir</div>
            </div>
          </div>
        </div>

        {/* Unread Alerts */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Unread Alerts</p>
              <div className="text-3xl font-bold text-red-400 mb-2">{analytics.summary.unreadAlerts}</div>
              <div className="text-xs text-slate-500">Notifikasi penting</div>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Rate */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-semibold text-white mb-6">Occupancy Rate per Area</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.occupancyByArea.map((area) => (
              <div key={area.id_area} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{area.nama_area}</h3>
                    <p className="text-sm text-slate-400">{area.terisi} / {area.kapasitas} slots</p>
                  </div>
                  <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                    area.persentase >= 100 ? 'bg-red-500/20 text-red-300' :
                    area.persentase >= 80 ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {area.persentase.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      area.persentase >= 100 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                      area.persentase >= 80 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
                      'bg-gradient-to-r from-emerald-600 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(area.persentase, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaksi per Jam */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-semibold text-white mb-6">Transaksi per Jam (24 Jam Terakhir)</h2>
          <div className="flex items-end justify-between h-64 gap-1">
            {analytics.transaksiByHour.length > 0 ? (
              analytics.transaksiByHour.map((item, idx) => {
                const maxCount = Math.max(...analytics.transaksiByHour.map(t => t.count))
                const height = (item.count / maxCount) * 100
                return (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${item.jam}: ${item.count} transaksi`}
                    ></div>
                    <p className="text-xs text-slate-400 mt-2 text-center truncate">{item.jam}</p>
                  </div>
                )
              })
            ) : (
              <div className="w-full text-center text-slate-400">Tidak ada data</div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue by Vehicle Type */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-semibold text-white mb-6">Revenue per Jenis Kendaraan</h2>
          <div className="space-y-4">
            {analytics.revenueByVehicleType.map((item) => (
              <div key={item.jenis_kendaraan} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-white">{item.jenis_kendaraan}</h3>
                  <span className="text-sm text-slate-400">{item.count} transaksi</span>
                </div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(item.total_revenue)}</p>
                    <p className="text-xs text-slate-500">Rata-rata: {formatCurrency(item.average_revenue)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
