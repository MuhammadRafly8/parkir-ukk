'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/app/components/ui/Button'
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 backdrop-blur-xl border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola User</h1>
            <p className="text-slate-400 mt-2">Manajemen pengguna sistem</p>
          </div>
          <Button onClick={openModal} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0">Tambah User</Button>
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
              <TableHeaderCell className="text-slate-300 font-semibold pl-4 sm:pl-6">Nama Lengkap</TableHeaderCell>
              <TableHeaderCell className="text-slate-300 font-semibold hidden sm:table-cell">Username</TableHeaderCell>
              <TableHeaderCell className="text-slate-300 font-semibold hidden md:table-cell">Role</TableHeaderCell>
              <TableHeaderCell className="text-slate-300 font-semibold hidden lg:table-cell">Status</TableHeaderCell>
              <TableHeaderCell className="text-slate-300 font-semibold hidden xl:table-cell">Tanggal Dibuat</TableHeaderCell>
              <TableHeaderCell className="text-slate-300 font-semibold pr-2 sm:pr-6">Aksi</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id_user} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                <TableCell className="text-slate-100 pl-4 sm:pl-6">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="font-semibold truncate">{user.nama_lengkap}</span>
                    <div className="sm:hidden space-y-1">
                      <div className="text-xs text-slate-400 font-mono truncate">{user.username}</div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium w-fit ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : user.role === 'PETUGAS'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-400 font-mono text-sm hidden sm:table-cell">{user.username}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : user.role === 'PETUGAS'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status_aktif
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {user.status_aktif ? '• Aktif' : '• Tidak Aktif'}
                  </span>
                </TableCell>
                <TableCell className="text-slate-400 text-sm hidden xl:table-cell">{formatDateTime(user.created_at)}</TableCell>
                <TableCell className="pr-2 sm:pr-6">
                  <div className="flex flex-col sm:flex-row gap-1 justify-end">
                    <Button size="sm" className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-colors text-xs sm:text-sm whitespace-nowrap" onClick={() => handleEdit(user)}>
                      Edit
                    </Button>
                    <Button size="sm" className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 transition-colors text-xs sm:text-sm whitespace-nowrap" onClick={() => handleDelete(user.id_user)}>
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
          <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700/50 shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl"></div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingUser ? 'Edit User' : 'Tambah User'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">{editingUser ? 'Password (kosongkan jika tidak diubah)' : 'Password'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required={!editingUser}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="PETUGAS">Petugas</option>
                    <option value="OWNER">Owner</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Status Aktif</label>
                  <select
                    value={formData.status_aktif ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, status_aktif: e.target.value === 'true' })}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-2 rounded-lg transition-all">
                    {editingUser ? 'Update' : 'Tambah'}
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
