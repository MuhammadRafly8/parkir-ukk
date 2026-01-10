'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { BrowserMultiFormatReader } from '@zxing/library'

interface QRScannerProps {
  onScan: (id: string) => void
  onManualInput?: (id: string) => void
  placeholder?: string
}

export function QRScanner({ onScan, onManualInput, placeholder = 'Scan QR Code atau masukkan ID' }: QRScannerProps) {
  const [inputValue, setInputValue] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup: stop scanning when component unmounts
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setIsScanning(true)
      setError('')

      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      // Get available video input devices
      const videoInputDevices = await codeReader.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        setError('Tidak ada kamera yang tersedia')
        setIsScanning(false)
        return
      }

      // Use the first available camera
      const selectedDeviceId = videoInputDevices[0].deviceId

      if (videoRef.current) {
        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              const text = result.getText()
              codeReader.reset()
              setIsScanning(false)
              onScan(text)
            }
            if (err && err.name !== 'NotFoundException') {
              // NotFoundException is normal when scanning, ignore it
              console.error('Scan error:', err)
            }
          }
        )
      }
    } catch (err: any) {
      console.error('Error starting scanner:', err)
      setError('Gagal membuka kamera. Pastikan izin kamera sudah diberikan.')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      codeReaderRef.current = null
    }
    setIsScanning(false)
  }

  const handleManualInput = () => {
    if (inputValue.trim() && onManualInput) {
      onManualInput(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualInput()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
          autoFocus={!isScanning}
          disabled={isScanning}
        />
        {onManualInput && (
          <Button onClick={handleManualInput} variant="outline" disabled={isScanning}>
            Cari
          </Button>
        )}
        {!isScanning ? (
          <Button onClick={startScanning} variant="primary">
            Buka Scanner
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="danger">
            Tutup Scanner
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isScanning && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full max-w-md mx-auto rounded-lg border-2 border-blue-500"
            style={{ maxHeight: '400px' }}
          />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
            Arahkan kamera ke QR Code
          </div>
        </div>
      )}
    </div>
  )
}