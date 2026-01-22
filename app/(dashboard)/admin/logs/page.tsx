'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/app/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '@/app/components/ui/Table'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { formatDateTime } from '@/app/lib/utils'

interface Log {
  id_log: number
  id_user: number
  aktivitas: string
  waktu_aktivitas: string
  user: {
    id_user: number
    nama_lengkap: string
    username: string
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      let url = '/api/logs?'
      if (startDate) url += `start_date=${startDate}&`
      if (endDate) url += `end_date=${endDate}&`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    setLoading(true)
    fetchLogs()
  }

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 backdrop-blur-xl border border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white">Log Aktifitas</h1>
          <p className="text-slate-400 mt-2">Riwayat aktivitas sistem</p>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400 mb-2 block">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-400 mb-2 block">Tanggal Akhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleFilter} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0">Filter</Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-800/50 border-b border-slate-700/50">
                <TableHeaderCell className="text-slate-300 font-semibold">Waktu</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">User</TableHeaderCell>
                <TableHeaderCell className="text-slate-300 font-semibold">Aktivitas</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id_log} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                  <TableCell className="text-slate-400 text-sm">{formatDateTime(log.waktu_aktivitas)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-slate-100">{log.user?.nama_lengkap || '-'}</div>
                      <div className="text-xs text-slate-500">{log.user?.username || '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {log.aktivitas}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
