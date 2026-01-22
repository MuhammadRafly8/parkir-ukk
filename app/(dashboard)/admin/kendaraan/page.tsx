'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/app/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/app/components/ui/Table'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { SuccessAlert } from '@/app/components/shared/SuccessAlert'
import { formatDateTime } from '@/app/lib/utils'

interface Kendaraan {
  id_kendaraan: number
  plat_nomor: string
  jenis_kendaraan: string
  warna: string
  pemilik: string
  id_user: number
  user: {
    id_user: number
    nama_lengkap: string
    username: string
  }
  created_at: string
}

interface User {
  id_user: number
  nama_lengkap: string
  username: string
}

export default function KendaraanPage() {
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingKendaraan, setEditingKendaraan] = useState<Kendaraan | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchPlat, setSearchPlat] = useState('')
  const [formData, setFormData] = useState({
    plat_nomor: '',
    jenis_kendaraan: 'MOTOR',
    warna: '',
    pemilik: '',
    id_user: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchPlat) {
      fetchKendaraan(searchPlat)
    } else {
      fetchKendaraan()
    }
  }, [searchPlat])

  const fetchData = async () => {
    try {
      const [kendaraanRes, usersRes] = await Promise.all([
        fetch('/api/kendaraan'),
        fetch('/api/users'),
      ])

      if (kendaraanRes.ok) {
        const data = await kendaraanRes.json()
        setKendaraan(data)
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchKendaraan = async (platNomor?: string) => {
    try {
      const url = platNomor ? `/api/kendaraan?plat_nomor=${platNomor}` : '/api/kendaraan'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setKendaraan(data)
      }
    } catch (error) {
      console.error('Error fetching kendaraan:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingKendaraan) {
        const res = await fetch(`/api/kendaraan/${editingKendaraan.id_kendaraan}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plat_nomor: formData.plat_nomor,
            jenis_kendaraan: formData.jenis_kendaraan,
            warna: formData.warna,
            pemilik: formData.pemilik,
            id_user: parseInt(formData.id_user),
          }),
        })

        const data = await res.json()

        if (res.ok) {
          setSuccess('Kendaraan berhasil diupdate')
          setShowModal(false)
          resetForm()
          fetchKendaraan()
        } else {
          setError(data.error || 'Terjadi kesalahan')
        }
      } else {
        const res = await fetch('/api/kendaraan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plat_nomor: formData.plat_nomor,
            jenis_kendaraan: formData.jenis_kendaraan,
            warna: formData.warna,
            pemilik: formData.pemilik,
            id_user: parseInt(formData.id_user),
          }),
        })

        const data = await res.json()

        if (res.ok) {
          setSuccess('Kendaraan berhasil dibuat')
          setShowModal(false)
          resetForm()
          fetchKendaraan()
        } else {
          setError(data.error || 'Terjadi kesalahan')
        }
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kendaraan ini?')) return

    try {
      const res = await fetch(`/api/kendaraan/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccess('Kendaraan berhasil dihapus')
        fetchKendaraan()
      } else {
        const data = await res.json()
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    }
  }

  const handleEdit = (kendaraan: Kendaraan) => {
    setEditingKendaraan(kendaraan)
    setFormData({
      plat_nomor: kendaraan.plat_nomor,
      jenis_kendaraan: kendaraan.jenis_kendaraan,
      warna: kendaraan.warna,
      pemilik: kendaraan.pemilik,
      id_user: kendaraan.id_user.toString(),
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      plat_nomor: '',
      jenis_kendaraan: 'MOTOR',
      warna: '',
      pemilik: '',
      id_user: '',
    })
    setEditingKendaraan(null)
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Kendaraan</h1>
            <p className="text-slate-400 mt-2">Manajemen data kendaraan</p>
          </div>
          <Button onClick={openModal} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0">Tambah Kendaraan</Button>
        </div>
      </div>

      {error && (
        <ErrorAlert message={error} onClose={() => setError('')} />
      )}

      {success && (
        <SuccessAlert message={success} onClose={() => setSuccess('')} />
      )}

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50">
          <input
            type="text"
            value={searchPlat}
            onChange={(e) => setSearchPlat(e.target.value)}
            placeholder="Cari plat nomor..."
            className="w-full max-w-md bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-800/50 border-b border-slate-700/50">
                <TableHeaderCell className="text-slate-300 font-semibold">Plat Nomor</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Jenis</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Warna</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Pemilik</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">User</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Tanggal Dibuat</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Aksi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kendaraan.map((k) => (
                <TableRow key={k.id_kendaraan} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                  <TableCell className="text-slate-100 font-mono font-semibold">{k.plat_nomor}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded bg-slate-800/50 text-slate-300 text-xs font-medium">
                      {k.jenis_kendaraan}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-400">{k.warna}</TableCell>
                  <TableCell className="text-slate-100">{k.pemilik}</TableCell>
                  <TableCell className="text-slate-400">{k.user?.nama_lengkap || '-'}</TableCell>
                  <TableCell className="text-slate-400 text-sm">{formatDateTime(k.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-colors" onClick={() => handleEdit(k)}>
                        Edit
                      </Button>
                      <Button size="sm" className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 transition-colors" onClick={() => handleDelete(k.id_kendaraan)}>
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-teal-500/5 rounded-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingKendaraan ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Plat Nomor</label>
                  <input
                    type="text"
                    value={formData.plat_nomor}
                    onChange={(e) => setFormData({ ...formData, plat_nomor: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Jenis Kendaraan</label>
                  <select
                    value={formData.jenis_kendaraan}
                    onChange={(e) => setFormData({ ...formData, jenis_kendaraan: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  >
                    <option value="MOTOR">Motor</option>
                    <option value="MOBIL">Mobil</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Warna</label>
                  <input
                    type="text"
                    value={formData.warna}
                    onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Pemilik</label>
                  <input
                    type="text"
                    value={formData.pemilik}
                    onChange={(e) => setFormData({ ...formData, pemilik: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">User</label>
                  <select
                    value={formData.id_user}
                    onChange={(e) => setFormData({ ...formData, id_user: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    required
                  >
                    <option value="">Pilih User...</option>
                    {users.map((user) => (
                      <option key={user.id_user} value={user.id_user.toString()}>
                        {user.nama_lengkap} ({user.username})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 rounded-lg transition-all">
                    {editingKendaraan ? 'Update' : 'Tambah'}
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
