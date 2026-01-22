'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/app/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/app/components/ui/Table'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { SuccessAlert } from '@/app/components/shared/SuccessAlert'
import { formatDateTime } from '@/app/lib/utils'

interface Area {
  id_area: number
  nama_area: string
  kapasitas: number
  terisi: number
  created_at: string
}

export default function SlotsPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    nama_area: '',
    kapasitas: '',
  })

  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    try {
      const res = await fetch('/api/areas')
      if (res.ok) {
        const data = await res.json()
        setAreas(data)
      }
    } catch (error) {
      console.error('Error fetching areas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingArea) {
        const res = await fetch(`/api/areas/${editingArea.id_area}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama_area: formData.nama_area,
            kapasitas: parseInt(formData.kapasitas),
          }),
        })

        const data = await res.json()

        if (res.ok) {
          setSuccess('Area parkir berhasil diupdate')
          setShowModal(false)
          resetForm()
          fetchAreas()
        } else {
          setError(data.error || 'Terjadi kesalahan')
        }
      } else {
        const res = await fetch('/api/areas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama_area: formData.nama_area,
            kapasitas: parseInt(formData.kapasitas),
          }),
        })

        const data = await res.json()

        if (res.ok) {
          setSuccess('Area parkir berhasil dibuat')
          setShowModal(false)
          resetForm()
          fetchAreas()
        } else {
          setError(data.error || 'Terjadi kesalahan')
        }
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus area parkir ini?')) return

    try {
      const res = await fetch(`/api/areas/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccess('Area parkir berhasil dihapus')
        fetchAreas()
      } else {
        const data = await res.json()
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    }
  }

  const handleEdit = (area: Area) => {
    setEditingArea(area)
    setFormData({
      nama_area: area.nama_area,
      kapasitas: area.kapasitas.toString(),
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      nama_area: '',
      kapasitas: '',
    })
    setEditingArea(null)
  }

  const openModal = () => {
    resetForm()
    setShowModal(true)
  }

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 backdrop-blur-xl border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Area Parkir</h1>
            <p className="text-slate-400 mt-2">Manajemen area dan slot parkir</p>
          </div>
          <Button onClick={openModal} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">Tambah Area</Button>
        </div>
      </div>

      {error && (
        <ErrorAlert message={error} onClose={() => setError('')} />
      )}

      {success && (
        <SuccessAlert message={success} onClose={() => setSuccess('')} />
      )}

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-800/50 border-b border-slate-700/50">
                <TableHeaderCell className="text-slate-300 font-semibold">Nama Area</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Kapasitas</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Terisi</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Tersedia</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Status</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Tanggal Dibuat</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Aksi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => {
                const tersedia = area.kapasitas - area.terisi
                const persentase = area.kapasitas > 0 ? (area.terisi / area.kapasitas) * 100 : 0
                return (
                  <TableRow key={area.id_area} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                    <TableCell className="text-slate-100 font-semibold">{area.nama_area}</TableCell>
                    <TableCell className="text-slate-400">{area.kapasitas}</TableCell>
                    <TableCell className="text-slate-100">{area.terisi}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${tersedia === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {tersedia}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-slate-700/50 rounded-full h-2 max-w-25">
                          <div
                            className={`h-2 rounded-full transition-all ${persentase >= 100 ? 'bg-gradient-to-r from-red-600 to-red-500' : persentase >= 80 ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-500'}`}
                            style={{ width: `${Math.min(persentase, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400 min-w-8.75">{persentase.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">{formatDateTime(area.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-colors" onClick={() => handleEdit(area)}>
                          Edit
                        </Button>
                        <Button size="sm" className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 transition-colors" onClick={() => handleDelete(area.id_area)}>
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700/50 shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5 rounded-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingArea ? 'Edit Area Parkir' : 'Tambah Area Parkir'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nama Area</label>
                  <input
                    type="text"
                    value={formData.nama_area}
                    onChange={(e) => setFormData({ ...formData, nama_area: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Kapasitas</label>
                  <input
                    type="number"
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                    min="1"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 rounded-lg transition-all">
                    {editingArea ? 'Update' : 'Tambah'}
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-lg transition-all border border-slate-600/50">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
