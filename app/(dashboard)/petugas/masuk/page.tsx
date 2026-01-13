'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
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
  const [selectedArea, setSelectedArea] = useState('')
  const [foundKendaraan, setFoundKendaraan] = useState<any>(null)

  // New refs & states for QR conversion and scanning
  const qrSvgRef = useRef<SVGSVGElement | null>(null)
  const [searchInput, setSearchInput] = useState('')

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

  // Handle pencarian kendaraan (dipakai oleh QRScanner)
  const handleSearch = async (platNomor: string) => {
    setLoading(true)
    setError('')
    setFoundKendaraan(null)
    setTiketData(null)

    try {
      const res = await fetch(`/api/kendaraan?plat_nomor=${encodeURIComponent(platNomor)}`)
      const data = await res.json()

      if (res.ok && Array.isArray(data) && data.length > 0) {
        setFoundKendaraan(data[0])
      } else {
        setError(data.error || 'Kendaraan tidak ditemukan')
      }
    } catch (err) {
      console.error('Error searching kendaraan:', err)
      setError('Terjadi kesalahan saat mencari kendaraan')
    } finally {
      setLoading(false)
    }
  }

  const handleCetakTiket = async () => {
    if (!foundKendaraan) {
      setError('Cari kendaraan terlebih dahulu')
      return
    }
    if (!selectedArea) {
      setError('Pilih area parkir terlebih dahulu')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        plat_nomor: foundKendaraan.plat_nomor,
        jenis_kendaraan: foundKendaraan.jenis_kendaraan,
        warna: foundKendaraan.warna,
        pemilik: foundKendaraan.pemilik,
        id_area: selectedArea,
      }

      const res = await fetch('/api/transaksi/masuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Kendaraan berhasil dicatat masuk')
        setTiketData(data)
        setFoundKendaraan(null)
        setSelectedArea('')
        fetchAreas()
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (err) {
      console.error('Error creating transaksi masuk:', err)
      setError('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  // Helpers to convert SVG to PNG data URL
  const svgElementToPngDataUrl = (svgEl: SVGSVGElement, size = 500): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const serializer = new XMLSerializer()
        let svgString = serializer.serializeToString(svgEl)
        // add xmlns if missing
        if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
          svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
        }
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Canvas not supported')
            // white background for better scanning/printing contrast
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            const dataUrl = canvas.toDataURL('image/png')
            URL.revokeObjectURL(url)
            resolve(dataUrl)
          } catch (e) {
            URL.revokeObjectURL(url)
            reject(e)
          }
        }
        img.onerror = (err) => {
          URL.revokeObjectURL(url)
          reject(err)
        }
        img.src = url
      } catch (err) {
        reject(err)
      }
    })
  }

  const dataUrlToUint8Array = (dataUrl: string) => {
    const base64 = dataUrl.split(',')[1]
    const binary = atob(base64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  // Generate PDF with embedded QR (from rendered SVG) and trigger download
  const downloadTiketPDF = async (tiket: any) => {
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

      // Embed QR: convert SVG to PNG and embed
      try {
        const svgEl = document.getElementById('ticket-qr') as SVGSVGElement | null
        if (svgEl) {
          // create a PNG at higher resolution then draw it centered with modest size
          const pngDataUrl = await svgElementToPngDataUrl(svgEl, 300)
          const pngBytes = dataUrlToUint8Array(pngDataUrl)
          const pngImage = await pdfDoc.embedPng(pngBytes)
          const imgWidth = 110
          const imgHeight = 110
          const pageWidth = page.getWidth()
          const centeredX = (pageWidth - imgWidth) / 2
          page.drawImage(pngImage, {
            x: centeredX,
            y: y - imgHeight - 10,
            width: imgWidth,
            height: imgHeight,
          })
        } else {
          // If SVG not found, still proceed without QR
          console.warn('QR SVG not found; PDF will be generated without QR image.')
        }
      } catch (err) {
        console.error('Error embedding QR into PDF:', err)
      }

      y -= 150

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
      setError('Gagal membuat PDF tiket')
    }
  }

  // scanning removed: UI now uses only manual plat nomor input

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
                <p><strong>Warna:</strong> {tiketData.kendaraan.warna}</p>
                <p><strong>Pemilik:</strong> {tiketData.kendaraan.pemilik}</p>
                <p><strong>Waktu Masuk:</strong> {new Date(tiketData.waktu_masuk).toLocaleString('id-ID')}</p>
                <p><strong>Area:</strong> {tiketData.areaParkir.nama_area}</p>
              </div>
              <div className="text-center">
                {/* assign id so we can convert the rendered SVG to PNG for embedding in PDF */}
                <QRCodeSVG id="ticket-qr" value={tiketData.id_parkir.toString()} size={96} ref={qrSvgRef as any} />
                <p className="text-xs text-gray-600 mt-2">ID: {tiketData.id_parkir}</p>
              </div>
            </div>``
            <p className="text-xs text-gray-600 mt-2">Simpan tiket ini untuk keluar parkir</p>
              <div className="mt-4 flex space-x-2">
              {/* Cetak akan mengunduh PDF yang berisi QR */}
              <Button onClick={() => downloadTiketPDF(tiketData)} variant="primary">Cetak Tiket</Button>
              <Button onClick={() => setTiketData(null)} variant="outline">Tutup</Button>
            </div>
          </CardContent>
        </Card>
      )}
        <Card>
          <CardHeader>
            <CardTitle>Cari Kendaraan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput((e.target as HTMLInputElement).value)}
                placeholder="Masukkan plat nomor"
                className="flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(searchInput) }}
                autoFocus
              />
              <Button onClick={() => handleSearch(searchInput)} variant="outline">Cari</Button>
            </div>

            {loading && (
              <div className="flex justify-center mt-4">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {foundKendaraan && (
              <div className="mt-4 space-y-2">
                <p><strong>Plat Nomor:</strong> {foundKendaraan.plat_nomor}</p>
                <p><strong>Jenis:</strong> {foundKendaraan.jenis_kendaraan}</p>
                <p><strong>Warna:</strong> {foundKendaraan.warna}</p>
                <p><strong>Pemilik:</strong> {foundKendaraan.pemilik}</p>

                <div className="mt-2">
                  <label className="block text-sm text-gray-600">Pilih Area</label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="mt-1 block w-full border rounded px-2 py-2"
                  >
                    <option value="">-- Pilih Area --</option>
                    {areas.map((a) => (
                      <option key={a.id_area} value={a.id_area}>{a.nama_area} (terisi: {a.terisi}/{a.kapasitas})</option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button onClick={handleCetakTiket} variant="primary" isLoading={submitting}>Cetak Tiket</Button>
                  <Button onClick={() => setFoundKendaraan(null)} variant="outline">Batal</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
