'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { SuccessAlert } from '@/app/components/shared/SuccessAlert'
import { Button } from '@/app/components/ui/Button'
import { Card } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { Table } from '@/app/components/ui/Table'

interface AreaParkir {
  id_area: number
  nama_area: string
  kapasitas: number
  kota: string
}

interface Slot {
  id_slot: number
  id_area: number
  nomor_slot: string
  status: 'TERSEDIA' | 'TERISI' | 'RUSAK'
  reserved: boolean
  id_transaksi: number | null
  areaParkir: AreaParkir
}

export default function SlotsManagementPage() {
  const [areas, setAreas] = useState<AreaParkir[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedArea, setSelectedArea] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    id_area: '',
    nomor_slot: '',
    status: 'TERSEDIA'
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchAreas()
    if (selectedArea) {
      fetchSlots(selectedArea)
    }
  }, [selectedArea])

  const fetchAreas = async () => {
    try {
      const res = await fetch('/api/areas')
      if (res.ok) {
        const data = await res.json()
        setAreas(data)
        if (data.length > 0 && !selectedArea) {
          setSelectedArea(data[0].id_area)
        }
      }
    } catch (error) {
      console.error('Error fetching areas:', error)
    }
  }

  const fetchSlots = async (id_area: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/slots?id_area=${id_area}`)
      if (res.ok) {
        const data = await res.json()
        setSlots(data)
        setError('')
      } else {
        setError('Gagal memuat slots')
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id_area || !formData.nomor_slot) {
      setError('Semua field harus diisi')
      return
    }

    try {
      const res = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_area: parseInt(formData.id_area),
          nomor_slot: formData.nomor_slot,
          status: formData.status
        })
      })

      if (res.ok) {
        setSuccess('Slot berhasil ditambahkan')
        setFormData({ id_area: '', nomor_slot: '', status: 'TERSEDIA' })
        setShowAddForm(false)
        if (selectedArea) {
          fetchSlots(selectedArea)
        }
      } else {
        const data = await res.json()
        setError(data.message || 'Gagal menambahkan slot')
      }
    } catch (error) {
      console.error('Error adding slot:', error)
      setError('Terjadi kesalahan')
    }
  }

  const handleUpdateStatus = async (id_slot: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/slots/${id_slot}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (res.ok) {
        setSuccess('Status slot berhasil diperbarui')
        if (selectedArea) {
          fetchSlots(selectedArea)
        }
      } else {
        setError('Gagal memperbarui status')
      }
    } catch (error) {
      console.error('Error updating slot:', error)
      setError('Terjadi kesalahan')
    }
  }

  const handleDeleteSlot = async (id_slot: number) => {
    if (!confirm('Hapus slot ini?')) return

    try {
      const res = await fetch(`/api/slots/${id_slot}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setSuccess('Slot berhasil dihapus')
        if (selectedArea) {
          fetchSlots(selectedArea)
        }
      } else {
        setError('Gagal menghapus slot')
      }
    } catch (error) {
      console.error('Error deleting slot:', error)
      setError('Terjadi kesalahan')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TERSEDIA':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'TERISI':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'RUSAK':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  const selectedAreaData = areas.find(a => a.id_area === selectedArea)
  const occupancy = slots.length > 0 ? (slots.filter(s => s.status === 'TERISI').length / slots.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 backdrop-blur-xl border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Manajemen Parking Slots</h1>
            <p className="text-slate-400 mt-2">Kelola slot parkir di setiap area</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            {showAddForm ? '✕ Batal' : '+ Tambah Slot'}
          </Button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess('')} />}

      {/* Area Selection */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">Pilih Area Parkir</label>
        <select 
          value={selectedArea || ''}
          onChange={(e) => setSelectedArea(parseInt(e.target.value))}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          {areas.map(area => (
            <option key={area.id_area} value={area.id_area}>
              {area.nama_area} ({area.kapasitas} kapasitas)
            </option>
          ))}
        </select>
      </div>

      {/* Add Slot Form */}
      {showAddForm && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Tambah Slot Baru</h2>
          <form onSubmit={handleAddSlot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Area Parkir</label>
              <select
                value={formData.id_area}
                onChange={(e) => setFormData({...formData, id_area: e.target.value})}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Nomor Slot</label>
              <Input
              type="text"
              placeholder="Contoh: A-001, B-005"
              value={formData.nomor_slot}
              onChange={(e) => setFormData({...formData, nomor_slot: e.target.value})}
              className="text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="TERSEDIA">Tersedia</option>
                <option value="TERISI">Terisi</option>
                <option value="RUSAK">Rusak</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">
              Simpan Slot
            </Button>
          </form>
        </div>
      )}

      {/* Area Info & Stats */}
      {selectedAreaData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <p className="text-sm text-slate-400 mb-1">Total Slots</p>
            <p className="text-3xl font-bold text-white">{slots.length}</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <p className="text-sm text-slate-400 mb-1">Terisi</p>
            <p className="text-3xl font-bold text-red-400">{slots.filter(s => s.status === 'TERISI').length}</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <p className="text-sm text-slate-400 mb-1">Occupancy Rate</p>
            <p className="text-3xl font-bold text-amber-400">{occupancy.toFixed(0)}%</p>
          </div>
        </div>
      )}

      {/* Slots Table */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : slots.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          Tidak ada slot untuk area ini
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-2xl border border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700/50">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-300">Nomor Slot</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-300">Status</th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-300">Reserved</th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-semibold text-slate-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id_slot} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-white font-medium">{slot.nomor_slot}</td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(slot.status)}`}>
                      {slot.status}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-300">
                    {slot.reserved ? '✓ Ya' : '✗ Tidak'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-end">
                      <select
                        value={slot.status}
                        onChange={(e) => handleUpdateStatus(slot.id_slot, e.target.value)}
                        className="text-xs px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500 whitespace-nowrap"
                      >
                        <option value="TERSEDIA">Tersedia</option>
                        <option value="TERISI">Terisi</option>
                        <option value="RUSAK">Rusak</option>
                      </select>
                      <button
                        onClick={() => handleDeleteSlot(slot.id_slot)}
                        className="text-xs px-2 py-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded text-red-300 transition-colors whitespace-nowrap"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
