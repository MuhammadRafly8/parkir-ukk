'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Kendaraan</h1>
          <p className="text-gray-600 mt-2">Manajemen data kendaraan</p>
        </div>
        <Button onClick={openModal}>Tambah Kendaraan</Button>
      </div>

      {error && (
        <ErrorAlert message={error} onClose={() => setError('')} />
      )}

      {success && (
        <SuccessAlert message={success} onClose={() => setSuccess('')} />
      )}

      <Card>
        <CardHeader>
          <Input
            label="Cari Plat Nomor"
            value={searchPlat}
            onChange={(e) => setSearchPlat(e.target.value)}
            placeholder="Masukkan plat nomor..."
            className="max-w-md"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Plat Nomor</TableHeaderCell>
                <TableHeaderCell>Jenis</TableHeaderCell>
                <TableHeaderCell>Warna</TableHeaderCell>
                <TableHeaderCell>Pemilik</TableHeaderCell>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Tanggal Dibuat</TableHeaderCell>
                <TableHeaderCell>Aksi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kendaraan.map((k) => (
                <TableRow key={k.id_kendaraan}>
                  <TableCell className="font-medium">{k.plat_nomor}</TableCell>
                  <TableCell>{k.jenis_kendaraan}</TableCell>
                  <TableCell>{k.warna}</TableCell>
                  <TableCell>{k.pemilik}</TableCell>
                  <TableCell>{k.user?.nama_lengkap || '-'}</TableCell>
                  <TableCell>{formatDateTime(k.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(k)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(k.id_kendaraan)}>
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingKendaraan ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Plat Nomor"
                value={formData.plat_nomor}
                onChange={(e) => setFormData({ ...formData, plat_nomor: e.target.value.toUpperCase() })}
                required
              />
              <Select
                label="Jenis Kendaraan"
                value={formData.jenis_kendaraan}
                onChange={(e) => setFormData({ ...formData, jenis_kendaraan: e.target.value })}
                options={[
                  { value: 'MOTOR', label: 'Motor' },
                  { value: 'MOBIL', label: 'Mobil' },
                  { value: 'LAINNYA', label: 'Lainnya' },
                ]}
                required
              />
              <Input
                label="Warna"
                value={formData.warna}
                onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                required
              />
              <Input
                label="Pemilik"
                value={formData.pemilik}
                onChange={(e) => setFormData({ ...formData, pemilik: e.target.value })}
                required
              />
              <Select
                label="User"
                value={formData.id_user}
                onChange={(e) => setFormData({ ...formData, id_user: e.target.value })}
                options={[
                  { value: '', label: 'Pilih User...' },
                  ...users.map((user) => ({
                    value: user.id_user.toString(),
                    label: `${user.nama_lengkap} (${user.username})`,
                  })),
                ]}
                required
              />
              <div className="flex space-x-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingKendaraan ? 'Update' : 'Tambah'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
