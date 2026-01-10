'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/app/components/ui/Table'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { formatCurrency, formatDateTime } from '@/app/lib/utils'
import * as XLSX from 'xlsx'

interface LaporanData {
  periode: {
    start: string
    end: string
  }
  summary: {
    totalTransaksi: number
    totalPendapatan: number
    summaryByJenis: Record<string, { count: number; total: number }>
    summaryByArea: Record<string, { count: number; total: number }>
  }
  transaksi: any[]
}

export default function LaporanPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [laporan, setLaporan] = useState<LaporanData | null>(null)

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      setError('Tanggal mulai dan tanggal akhir harus diisi')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/laporan?start_date=${startDate}&end_date=${endDate}`)
      const data = await res.json()

      if (res.ok) {
        setLaporan(data)
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const exportExcel = () => {
    if (!laporan) return

    const wsData = [
      ['ID Parkir', 'Plat Nomor', 'Jenis', 'Area', 'Waktu Masuk', 'Waktu Keluar', 'Durasi (Jam)', 'Biaya Total'],
      ...laporan.transaksi.map((t) => [
        t.id_parkir,
        t.kendaraan.plat_nomor,
        t.kendaraan.jenis_kendaraan,
        t.areaParkir.nama_area,
        formatDateTime(t.waktu_masuk),
        formatDateTime(t.waktu_keluar),
        t.durasi_jam,
        t.biaya_total,
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan')

    const fileName = `laporan-${startDate}-${endDate}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  // Set default dates to current month
  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan Transaksi</h1>
        <p className="text-gray-600 mt-2">Generate laporan transaksi sesuai periode</p>
      </div>

      {error && (
        <ErrorAlert message={error} onClose={() => setError('')} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filter Periode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              label="Tanggal Mulai"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="max-w-xs"
            />
            <Input
              label="Tanggal Akhir"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex items-end">
              <Button onClick={handleGenerate} isLoading={loading}>
                Generate Laporan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {laporan && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Ringkasan</CardTitle>
                <Button onClick={exportExcel} variant="outline">
                  Export Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Periode</p>
                  <p className="text-lg font-semibold">
                    {new Date(laporan.periode.start).toLocaleDateString('id-ID')} - {new Date(laporan.periode.end).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Transaksi</p>
                  <p className="text-2xl font-bold text-gray-900">{laporan.summary.totalTransaksi}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pendapatan</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(laporan.summary.totalPendapatan)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Rekap per Jenis Kendaraan</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Jenis</TableHeaderCell>
                        <TableHeaderCell>Jumlah</TableHeaderCell>
                        <TableHeaderCell>Total</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(laporan.summary.summaryByJenis).map(([jenis, data]) => (
                        <TableRow key={jenis}>
                          <TableCell>{jenis}</TableCell>
                          <TableCell>{data.count}</TableCell>
                          <TableCell>{formatCurrency(data.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Rekap per Area</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Area</TableHeaderCell>
                        <TableHeaderCell>Jumlah</TableHeaderCell>
                        <TableHeaderCell>Total</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(laporan.summary.summaryByArea).map(([area, data]) => (
                        <TableRow key={area}>
                          <TableCell>{area}</TableCell>
                          <TableCell>{data.count}</TableCell>
                          <TableCell>{formatCurrency(data.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>ID</TableHeaderCell>
                      <TableHeaderCell>Plat Nomor</TableHeaderCell>
                      <TableHeaderCell>Jenis</TableHeaderCell>
                      <TableHeaderCell>Area</TableHeaderCell>
                      <TableHeaderCell>Masuk</TableHeaderCell>
                      <TableHeaderCell>Keluar</TableHeaderCell>
                      <TableHeaderCell>Durasi</TableHeaderCell>
                      <TableHeaderCell>Biaya</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laporan.transaksi.map((t) => (
                      <TableRow key={t.id_parkir}>
                        <TableCell>{t.id_parkir}</TableCell>
                        <TableCell>{t.kendaraan.plat_nomor}</TableCell>
                        <TableCell>{t.kendaraan.jenis_kendaraan}</TableCell>
                        <TableCell>{t.areaParkir.nama_area}</TableCell>
                        <TableCell>{formatDateTime(t.waktu_masuk)}</TableCell>
                        <TableCell>{formatDateTime(t.waktu_keluar)}</TableCell>
                        <TableCell>{t.durasi_jam} jam</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(t.biaya_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
