'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Area Parkir</h1>
          <p className="text-gray-600 mt-2">Manajemen area dan slot parkir</p>
        </div>
        <Button onClick={openModal}>Tambah Area</Button>
      </div>

      {error && (
        <ErrorAlert message={error} onClose={() => setError('')} />
      )}

      {success && (
        <SuccessAlert message={success} onClose={() => setSuccess('')} />
      )}

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Nama Area</TableHeaderCell>
                <TableHeaderCell>Kapasitas</TableHeaderCell>
                <TableHeaderCell>Terisi</TableHeaderCell>
                <TableHeaderCell>Tersedia</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Tanggal Dibuat</TableHeaderCell>
                <TableHeaderCell>Aksi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => {
                const tersedia = area.kapasitas - area.terisi
                const persentase = area.kapasitas > 0 ? (area.terisi / area.kapasitas) * 100 : 0
                return (
                  <TableRow key={area.id_area}>
                    <TableCell className="font-medium">{area.nama_area}</TableCell>
                    <TableCell>{area.kapasitas}</TableCell>
                    <TableCell>{area.terisi}</TableCell>
                    <TableCell>
                      <span className={tersedia === 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {tersedia}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${persentase >= 100 ? 'bg-red-600' : persentase >= 80 ? 'bg-yellow-600' : 'bg-green-600'}`}
                            style={{ width: `${Math.min(persentase, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{persentase.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(area.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(area)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(area.id_area)}>
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingArea ? 'Edit Area Parkir' : 'Tambah Area Parkir'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nama Area"
                value={formData.nama_area}
                onChange={(e) => setFormData({ ...formData, nama_area: e.target.value })}
                required
              />
              <Input
                label="Kapasitas"
                type="number"
                value={formData.kapasitas}
                onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })}
                required
                min="1"
              />
              <div className="flex space-x-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingArea ? 'Update' : 'Tambah'}
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
