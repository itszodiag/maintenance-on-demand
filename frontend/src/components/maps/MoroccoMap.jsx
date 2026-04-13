import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const moroccoCenter = [31.7917, -7.0926]

export function MoroccoMap({ markers = [], height = 420, linkPrefix = '/services' }) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-[24px] border border-blue-100 shadow-sm">
      <MapContainer center={moroccoCenter} zoom={6} scrollWheelZoom className="z-0">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers
          .filter((marker) => marker.latitude && marker.longitude)
          .map((marker) => (
            <Marker key={marker.id} position={[Number(marker.latitude), Number(marker.longitude)]}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">{marker.title}</p>
                  <p className="text-sm text-slate-500">{marker.city}</p>
                  <Link to={`${linkPrefix}/${marker.id}`} className="text-sm font-semibold text-blue-700">
                    View details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}
