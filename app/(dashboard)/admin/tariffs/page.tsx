'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/app/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/app/components/ui/Table'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { SuccessAlert } from '@/app/components/shared/SuccessAlert'
import { formatCurrency, formatDateTime } from '@/app/lib/utils'

interface Tarif {
  id_tarif: number
  jenis_kendaraan: string
  tarif_per_jam: number
  created_at: string
}

export default function TariffsPage() {
  const [tarifs, setTarifs] = useState<Tarif[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTarif, setEditingTarif] = useState<Tarif | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    jenis_kendaraan: 'MOTOR',
    tarif_per_jam: '',
  })

  useEffect(() => {
    fetchTarifs()
  }, [])

  const fetchTarifs = async () => {
    try {
      const res = await fetch('/api/tarifs')
      if (res.ok) {
        const data = await res.json()
        setTarifs(data)
      }
    } catch (error) {
      console.error('Error fetching tarifs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingTarif) {
        const res = await fetch(`/api/tarifs/${editingTarif.id_tarif}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tarif_per_jam: parseFloat(formData.tarif_per_jam) }),
        })

        const data = await res.json()

        if (res.ok) {
          setSuccess('Tarif berhasil diupdate')
          setShowModal(false)
          resetForm()
          fetchTarifs()
        } else {
          setError(data.error || 'Terjadi kesalahan')
        }
      } else {
        const res = await fetch('/api/tarifs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jenis_kendaraan: formData.jenis_kendaraan,
            tarif_per_jam: parseFloat(formData.tarif_per_jam),
          }),
        })

        const data = await res.json()

        if (res.ok) {
          setSuccess('Tarif berhasil dibuat')
          setShowModal(false)
          resetForm()
          fetchTarifs()
        } else {
          setError(data.error || 'Terjadi kesalahan')
        }
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus tarif ini?')) return

    try {
      const res = await fetch(`/api/tarifs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccess('Tarif berhasil dihapus')
        fetchTarifs()
      } else {
        const data = await res.json()
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    }
  }

  const handleEdit = (tarif: Tarif) => {
    setEditingTarif(tarif)
    setFormData({
      jenis_kendaraan: tarif.jenis_kendaraan,
      tarif_per_jam: tarif.tarif_per_jam.toString(),
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      jenis_kendaraan: 'MOTOR',
      tarif_per_jam: '',
    })
    setEditingTarif(null)
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
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Tarif Parkir</h1>
            <p className="text-slate-400 mt-2">Manajemen tarif parkir per jam</p>
          </div>
          <Button onClick={openModal} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0">Tambah Tarif</Button>
        </div>
      </div>

      {error && (
        <ErrorAlert message={error} onClose={() => setError('')} />
      )}

      {success && (
        <SuccessAlert message={success} onClose={() => setSuccess('')} />
      )}

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-800/50 border-b border-slate-700/50">
              <TableHeaderCell className="text-slate-300 font-semibold pl-4 sm:pl-6">Jenis Kendaraan</TableHeaderCell>
              <TableHeaderCell className="text-slate-300 font-semibold hidden sm:table-cell">Tarif per Jam</TableHeaderCell>
              <TableHeaderCell className="text-slate-300 font-semibold hidden md:table-cell">Tanggal Dibuat</TableHeaderCell>
              <TableHeaderCell className="text-slate-300 font-semibold pr-2 sm:pr-6">Aksi</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tarifs.map((tarif) => (
              <TableRow key={tarif.id_tarif} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                <TableCell className="pl-4 sm:pl-6">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 text-sm font-medium border border-amber-500/30 w-fit">
                      {tarif.jenis_kendaraan}
                    </span>
                    <div className="sm:hidden space-y-1">
                      <div className="text-xs text-slate-100 font-semibold">{formatCurrency(tarif.tarif_per_jam)}</div>
                      <div className="text-xs text-slate-400">{formatDateTime(tarif.created_at)}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-100 font-semibold hidden sm:table-cell">{formatCurrency(tarif.tarif_per_jam)}</TableCell>
                <TableCell className="text-slate-400 text-sm hidden md:table-cell">{formatDateTime(tarif.created_at)}</TableCell>
                <TableCell className="pr-2 sm:pr-6">
                  <div className="flex flex-col sm:flex-row gap-1 justify-end">
                    <Button size="sm" className="bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 transition-colors text-xs sm:text-sm whitespace-nowrap" onClick={() => handleEdit(tarif)}>
                      Edit
                    </Button>
                    <Button size="sm" className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 transition-colors text-xs sm:text-sm whitespace-nowrap" onClick={() => handleDelete(tarif.id_tarif)}>
                      Hapus
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingTarif ? 'Edit Tarif' : 'Tambah Tarif'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Jenis Kendaraan</label>
                  <select
                    value={formData.jenis_kendaraan}
                    onChange={(e) => setFormData({ ...formData, jenis_kendaraan: e.target.value })}
                    disabled={!!editingTarif}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
                    required
                  >
                    <option value="MOTOR">Motor</option>
                    <option value="MOBIL">Mobil</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Tarif per Jam</label>
                  <input
                    type="number"
                    value={formData.tarif_per_jam}
                    onChange={(e) => setFormData({ ...formData, tarif_per_jam: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    required
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium py-2 rounded-lg transition-all">
                    {editingTarif ? 'Update' : 'Tambah'}
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
