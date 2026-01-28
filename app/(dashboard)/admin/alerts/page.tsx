'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { SuccessAlert } from '@/app/components/shared/SuccessAlert'
import { Button } from '@/app/components/ui/Button'
import { Table } from '@/app/components/ui/Table'

interface Area {
  id_area: number
  nama_area: string
}

interface Alert {
  id_alert: number
  id_area: number
  tipe_alert: string
  pesan: string
  severity: 'LOW' | 'MEDIUM' | 'WARNING' | 'CRITICAL'
  is_read: boolean
  created_at: string
  areaParkir: Area
}

export default function AlertsManagementPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)
  const [formData, setFormData] = useState({
    id_area: '',
    tipe_alert: 'AREA_PENUH',
    pesan: '',
    severity: 'WARNING'
  })

  useEffect(() => {
    fetchAreas()
    fetchAlerts()
  }, [filterUnreadOnly])

  const fetchAreas = async () => {
    try {
      const res = await fetch('/api/areas')
      if (res.ok) {
        const data = await res.json()
        setAreas(data)
      }
    } catch (error) {
      console.error('Error fetching areas:', error)
    }
  }

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const query = filterUnreadOnly ? '?unread_only=true' : ''
      const res = await fetch(`/api/alerts${query}`)
      if (res.ok) {
        const data = await res.json()
        setAlerts(data)
        setError('')
      } else {
        setError('Gagal memuat alerts')
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id_area || !formData.pesan) {
      setError('Area dan pesan harus diisi')
      return
    }

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_area: parseInt(formData.id_area),
          tipe_alert: formData.tipe_alert,
          pesan: formData.pesan,
          severity: formData.severity
        })
      })

      if (res.ok) {
        setSuccess('Alert berhasil dibuat')
        setFormData({ id_area: '', tipe_alert: 'AREA_PENUH', pesan: '', severity: 'WARNING' })
        setShowAddForm(false)
        fetchAlerts()
      } else {
        setError('Gagal membuat alert')
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      setError('Terjadi kesalahan')
    }
  }

  const handleMarkAsRead = async (id_alert: number) => {
    try {
      const res = await fetch(`/api/alerts?id=${id_alert}`, {
        method: 'PATCH'
      })

      if (res.ok) {
        fetchAlerts()
      } else {
        setError('Gagal menandai sebagai dibaca')
      }
    } catch (error) {
      console.error('Error marking as read:', error)
      setError('Terjadi kesalahan')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'WARNING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'MEDIUM':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'LOW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AREA_PENUH':
        return '⚠️'
      case 'AREA_KOSONG':
        return '✅'
      case 'KENDARAAN_RUSAK':
        return '🔧'
      case 'SISTEM':
        return '⚙️'
      default:
        return 'ℹ️'
    }
  }

  const unreadCount = alerts.filter(a => !a.is_read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 backdrop-blur-xl border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Alerts & Notifications</h1>
            <p className="text-slate-400 mt-2">Kelola notifikasi sistem parkir</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white border-0"
          >
            {showAddForm ? '✕ Batal' : '+ Buat Alert'}
          </Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess('')} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <p className="text-sm text-slate-400 mb-1">Total Alerts</p>
          <p className="text-3xl font-bold text-white">{alerts.length}</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
          <p className="text-sm text-red-300 mb-1">Unread</p>
          <p className="text-3xl font-bold text-red-400">{unreadCount}</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6">
          <p className="text-sm text-emerald-300 mb-1">Read</p>
          <p className="text-3xl font-bold text-emerald-400">{alerts.length - unreadCount}</p>
        </div>
      </div>

      {/* Add Alert Form */}
      {showAddForm && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Buat Alert Baru</h2>
          <form onSubmit={handleAddAlert} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Area Parkir</label>
              <select
                value={formData.id_area}
                onChange={(e) => setFormData({...formData, id_area: e.target.value})}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Pilih Area</option>
                {areas.map(area => (
                  <option key={area.id_area} value={area.id_area}>
                    {area.nama_area}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipe Alert</label>
              <select
                value={formData.tipe_alert}
                onChange={(e) => setFormData({...formData, tipe_alert: e.target.value})}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="AREA_PENUH">Area Penuh</option>
                <option value="AREA_KOSONG">Area Kosong</option>
                <option value="KENDARAAN_RUSAK">Kendaraan Rusak</option>
                <option value="SISTEM">Sistem</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pesan</label>
              <textarea
                placeholder="Masukkan pesan alert..."
                value={formData.pesan}
                onChange={(e) => setFormData({...formData, pesan: e.target.value})}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                rows={3}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value})}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0">
              Simpan Alert
            </Button>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
          className={`${
            filterUnreadOnly 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-slate-700 hover:bg-slate-600'
          } text-white border-0`}
        >
          {filterUnreadOnly ? '✓ Unread Only' : 'All Alerts'}
        </Button>
      </div>

      {/* Alerts Table */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          Tidak ada alerts
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id_alert}
              className={`p-4 rounded-xl border transition-all ${
                alert.is_read 
                  ? 'bg-slate-900/30 border-slate-700/30' 
                  : 'bg-slate-900/60 border-slate-600/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  <div className="text-2xl flex-shrink-0">
                    {getTypeIcon(alert.tipe_alert)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{alert.areaParkir.nama_area}</h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium border w-fit ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      {!alert.is_read && (
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 w-fit">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{alert.pesan}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(alert.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!alert.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id_alert)}
                      className="text-xs px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-blue-300 transition-colors whitespace-nowrap"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
