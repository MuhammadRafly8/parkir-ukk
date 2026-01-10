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

interface User {
  id_user: number
  nama_lengkap: string
  username: string
  role: string
  status_aktif: boolean
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    password: '',
    role: 'PETUGAS',
    status_aktif: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const url = editingUser ? `/api/users/${editingUser.id_user}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'
      const body = editingUser && !formData.password
        ? { ...formData, password: undefined }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(editingUser ? 'User berhasil diupdate' : 'User berhasil dibuat')
        setShowModal(false)
        resetForm()
        fetchUsers()
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccess('User berhasil dihapus')
        fetchUsers()
      } else {
        const data = await res.json()
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      nama_lengkap: user.nama_lengkap,
      username: user.username,
      password: '',
      role: user.role,
      status_aktif: user.status_aktif,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      nama_lengkap: '',
      username: '',
      password: '',
      role: 'PETUGAS',
      status_aktif: true,
    })
    setEditingUser(null)
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
          <h1 className="text-3xl font-bold text-gray-900">Kelola User</h1>
          <p className="text-gray-600 mt-2">Manajemen pengguna sistem</p>
        </div>
        <Button onClick={openModal}>Tambah User</Button>
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
                <TableHeaderCell>Nama Lengkap</TableHeaderCell>
                <TableHeaderCell>Username</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Tanggal Dibuat</TableHeaderCell>
                <TableHeaderCell>Aksi</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id_user}>
                  <TableCell>{user.nama_lengkap}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status_aktif
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status_aktif ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDateTime(user.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(user.id_user)}>
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
              {editingUser ? 'Edit User' : 'Tambah User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nama Lengkap"
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                required
              />
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                label={editingUser ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
              <Select
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'PETUGAS', label: 'Petugas' },
                  { value: 'OWNER', label: 'Owner' },
                ]}
                required
              />
              <Select
                label="Status Aktif"
                value={formData.status_aktif ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, status_aktif: e.target.value === 'true' })}
                options={[
                  { value: 'true', label: 'Aktif' },
                  { value: 'false', label: 'Tidak Aktif' },
                ]}
                required
              />
              <div className="flex space-x-4">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingUser ? 'Update' : 'Tambah'}
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
