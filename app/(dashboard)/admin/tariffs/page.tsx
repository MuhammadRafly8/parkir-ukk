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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Tarif Parkir</h1>
          <p className="text-gray-600 mt-2">Manajemen tarif parkir per jam</p>
        </div>
        <Button onClick={openModal}>Tambah Tarif</Button>
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
                <TableHeaderCell>Jenis Kendaraan</TableHeaderCell>
                <TableHeaderCell>Tarif per Jam</TableHeaderCell>
                <TableHeaderCell>Tanggal Dibuat</TableHeaderCell>
                <TableHeaderCell>Aksi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tarifs.map((tarif) => (
                <TableRow key={tarif.id_tarif}>
                  <TableCell>{tarif.jenis_kendaraan}</TableCell>
                  <TableCell>{formatCurrency(tarif.tarif_per_jam)}</TableCell>
                  <TableCell>{formatDateTime(tarif.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(tarif)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(tarif.id_tarif)}>
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingTarif ? 'Edit Tarif' : 'Tambah Tarif'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={!!editingTarif}
              />
              <Input
                label="Tarif per Jam"
                type="number"
                value={formData.tarif_per_jam}
                onChange={(e) => setFormData({ ...formData, tarif_per_jam: e.target.value })}
                required
                min="0"
                step="1000"
              />
              <div className="flex space-x-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingTarif ? 'Update' : 'Tambah'}
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
