'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAreas: 0,
    totalKendaraan: 0,
    activeTransaksi: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersRes, areasRes, kendaraanRes, transaksiRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/areas'),
        fetch('/api/kendaraan'),
        fetch('/api/transaksi/active'),
      ])

      const users = await usersRes.json()
      const areas = await areasRes.json()
      const kendaraan = await kendaraanRes.json()
      const transaksi = await transaksiRes.json()

      setStats({
        totalUsers: users.length || 0,
        totalAreas: areas.length || 0,
        totalKendaraan: kendaraan.length || 0,
        activeTransaksi: Array.isArray(transaksi) ? transaksi.length : 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Overview sistem parkir</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            <p className="text-sm text-gray-600 mt-2">Pengguna terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Area Parkir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalAreas}</div>
            <p className="text-sm text-gray-600 mt-2">Area tersedia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kendaraan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalKendaraan}</div>
            <p className="text-sm text-gray-600 mt-2">Kendaraan terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parkir Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.activeTransaksi}</div>
            <p className="text-sm text-gray-600 mt-2">Transaksi aktif</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
