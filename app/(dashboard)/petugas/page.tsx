'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline'

export default function PetugasDashboard() {
  const [stats, setStats] = useState({
    activeTransaksi: 0,
    totalToday: 0,
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

      const [activeRes, todayRes] = await Promise.all([
        fetch('/api/transaksi/active'),
        fetch(`/api/transaksi?start_date=${todayDate.toISOString()}&end_date=${tomorrow.toISOString()}`),
      ])

      const active = await activeRes.json()
      const todayData = await todayRes.json()

      setStats({
        activeTransaksi: Array.isArray(active) ? active.length : 0,
        totalToday: Array.isArray(todayData) ? todayData.length : 0,
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Petugas</h1>
        <p className="text-gray-600 mt-2">Sistem transaksi parkir</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Parkir Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.activeTransaksi}</div>
            <p className="text-sm text-gray-600 mt-2">Kendaraan yang sedang parkir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaksi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalToday}</div>
            <p className="text-sm text-gray-600 mt-2">Total transaksi hari ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/petugas/masuk">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <ArrowDownCircleIcon className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Kendaraan Masuk</h3>
                  <p className="text-gray-600">Catat kendaraan masuk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/petugas/keluar">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 p-4 rounded-full">
                  <ArrowUpCircleIcon className="w-12 h-12 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Kendaraan Keluar</h3>
                  <p className="text-gray-600">Proses kendaraan keluar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
