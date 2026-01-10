'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { DocumentChartBarIcon } from '@heroicons/react/24/outline'

export default function ManajemenDashboard() {
  const [stats, setStats] = useState({
    totalToday: 0,
    pendapatanToday: 0,
    activeTransaksi: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)
      const tomorrow = new Date(todayDate)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [todayRes, activeRes] = await Promise.all([
        fetch(`/api/transaksi?start_date=${todayDate.toISOString()}&end_date=${tomorrow.toISOString()}&status=KELUAR`),
        fetch('/api/transaksi/active'),
      ])

      const todayData = await todayRes.json()
      const active = await activeRes.json()

      const pendapatan = Array.isArray(todayData) ? todayData.reduce((sum: number, t: any) => {
        return sum + (t.biaya_total ? Number(t.biaya_total) : 0)
      }, 0) : 0

      setStats({
        totalToday: Array.isArray(todayData) ? todayData.length : 0,
        pendapatanToday: pendapatan,
        activeTransaksi: Array.isArray(active) ? active.length : 0,
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Manajemen</h1>
        <p className="text-gray-600 mt-2">Overview dan laporan parkir</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalToday}</div>
            <p className="text-sm text-gray-600 mt-2">Transaksi selesai hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendapatan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(stats.pendapatanToday)}
            </div>
            <p className="text-sm text-gray-600 mt-2">Total pendapatan hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parkir Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.activeTransaksi}</div>
            <p className="text-sm text-gray-600 mt-2">Kendaraan sedang parkir</p>
          </CardContent>
        </Card>
      </div>

      <Link href="/manajemen/laporan">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-8">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <DocumentChartBarIcon className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Laporan Transaksi</h3>
                <p className="text-gray-600">Lihat dan generate laporan transaksi parkir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
