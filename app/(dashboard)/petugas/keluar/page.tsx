'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { QRScanner } from '@/app/components/parkir/QRScanner'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { SuccessAlert } from '@/app/components/shared/SuccessAlert'
import { formatCurrency, formatDateTime } from '@/app/lib/utils'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface Transaksi {
  id_parkir: number
  waktu_masuk: string
  kendaraan: {
    plat_nomor: string
    jenis_kendaraan: string
    warna: string
    pemilik: string
  }
  tarif: {
    tarif_per_jam: number
  }
  areaParkir: {
    nama_area: string
  }
}

export default function KeluarPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null)
  const [keluarData, setKeluarData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH')
  const [cashPaid, setCashPaid] = useState<string>('')

  const handleScan = async (id: string) => {
    setLoading(true)
    setError('')
    setTransaksi(null)

    try {
      const res = await fetch(`/api/transaksi/active?qr=${id}`)
      const data = await res.json()

      if (res.ok && data) {
        setTransaksi(data)
      } else {
        setError(data.error || 'Data tidak ditemukan')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleManualInput = async (platNomor: string) => {
    setLoading(true)
    setError('')
    setTransaksi(null)

    try {
      const res = await fetch(`/api/transaksi/active?plat_nomor=${platNomor}`)
      const data = await res.json()

      if (res.ok && data) {
        setTransaksi(data)
      } else {
        setError(data.error || 'Data tidak ditemukan')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleBayar = async () => {
    if (!transaksi) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload: any = { id_parkir: transaksi.id_parkir, paymentMethod }
      if (paymentMethod === 'CASH') {
        payload.cashAmount = Number(cashPaid || 0)
      }

      const res = await fetch('/api/transaksi/keluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Pembayaran berhasil')
        // attach payment info from response if available
        setKeluarData({ ...data, pembayaran: data.pembayaran || { paymentMethod, cashAmount: paymentMethod === 'CASH' ? Number(cashPaid) : null, kembalian: data.pembayaran?.kembalian ?? 0 } })
        setTransaksi(null)
        setCashPaid('')
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    if (!keluarData) return

    try {
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([400, 600])
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      let y = 550

      // Template selection from localStorage
      const tpl = (typeof window !== 'undefined' ? localStorage.getItem('printTemplate') : null) || 'default'
      const titleX = tpl === 'compact' ? 120 : tpl === 'wide' ? 90 : 150
      const pageWidth = tpl === 'wide' ? 500 : 400
      page.setSize(pageWidth, 600)

      page.drawText('STRUK PARKIR', {
        x: titleX,
        y,
        size: tpl === 'compact' ? 16 : 20,
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
        ['ID Parkir', keluarData.id_parkir.toString()],
        ['Plat Nomor', keluarData.kendaraan.plat_nomor],
        ['Jenis', keluarData.kendaraan.jenis_kendaraan],
        ['Waktu Masuk', formatDateTime(keluarData.waktu_masuk)],
        ['Waktu Keluar', formatDateTime(keluarData.waktu_keluar)],
        ['Durasi', `${keluarData.durasi_jam} jam`],
        ['Tarif/jam', formatCurrency(keluarData.tarif.tarif_per_jam)],
        ['Total Biaya', formatCurrency(keluarData.biaya_total)],
        ['Metode Pembayaran', keluarData.pembayaran?.paymentMethod || 'QRIS'],
        ['Dibayar', keluarData.pembayaran?.cashAmount ? formatCurrency(keluarData.pembayaran.cashAmount) : '-'],
        ['Kembalian', keluarData.pembayaran?.kembalian ? formatCurrency(keluarData.pembayaran.kembalian) : '-'],
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

      page.drawText('Terima Kasih', {
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
      link.download = `struk-${keluarData.id_parkir}.pdf`
      link.click()
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError('Gagal generate PDF')
    }
  }

  const calculateBiaya = () => {
    if (!transaksi) return 0

    const waktuMasuk = new Date(transaksi.waktu_masuk)
    const waktuKeluar = new Date()
    const durasiMs = waktuKeluar.getTime() - waktuMasuk.getTime()
    const durasiJam = Math.ceil(durasiMs / (1000 * 60 * 60))
    return durasiJam * transaksi.tarif.tarif_per_jam
  }

  const biayaSekarang = calculateBiaya()
  const cashPaidNumber = Number(cashPaid || 0)
  const kembalian = paymentMethod === 'CASH' ? Math.max(0, cashPaidNumber - biayaSekarang) : 0

  const calculateDurasi = () => {
    if (!transaksi) return 0
    const waktuMasuk = new Date(transaksi.waktu_masuk)
    const waktuKeluar = new Date()
    const durasiMs = waktuKeluar.getTime() - waktuMasuk.getTime()
    return Math.ceil(durasiMs / (1000 * 60 * 60))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kendaraan Keluar</h1>
        <p className="text-gray-600 mt-2">Proses pembayaran dan kendaraan keluar</p>
      </div>

      {error && (
        <ErrorAlert message={error} onClose={() => setError('')} />
      )}

      {success && (
        <SuccessAlert message={success} onClose={() => setSuccess('')} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code / Input ID</CardTitle>
        </CardHeader>
        <CardContent>
          <QRScanner
            onScan={handleScan}
            onManualInput={handleManualInput}
            placeholder="Scan QR Code atau masukkan plat nomor"
          />
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {transaksi && (
        <Card>
          <CardHeader>
            <CardTitle>Detail Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID Parkir</p>
                  <p className="text-lg font-semibold">{transaksi.id_parkir}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plat Nomor</p>
                  <p className="text-lg font-semibold">{transaksi.kendaraan.plat_nomor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jenis Kendaraan</p>
                  <p className="text-lg font-semibold">{transaksi.kendaraan.jenis_kendaraan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Area Parkir</p>
                  <p className="text-lg font-semibold">{transaksi.areaParkir.nama_area}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Waktu Masuk</p>
                  <p className="text-lg font-semibold">{formatDateTime(transaksi.waktu_masuk)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durasi</p>
                  <p className="text-lg font-semibold">{calculateDurasi()} jam</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tarif per Jam</p>
                  <p className="text-lg font-semibold">{formatCurrency(transaksi.tarif.tarif_per_jam)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Biaya</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculateBiaya())}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Metode Pembayaran</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="payment" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} />
                      <span>Cash</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="payment" checked={paymentMethod === 'QRIS'} onChange={() => setPaymentMethod('QRIS')} />
                      <span>QRIS</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'CASH' && (
                  <div>
                    <p className="text-sm text-gray-600">Masukkan jumlah uang (Cash)</p>
                    <input
                      type="number"
                      value={cashPaid}
                      onChange={(e) => setCashPaid(e.target.value)}
                      className="mt-2 w-full border rounded px-3 py-2"
                      placeholder="0"
                      min={0}
                    />
                    <p className="mt-2 text-sm">Kembalian: <span className="font-semibold">{formatCurrency(kembalian)}</span></p>
                  </div>
                )}

                <Button
                  onClick={handleBayar}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                  disabled={paymentMethod === 'CASH' && cashPaidNumber < biayaSekarang}
                >
                  Bayar & Keluar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {keluarData && (
        <Card>
          <CardHeader>
            <CardTitle>Struk Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 print:block hidden-print">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID Parkir</p>
                  <p className="text-lg font-semibold">{keluarData.id_parkir}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plat Nomor</p>
                  <p className="text-lg font-semibold">{keluarData.kendaraan.plat_nomor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Waktu Masuk</p>
                  <p className="text-lg font-semibold">{formatDateTime(keluarData.waktu_masuk)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Waktu Keluar</p>
                  <p className="text-lg font-semibold">{formatDateTime(keluarData.waktu_keluar)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durasi</p>
                  <p className="text-lg font-semibold">{keluarData.durasi_jam} jam</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Biaya</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(keluarData.biaya_total)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Metode Pembayaran</p>
                  <p className="text-lg font-semibold">{keluarData.pembayaran?.paymentMethod || 'QRIS'}</p>
                </div>
                {keluarData.pembayaran?.paymentMethod === 'CASH' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Dibayar</p>
                      <p className="text-lg font-semibold">{formatCurrency(keluarData.pembayaran.cashAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Kembalian</p>
                      <p className="text-lg font-semibold">{formatCurrency(keluarData.pembayaran.kembalian)}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex space-x-2">
                <Button onClick={generatePDF} variant="primary">
                  Download PDF
                </Button>
                <Button onClick={() => setKeluarData(null)} variant="outline">
                  Tutup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
