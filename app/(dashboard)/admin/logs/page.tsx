'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Log Aktifitas</h1>
        <p className="text-gray-600 mt-2">Riwayat aktivitas sistem</p>
      </div>

      <Card>
        <CardHeader>
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
              <Button onClick={handleFilter}>Filter</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Waktu</TableHeaderCell>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Aktivitas</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id_log}>
                  <TableCell>{formatDateTime(log.waktu_aktivitas)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.user?.nama_lengkap || '-'}</div>
                      <div className="text-xs text-gray-500">{log.user?.username || '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{log.aktivitas}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
