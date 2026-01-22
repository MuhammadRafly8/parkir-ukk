'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/app/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/app/components/ui/Table'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { formatCurrency, formatDateTime } from '@/app/lib/utils'
import * as XLSX from 'xlsx'
import { DocumentArrowDownIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline'

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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
        setCurrentPage(1)
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-8 backdrop-blur-xl border border-slate-700/50">
        <div className="absolute inset-0 bg-linear-to-br from-slate-800/50 to-slate-900/50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-bl from-blue-500/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Laporan Transaksi</h1>
          <p className="text-slate-300 text-lg">Generate dan analisis laporan transaksi sesuai periode</p>
        </div>
      </div>

      {error && (
        <ErrorAlert message={error} onClose={() => setError('')} />
      )}

      {/* Filter Section */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
        <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-blue-500/5"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-bl from-cyan-500/20 rounded-full -mr-20 -mt-20"></div>
        
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-white mb-6">Filter Periode Laporan</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-300 mb-2 block">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-300 mb-2 block">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <Button 
                onClick={handleGenerate} 
                className="bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 w-full sm:w-auto"
              >
                {loading ? 'Memproses...' : 'Generate Laporan'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {laporan && (
        <>
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Transaksi */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-blue-500 to-cyan-500 rounded-full -mr-16 -mt-16 opacity-10"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <DocumentChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Transaksi</p>
                  <div className="text-3xl font-bold text-white">{laporan.summary.totalTransaksi}</div>
                  <p className="text-sm text-slate-400 mt-2">
                    {new Date(laporan.periode.start).toLocaleDateString('id-ID')} - {new Date(laporan.periode.end).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Pendapatan */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-emerald-500 to-teal-500 rounded-full -mr-16 -mt-16 opacity-10"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-linear-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.16 2.75a.75.75 0 00-1.32 0l-.478 1.435a.75.75 0 01-.564.564l-1.435.478a.75.75 0 000 1.32l1.435.478c.247.082.45.285.564.564l.478 1.435a.75.75 0 001.32 0l.478-1.435c.082-.247.285-.45.564-.564l1.435-.478a.75.75 0 000-1.32l-1.435-.478a.75.75 0 01-.564-.564l-.478-1.435zM12.84 9.75a.75.75 0 00-1.32 0l-.478 1.435a.75.75 0 01-.564.564l-1.435.478a.75.75 0 000 1.32l1.435.478c.247.082.45.285.564.564l.478 1.435a.75.75 0 001.32 0l.478-1.435c.082-.247.285-.45.564-.564l1.435-.478a.75.75 0 000-1.32l-1.435-.478a.75.75 0 01-.564-.564l-.478-1.435z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Pendapatan</p>
                  <div className="text-2xl font-bold text-emerald-400">{formatCurrency(laporan.summary.totalPendapatan)}</div>
                  <p className="text-sm text-slate-400 mt-2">Rata-rata: {formatCurrency(laporan.summary.totalPendapatan / laporan.summary.totalTransaksi)}</p>
                </div>
              </div>
            </div>

            {/* Average Duration */}
            <div className="group relative">
              <div className="absolute inset-0 bg-linear-to-br from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-amber-500 to-orange-500 rounded-full -mr-16 -mt-16 opacity-10"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-linear-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-.707.707a1 1 0 101.414 1.414L9 9.414V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Rata-rata Durasi</p>
                  <div className="text-2xl font-bold text-amber-400">
                    {laporan.summary.totalTransaksi > 0 
                      ? (laporan.transaksi.reduce((sum: number, t: any) => sum + (t.durasi_jam || 0), 0) / laporan.summary.totalTransaksi).toFixed(1)
                      : '0'} jam
                  </div>
                  <p className="text-sm text-slate-400 mt-2">Total {laporan.transaksi.reduce((sum: number, t: any) => sum + (t.durasi_jam || 0), 0)} jam</p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Vehicle Type */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-4">Ringkasan per Jenis Kendaraan</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-800/50 border-b border-slate-700/50">
                        <TableHeaderCell className="text-slate-300 font-semibold">Jenis</TableHeaderCell>
                        <TableHeaderCell className="text-slate-300 font-semibold">Jumlah</TableHeaderCell>
                        <TableHeaderCell className="text-slate-300 font-semibold">Total Biaya</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(laporan.summary.summaryByJenis).map(([jenis, data]) => (
                        <TableRow key={jenis} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                          <TableCell className="text-slate-100">{jenis}</TableCell>
                          <TableCell className="text-slate-100 font-semibold">{data.count}</TableCell>
                          <TableCell className="text-emerald-400 font-semibold">{formatCurrency(data.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* By Area */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
              <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-blue-500/5"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-4">Ringkasan per Area Parkir</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-800/50 border-b border-slate-700/50">
                        <TableHeaderCell className="text-slate-300 font-semibold">Area</TableHeaderCell>
                        <TableHeaderCell className="text-slate-300 font-semibold">Jumlah</TableHeaderCell>
                        <TableHeaderCell className="text-slate-300 font-semibold">Total Biaya</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(laporan.summary.summaryByArea).map(([area, data]) => (
                        <TableRow key={area} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                          <TableCell className="text-slate-100">{area}</TableCell>
                          <TableCell className="text-slate-100 font-semibold">{data.count}</TableCell>
                          <TableCell className="text-blue-400 font-semibold">{formatCurrency(data.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Transactions */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6 hover:border-slate-600/80 transition-all duration-300">
            <div className="absolute inset-0 bg-linear-to-br from-slate-800/50 to-slate-900/50"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-bl from-blue-500/20 rounded-full -mr-20 -mt-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Detail Transaksi</h3>
                <Button 
                  onClick={exportExcel}
                  className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export Excel
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-800/50 border-b border-slate-700/50">
                      <TableHeaderCell className="text-slate-300 font-semibold">ID</TableHeaderCell>
                      <TableHeaderCell className="text-slate-300 font-semibold">Plat Nomor</TableHeaderCell>
                      <TableHeaderCell className="text-slate-300 font-semibold">Jenis</TableHeaderCell>
                      <TableHeaderCell className="text-slate-300 font-semibold">Area</TableHeaderCell>
                      <TableHeaderCell className="text-slate-300 font-semibold">Masuk</TableHeaderCell>
                      <TableHeaderCell className="text-slate-300 font-semibold">Keluar</TableHeaderCell>
                      <TableHeaderCell className="text-slate-300 font-semibold">Durasi</TableHeaderCell>
                      <TableHeaderCell className="text-slate-300 font-semibold">Biaya</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {laporan.transaksi.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((t) => (
                      <TableRow key={t.id_parkir} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                        <TableCell className="text-slate-100 font-mono text-sm">{t.id_parkir}</TableCell>
                        <TableCell className="text-slate-100 font-mono font-semibold">{t.kendaraan.plat_nomor}</TableCell>
                        <TableCell className="text-slate-100">{t.kendaraan.jenis_kendaraan}</TableCell>
                        <TableCell className="text-slate-100">{t.areaParkir.nama_area}</TableCell>
                        <TableCell className="text-slate-400 text-sm">{formatDateTime(t.waktu_masuk)}</TableCell>
                        <TableCell className="text-slate-400 text-sm">{formatDateTime(t.waktu_keluar)}</TableCell>
                        <TableCell className="text-amber-400 font-semibold">{t.durasi_jam} jam</TableCell>
                        <TableCell className="text-emerald-400 font-semibold">{formatCurrency(t.biaya_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 mt-6 border-t border-slate-700/30 gap-4">
                <div className="text-sm text-slate-400">
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, laporan.transaksi.length)} dari {laporan.transaksi.length} transaksi
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 border border-slate-700/50 disabled:opacity-50"
                  >
                    ← Sebelumnya
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.ceil(laporan.transaksi.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white'
                            : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600/80'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(laporan.transaksi.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(laporan.transaksi.length / itemsPerPage)}
                    className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 border border-slate-700/50 disabled:opacity-50"
                  >
                    Selanjutnya →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
