'use client'

import { useEffect, useState } from 'react'
import { QRScanner } from '@/app/components/parkir/QRScanner'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { SuccessAlert } from '@/app/components/shared/SuccessAlert'
import { formatCurrency, formatDateTime } from '@/app/lib/utils'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { ArrowUpCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

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
  const [cashPaid, setCashPaid] = useState('')

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

  const calculateDurasi = () => {
    if (!transaksi) return 0
    const masuk = new Date(transaksi.waktu_masuk).getTime()
    const keluar = new Date().getTime()
    const durationMs = keluar - masuk
    const hours = Math.ceil(durationMs / (1000 * 60 * 60))
    return Math.max(1, hours)
  }

  const calculateBiaya = () => {
    if (!transaksi) return 0
    const durasi = calculateDurasi()
    return durasi * transaksi.tarif.tarif_per_jam
  }

  const handleBayar = async () => {
    if (!transaksi) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/transaksi/keluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_parkir: transaksi.id_parkir,
          metode_pembayaran: paymentMethod,
          jumlah_bayar: paymentMethod === 'CASH' ? Number(cashPaid) : calculateBiaya(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Pembayaran berhasil')
        setKeluarData(data)
        setTransaksi(null)
        setCashPaid('')
      } else {
        setError(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error:', error)
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
      const { width, height } = page.getSize()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      page.drawText('STRUK PEMBAYARAN', {
        x: width / 2 - 60,
        y: height - 50,
        size: 18,
        font: boldFont,
      })

      const content = [
        `ID Parkir: ${keluarData.id_parkir}`,
        `Plat: ${keluarData.kendaraan.plat_nomor}`,
        `Jenis: ${keluarData.kendaraan.jenis_kendaraan}`,
        `Area: ${keluarData.areaParkir.nama_area}`,
        `Masuk: ${formatDateTime(keluarData.waktu_masuk)}`,
        `Keluar: ${formatDateTime(keluarData.waktu_keluar)}`,
        `Durasi: ${keluarData.durasi_jam} jam`,
        `Biaya: ${formatCurrency(keluarData.biaya_total)}`,
        `Metode: ${keluarData.metode_pembayaran}`,
      ]

      let yPosition = height - 120
      content.forEach((line) => {
        page.drawText(line, { x: 30, y: yPosition, size: 11, font })
        yPosition -= 25
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `struk_${keluarData.id_parkir}.pdf`
      link.click()
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError('Gagal generate PDF')
    }
  }

  const biayaSekarang = calculateBiaya()
  const cashPaidNumber = Number(cashPaid || 0)
  const kembalian = paymentMethod === 'CASH' ? Math.max(0, cashPaidNumber - biayaSekarang) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-2">
            <ArrowUpCircleIcon className="w-8 h-8 text-blue-400 shrink-0" />
            Kendaraan Keluar
          </h1>
          <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
          <p className="text-slate-300">Proses pembayaran dan kendaraan keluar</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
            <ErrorAlert message={error} onClose={() => setError('')} />
          </div>
        )}

        {success && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
            <SuccessAlert message={success} onClose={() => setSuccess('')} />
          </div>
        )}

        {/* Scanner Section */}
        <div className="mb-8 group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
          <div className="relative bg-slate-800/80 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-4">Scan QR / Input Plat Nomor</h3>
            <QRScanner
              onScan={handleScan}
              onManualInput={handleManualInput}
              placeholder="Scan atau masukkan plat nomor"
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Transaction Details */}
        {transaksi && (
          <div className="mb-8 group relative animate-in slide-in-from-bottom-4 duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative bg-slate-800/80 border border-l-4 border-l-purple-500 border-slate-700/50 rounded-2xl p-3 shadow-lg shadow-purple-500/5 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden">
              {/* Decorative effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full -mr-20 -mt-20"></div>
              <div className="relative">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4 text-purple-400" />
                  Detail Transaksi
                </h3>

                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 rounded-lg p-2 border border-slate-600/50">
                    <p className="text-xs text-slate-300 uppercase tracking-wider font-medium">ID Parkir</p>
                    <p className="text-sm font-bold text-white mt-0.5">{transaksi.id_parkir}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-2 border border-blue-400/30">
                    <p className="text-xs text-slate-300 uppercase tracking-wider font-medium">Plat</p>
                    <p className="text-sm font-bold text-blue-400 mt-0.5">{transaksi.kendaraan.plat_nomor}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-2 border border-purple-400/30">
                    <p className="text-xs text-slate-300 uppercase tracking-wider font-medium">Jenis</p>
                    <p className="text-xs font-semibold text-white mt-0.5">{transaksi.kendaraan.jenis_kendaraan}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg p-2 border border-amber-400/30">
                    <p className="text-xs text-slate-300 uppercase tracking-wider font-medium">Area</p>
                    <p className="text-xs font-semibold text-white mt-0.5">{transaksi.areaParkir.nama_area}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg p-2 border border-emerald-400/30">
                    <p className="text-xs text-slate-300 uppercase tracking-wider font-medium">Masuk</p>
                    <p className="text-xs font-semibold text-white mt-0.5 line-clamp-1">{formatDateTime(transaksi.waktu_masuk)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-500/20 to-red-500/20 rounded-lg p-2 border border-rose-400/30">
                    <p className="text-xs text-slate-300 uppercase tracking-wider font-medium">Durasi</p>
                    <p className="text-sm font-bold text-rose-400 mt-0.5">{calculateDurasi()}h</p>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="border-t border-slate-700 pt-2">
                  <h4 className="font-semibold text-white mb-1.5 text-xs">Pembayaran</h4>
                  <div className="space-y-2">
                    {/* Payment Method */}
                    <div>
                      <p className="text-xs font-medium text-slate-300 mb-1">Metode</p>
                      <div className="flex gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'CASH'}
                            onChange={() => setPaymentMethod('CASH')}
                            className="w-3 h-3 cursor-pointer accent-purple-600"
                          />
                          <span className="text-slate-300 font-medium group-hover:text-purple-400 transition-colors text-xs">💵 Cash</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'QRIS'}
                            onChange={() => setPaymentMethod('QRIS')}
                            className="w-3 h-3 cursor-pointer accent-purple-600"
                          />
                          <span className="text-slate-300 font-medium group-hover:text-purple-400 transition-colors text-xs">📱 QRIS</span>
                        </label>
                      </div>
                    </div>

                    {/* Billing Display */}
                    <div className="grid grid-cols-2 gap-1.5 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg p-2 border border-slate-600/50">
                      <div>
                        <p className="text-xs text-slate-300 uppercase font-medium">Tarif/Jam</p>
                        <p className="text-xs font-bold text-white mt-0.5">{formatCurrency(transaksi.tarif.tarif_per_jam)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-300 uppercase font-medium">Total</p>
                        <p className="text-xs font-bold text-green-400 mt-0.5">{formatCurrency(calculateBiaya())}</p>
                      </div>
                    </div>

                    {/* Cash Input */}
                    {paymentMethod === 'CASH' && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-slate-300">Jumlah Uang</label>
                        <input
                          type="number"
                          value={cashPaid}
                          onChange={(e) => setCashPaid(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-2 py-1.5 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all placeholder:text-slate-400 text-xs"
                          placeholder="0"
                          min={0}
                        />
                        <div className="p-2 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-lg border border-slate-600/50">
                          <p className="text-xs text-slate-300 mb-0.5 font-medium">Kembalian</p>
                          <p className={`text-sm font-bold transition-colors ${kembalian > 0 ? 'text-green-400' : kembalian === 0 ? 'text-slate-400' : 'text-red-400'}`}>
                            {formatCurrency(kembalian)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pay Button */}
                    <button
                      onClick={handleBayar}
                      disabled={loading || (paymentMethod === 'CASH' && cashPaidNumber < biayaSekarang)}
                      className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-600/30 active:shadow-purple-600/50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      {loading ? '⏳ Memproses...' : 'Bayar & Keluar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt/Success */}
        {keluarData && (
          <div className="group relative animate-in slide-in-from-bottom-4 duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-100 group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-slate-800/80 border border-l-4 border-l-green-500 border-slate-700/50 rounded-2xl p-3 shadow-lg shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 overflow-hidden">
              {/* Decorative effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full -mr-20 -mt-20"></div>
              <div className="relative">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  Struk Pembayaran
                </h3>

                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <div className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 rounded-lg p-2 border border-slate-600/50">
                    <p className="text-xs text-slate-300 uppercase font-medium">ID Parkir</p>
                    <p className="text-sm font-bold text-white mt-0.5">{keluarData.id_parkir}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-2 border border-blue-400/30">
                    <p className="text-xs text-slate-300 uppercase font-medium">Plat Nomor</p>
                    <p className="text-sm font-bold text-blue-400 mt-0.5">{keluarData.kendaraan.plat_nomor}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg p-2 border border-amber-400/30">
                    <p className="text-xs text-slate-300 uppercase font-medium">Durasi</p>
                    <p className="text-sm font-bold text-white mt-0.5">{keluarData.durasi_jam} jam</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-2 border border-green-400/30">
                    <p className="text-xs text-slate-300 uppercase font-medium">Total Biaya</p>
                    <p className="text-sm font-bold text-green-400 mt-0.5">{formatCurrency(keluarData.biaya_total)}</p>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={generatePDF}
                    className="flex-1 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-600/30 active:shadow-green-600/50 transition-all font-semibold text-xs"
                  >
                    📥 Download PDF
                  </button>
                  <button
                    onClick={() => setKeluarData(null)}
                    className="flex-1 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 active:bg-slate-600 transition-colors font-medium text-xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
