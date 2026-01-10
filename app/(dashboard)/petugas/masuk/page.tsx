'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { VehicleForm } from '@/app/components/parkir/VehicleForm'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { SuccessAlert } from '@/app/components/shared/SuccessAlert'
import { QRCodeSVG } from 'qrcode.react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface Area {
  id_area: number
  nama_area: string
  kapasitas: number
  terisi: number
}

export default function MasukPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tiketData, setTiketData] = useState<any>(null)
  const [formData, setFormData] = useState({
    plat_nomor: '',
    jenis_kendaraan: 'MOTOR',
    warna: '',
    pemilik: '',
    id_area: '',
  })

  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    try {
      const res = await fetch('/api/areas')
      if (res.ok) {
        const data = await res.json()
        setAreas(data)
      }
    } catch (error) {
      console.error('Error fetching areas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/transaksi/masuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Kendaraan berhasil dicatat masuk')
        setTiketData(data)
        setFormData({
          plat_nomor: '',
          jenis_kendaraan: 'MOTOR',
          warna: '',
          pemilik: '',
          id_area: '',
        })
        fetchAreas() // Refresh areas untuk update terisi
        // Auto generate dan download PDF tiket
        generateTiketPDF(data)
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const generateTiketPDF = async (tiket: any) => {
    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([400, 600])
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      let y = 550

      page.drawText('TIKET PARKIR', {
        x: 120,
        y,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      y -= 40

      page.drawText('================================', {
        x: 50,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      })

      y -= 30

      const items = [
        ['ID Parkir', tiket.id_parkir.toString()],
        ['Plat Nomor', tiket.kendaraan.plat_nomor],
        ['Jenis', tiket.kendaraan.jenis_kendaraan],
        ['Warna', tiket.kendaraan.warna],
        ['Pemilik', tiket.kendaraan.pemilik],
        ['Waktu Masuk', new Date(tiket.waktu_masuk).toLocaleString('id-ID')],
        ['Area', tiket.areaParkir.nama_area],
      ]

      items.forEach(([label, value]) => {
        page.drawText(label + ':', {
          x: 50,
          y,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        })
        page.drawText(value, {
          x: 200,
          y,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        })
        y -= 25
      })

      y -= 20

      page.drawText('================================', {
        x: 50,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      })

      y -= 30

      page.drawText('Simpan tiket ini untuk keluar parkir', {
        x: 80,
        y,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      })

      y -= 20

      page.drawText('ID: ' + tiket.id_parkir.toString(), {
        x: 150,
        y,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      const pdfBytes = await pdfDoc.save()
      const uint8Array = new Uint8Array(pdfBytes)
      const blob = new Blob([uint8Array], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tiket-parkir-${tiket.id_parkir}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Don't show error to user, just log it
    }
  }

  const printTiket = () => {
    window.print()
  }

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kendaraan Masuk</h1>
        <p className="text-gray-600 mt-2">Catat kendaraan yang masuk ke area parkir</p>
      </div>

      {error && (
        <ErrorAlert message={error} onClose={() => setError('')} />
      )}

      {success && !tiketData && (
        <SuccessAlert message={success} onClose={() => setSuccess('')} />
      )}

      {tiketData && (
        <Card className="print:shadow-none">
          <CardHeader>
            <CardTitle>Tiket Parkir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p><strong>ID Parkir:</strong> {tiketData.id_parkir}</p>
                <p><strong>Plat Nomor:</strong> {tiketData.kendaraan.plat_nomor}</p>
                <p><strong>Jenis:</strong> {tiketData.kendaraan.jenis_kendaraan}</p>
                <p><strong>Waktu Masuk:</strong> {new Date(tiketData.waktu_masuk).toLocaleString('id-ID')}</p>
                <p><strong>Area:</strong> {tiketData.areaParkir.nama_area}</p>
              </div>
              <div className="text-center">
                <QRCodeSVG value={tiketData.id_parkir.toString()} size={150} />
                <p className="text-xs text-gray-600 mt-2">ID: {tiketData.id_parkir}</p>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button onClick={printTiket} variant="primary">Cetak Tiket</Button>
              <Button onClick={() => setTiketData(null)} variant="outline">Tutup</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Form Kendaraan Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <VehicleForm
              formData={formData}
              onChange={setFormData}
              areas={areas}
            />
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={submitting}
              >
                Catat Masuk
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
