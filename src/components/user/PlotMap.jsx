import React from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon issue in Leaflet with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function PlotMap({ plots = [] }) {
  const positioned = plots.filter(
    (plot) =>
      plot.geo &&
      Number.isFinite(plot.geo.lat) &&
      Number.isFinite(plot.geo.lng) &&
      (plot.geo.lat !== 0 || plot.geo.lng !== 0)
  )

  if (!positioned.length) {
    return (
      <div className="rounded-2xl border border-dashed border-primary-200 bg-gradient-to-br from-primary-50 to-white p-12 text-center">
        <div className="mx-auto size-12 rounded-2xl bg-primary-100 text-primary-600 grid place-items-center mb-4">
          <MapPin size={22} />
        </div>
        <p className="text-sm font-medium text-surface-500">Map coordinates are not yet available for these plots.</p>
      </div>
    )
  }

  const center = [positioned[0].geo.lat, positioned[0].geo.lng]

  return (
    <div className="h-[480px] w-full overflow-hidden rounded-2xl border border-surface-200 shadow-card">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positioned.map((plot) => (
          <Marker key={plot.id} position={[plot.geo.lat, plot.geo.lng]}>
            <Popup>
              <div className="p-1">
                <Link
                  to={`/plots/${plot.id}`}
                  className="font-bold text-primary-700 hover:underline block"
                >
                  {plot.projectId || `Plot ${plot.plotNumber}`}
                </Link>
                <p className="text-xs text-surface-600 mt-1">Plot #{plot.plotNumber}</p>
                <p className="text-sm font-semibold text-surface-900 mt-1">
                  {currency.format(plot.totalAmount)}
                </p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold text-primary-700 bg-primary-50 border border-primary-200 px-1.5 py-0.5 rounded">
                  {plot.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
