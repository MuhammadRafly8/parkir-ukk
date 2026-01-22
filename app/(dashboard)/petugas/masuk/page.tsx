'use client'

import { useEffect, useRef, useState } from 'react'
import { LoadingSpinner } from '@/app/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/app/components/shared/ErrorAlert'
import { SuccessAlert } from '@/app/components/shared/SuccessAlert'
import { QRCodeSVG } from 'qrcode.react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { ArrowDownCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Area {
  id_area: number
  nama_area: string
  kapasitas: number
  terisi: number
}

interface Kendaraan {
  id_kendaraan: number
  plat_nomor: string
  jenis_kendaraan: string
  warna: string
  pemilik: string
}

export default function MasukPage() {
  const [areas, setAreas] = useState<Area[]>([])
  const [allKendaraan, setAllKendaraan] = useState<Kendaraan[]>([])
  const [filteredKendaraan, setFilteredKendaraan] = useState<Kendaraan[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tiketData, setTiketData] = useState<any>(null)
  const [selectedArea, setSelectedArea] = useState('')
  const [foundKendaraan, setFoundKendaraan] = useState<any>(null)
  const qrSvgRef = useRef<SVGSVGElement | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  useEffect(() => {
    fetchAreas()
    fetchAllKendaraan()
  }, [])

  const fetchAllKendaraan = async () => {
    try {
      const res = await fetch('/api/kendaraan')
      if (res.ok) {
        const data = await res.json()
        setAllKendaraan(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching kendaraan:', error)
    }
  }

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

  const handleSearch = async (platNomor: string) => {
    setSearchInput(platNomor)
    setError('')

    if (!platNomor.trim()) {
      setFilteredKendaraan([])
      setFoundKendaraan(null)
      setShowSearchResults(false)
      return
    }

    // Filter dari data lokal
    const filtered = allKendaraan.filter((k) =>
      k.plat_nomor.toLowerCase().includes(platNomor.toLowerCase())
    )
    
    setFilteredKendaraan(filtered)
    setShowSearchResults(true)

    if (filtered.length === 0) {
      setError('Kendaraan tidak ditemukan')
      setFoundKendaraan(null)
    }
  }

  const selectKendaraan = (kendaraan: Kendaraan) => {
    setFoundKendaraan(kendaraan)
    setSearchInput(kendaraan.plat_nomor)
    setShowSearchResults(false)
    setError('')
    setFilteredKendaraan([])
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
        setSearchInput('')
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

  const svgElementToPngDataUrl = (svgEl: SVGSVGElement, size = 500): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const serializer = new XMLSerializer()
        let svgString = serializer.serializeToString(svgEl)
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
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            const dataUrl = canvas.toDataURL('image/png')
            URL.revokeObjectURL(url)
            resolve(dataUrl)
          } catch (err) {
            reject(err)
          }
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = url
      } catch (err) {
        reject(err)
      }
    })
  }

  const downloadTiketPDF = async (data: any) => {
    try {
      if (!qrSvgRef.current) throw new Error('QR code not rendered')

      const pngDataUrl = await svgElementToPngDataUrl(qrSvgRef.current, 256)

      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([400, 600])
      const { width, height } = page.getSize()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      const pngImage = await pdfDoc.embedPng(pngDataUrl)
      page.drawText('TIKET PARKIR', {
        x: width / 2 - 50,
        y: height - 50,
        size: 20,
        font: boldFont,
      })

      page.drawText(`ID Parkir: ${data.id_parkir}`, { x: 30, y: height - 100, size: 12, font })
      page.drawText(`Plat: ${data.kendaraan.plat_nomor}`, { x: 30, y: height - 125, size: 12, font })
      page.drawText(`Jenis: ${data.kendaraan.jenis_kendaraan}`, { x: 30, y: height - 150, size: 12, font })
      page.drawText(`Warna: ${data.kendaraan.warna}`, { x: 30, y: height - 175, size: 12, font })
      page.drawText(`Pemilik: ${data.kendaraan.pemilik}`, { x: 30, y: height - 200, size: 12, font })
      page.drawText(`Area: ${data.areaParkir.nama_area}`, { x: 30, y: height - 225, size: 12, font })
      page.drawText(`Masuk: ${new Date(data.waktu_masuk).toLocaleString('id-ID')}`, { x: 30, y: height - 250, size: 12, font })

      page.drawImage(pngImage, {
        x: width / 2 - 64,
        y: height / 2 - 150,
        width: 128,
        height: 128,
      })

      page.drawText('Simpan tiket ini untuk keluar parkir', {
        x: 30,
        y: 50,
        size: 10,
        font,
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `tiket_${data.id_parkir}.pdf`
      link.click()
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError('Gagal generate PDF')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-2">
            <ArrowDownCircleIcon className="w-8 h-8 text-green-400 shrink-0" />
            Kendaraan Masuk
          </h1>
          <div className="h-0.5 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          <p className="text-slate-300">Catat kendaraan yang masuk ke area parkir</p>
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

        {/* Search and Results Merged */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-slate-800/80 rounded-2xl p-6 border border-slate-700/50 shadow-lg shadow-green-500/5 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
              <label className="block text-sm font-semibold text-white mb-3">Cari Kendaraan</label>
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchInput.trim() && filteredKendaraan.length > 0 && setShowSearchResults(true)}
                    placeholder="Masukkan plat nomor..."
                    className="w-full px-4 py-3 border border-slate-600 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all bg-slate-700/50 text-white placeholder:text-slate-400"
                    autoFocus
                  />

                  {/* Search Results Dropdown */}
                  {showSearchResults && filteredKendaraan.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                      {filteredKendaraan.map((kendaraan) => (
                        <button
                          key={kendaraan.id_kendaraan}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selectKendaraan(kendaraan)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-700/50 border-b border-slate-700 last:border-b-0 transition-colors group/item"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">{kendaraan.plat_nomor}</p>
                              <p className="text-sm text-slate-400">{kendaraan.jenis_kendaraan} • {kendaraan.warna}</p>
                            </div>
                            <span className="text-green-500 opacity-0 group-hover/item:opacity-100 transition-opacity">→</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (filteredKendaraan.length === 1) {
                      selectKendaraan(filteredKendaraan[0])
                    }
                  }}
                  disabled={loading || !searchInput.trim() || filteredKendaraan.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-600/30 active:shadow-green-600/50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '...' : 'Cari'}
                </button>
              </div>

              {showSearchResults && filteredKendaraan.length === 0 && searchInput.trim() && error && (
                <div className="mt-3 p-3 bg-red-950/30 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
            {showSearchResults && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSearchResults(false)}
              />
            )}
          </div>

          {/* Found Vehicle Data - Merged Below Search */}
          {foundKendaraan && !tiketData && (
            <div className="group relative animate-in slide-in-from-bottom-4 duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-l-4 border-l-blue-500 border-slate-700/50 shadow-lg shadow-blue-500/5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
                {/* Decorative effect di pinggir */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -mr-20 -mt-20"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-bold text-white">Data Kendaraan</h3>
                    <button
                      onClick={() => {
                        setFoundKendaraan(null)
                        setSearchInput('')
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-3 border border-blue-400/30">
                      <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Plat Nomor</p>
                      <p className="text-base font-bold text-blue-400 mt-1">{foundKendaraan.plat_nomor}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-3 border border-purple-400/30">
                      <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Jenis</p>
                      <p className="text-sm font-semibold text-white mt-1">{foundKendaraan.jenis_kendaraan}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg p-3 border border-amber-400/30">
                      <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Warna</p>
                      <p className="text-sm font-semibold text-white mt-1">{foundKendaraan.warna}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg p-3 border border-emerald-400/30">
                      <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pemilik</p>
                      <p className="text-sm font-semibold text-white mt-1">{foundKendaraan.pemilik}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-3">
                    <label className="block text-sm font-semibold text-white mb-2">Pilih Area Parkir</label>
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all bg-slate-700/50 text-white font-medium text-sm"
                    >
                      <option value="">-- Pilih Area --</option>
                      {areas.map((a) => (
                        <option key={a.id_area} value={a.id_area}>
                          {a.nama_area} (terisi: {a.terisi}/{a.kapasitas})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleCetakTiket}
                      disabled={submitting || !selectedArea}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-600/30 active:shadow-green-600/50 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '⏳ Memproses...' : '🎟️ Cetak Tiket'}
                    </button>
                    <button
                      onClick={() => {
                        setFoundKendaraan(null)
                        setSelectedArea('')
                        setSearchInput('')
                      }}
                      className="px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 active:bg-slate-600 transition-colors font-medium text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Result */}
          {tiketData && (
            <div className="group relative animate-in slide-in-from-bottom-4 duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-100 group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-l-4 border-l-green-500 border-slate-700/50 shadow-lg shadow-green-500/10 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 overflow-hidden">
                {/* Decorative effect */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full -mr-20 -mt-20"></div>
                <div className="relative">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 flex items-center gap-2">
                    ✅ Tiket Parkir Berhasil Dicetak
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <div className="bg-gradient-to-br from-slate-700/50 to-slate-600/50 rounded-lg p-3 border border-slate-600/50">
                      <p className="text-xs font-semibold text-slate-300 uppercase">ID Parkir</p>
                      <p className="text-lg font-bold text-white mt-1">{tiketData.id_parkir}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-3 border border-blue-400/30">
                      <p className="text-xs font-semibold text-slate-300 uppercase">Plat Nomor</p>
                      <p className="text-lg font-bold text-blue-400 mt-1">{tiketData.kendaraan.plat_nomor}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-400/30 flex flex-col items-center mb-3">
                    <QRCodeSVG
                      id="ticket-qr"
                      value={tiketData.id_parkir.toString()}
                      size={100}
                      level="H"
                      ref={qrSvgRef as any}
                    />
                    <p className="text-xs font-semibold text-slate-300 mt-2">ID: {tiketData.id_parkir}</p>
                  </div>

                  <p className="text-xs text-slate-300 mb-3 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                    💡 Simpan atau print tiket ini untuk keluar parkir nanti
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadTiketPDF(tiketData)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-600/30 active:shadow-blue-600/50 transition-all font-semibold text-sm"
                    >
                      📥 Download PDF
                    </button>
                    <button
                      onClick={() => {
                        setTiketData(null)
                        setSearchInput('')
                      }}
                      className="flex-1 px-3 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 active:bg-slate-600 transition-colors font-medium text-sm"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
