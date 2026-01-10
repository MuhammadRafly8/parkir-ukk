'use client'

import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'

interface VehicleFormProps {
  formData: {
    plat_nomor: string
    jenis_kendaraan: string
    warna: string
    pemilik: string
    id_area: string
  }
  onChange: (data: any) => void
  areas: Array<{ id_area: number; nama_area: string; kapasitas: number; terisi: number }>
}

export function VehicleForm({ formData, onChange, areas }: VehicleFormProps) {
  const availableAreas = areas.filter(area => area.terisi < area.kapasitas)

  return (
    <div className="space-y-4">
      <Input
        label="Plat Nomor"
        value={formData.plat_nomor}
        onChange={(e) => onChange({ ...formData, plat_nomor: e.target.value.toUpperCase() })}
        required
        placeholder="Contoh: B1234XYZ"
      />
      <Select
        label="Jenis Kendaraan"
        value={formData.jenis_kendaraan}
        onChange={(e) => onChange({ ...formData, jenis_kendaraan: e.target.value })}
        options={[
          { value: 'MOTOR', label: 'Motor' },
          { value: 'MOBIL', label: 'Mobil' },
          { value: 'LAINNYA', label: 'Lainnya' },
        ]}
        required
      />
      <Input
        label="Warna"
        value={formData.warna}
        onChange={(e) => onChange({ ...formData, warna: e.target.value })}
        required
      />
      <Input
        label="Nama Pemilik"
        value={formData.pemilik}
        onChange={(e) => onChange({ ...formData, pemilik: e.target.value })}
        required
      />
      <Select
        label="Area Parkir"
        value={formData.id_area}
        onChange={(e) => onChange({ ...formData, id_area: e.target.value })}
        options={[
          { value: '', label: 'Pilih Area...' },
          ...availableAreas.map((area) => ({
            value: area.id_area.toString(),
            label: `${area.nama_area} (Tersedia: ${area.kapasitas - area.terisi}/${area.kapasitas})`,
          })),
        ]}
        required
        error={availableAreas.length === 0 ? 'Semua area parkir penuh' : undefined}
      />
    </div>
  )
}
