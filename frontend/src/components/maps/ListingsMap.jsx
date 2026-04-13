import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'

const moroccoCenter = [31.7917, -7.0926]

function createPriceIcon(price, active = false) {
  return L.divIcon({
    className: '',
    html: `<div class="map-price-badge ${active ? 'is-active' : ''}">${Math.round(price)} DH</div>`,
    iconSize: [76, 36],
    iconAnchor: [38, 18],
  })
}

function createClusterIcon(count, active = false) {
  return L.divIcon({
    className: '',
    html: `<div class="map-cluster-badge ${active ? 'is-active' : ''}">${count}</div>`,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  })
}

function ViewportController({ focusTarget, onZoomChange, onClusterSelectRef }) {
  const map = useMap()

  useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  })

  useEffect(() => {
    if (focusTarget?.center) {
      map.setView(focusTarget.center, focusTarget.zoom ?? 12, { animate: true })
    }
  }, [focusTarget, map])

  useEffect(() => {
    onClusterSelectRef.current = (position, zoom) => {
      map.setView(position, zoom, { animate: true })
    }
  }, [map, onClusterSelectRef])

  return null
}

export function ListingsMap({ items, activeId, onActiveChange, focusTarget, height = 640 }) {
  const [zoom, setZoom] = useState(6)
  const clusterSelectRef = useRef(null)
  const clusters = useMemo(() => clusterItems(items, zoom), [items, zoom])

  return (
    <div className="overflow-hidden rounded-[32px] border border-blue-100 shadow-xl shadow-blue-100/50" style={{ height }}>
      <style>{`
        .map-price-badge {
          min-width: 76px;
          padding: 8px 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(191, 219, 254, 0.9);
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.18);
          color: #0f172a;
          font-weight: 800;
          font-size: 12px;
          text-align: center;
        }
        .map-price-badge.is-active {
          background: #1d4ed8;
          color: white;
          transform: scale(1.08);
          border-color: #1d4ed8;
        }
        .map-cluster-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 9999px;
          background: #dbeafe;
          border: 1px solid #93c5fd;
          color: #1d4ed8;
          font-weight: 900;
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.2);
        }
        .map-cluster-badge.is-active {
          background: #1d4ed8;
          color: white;
        }
      `}</style>
      <MapContainer center={moroccoCenter} zoom={6} scrollWheelZoom className="z-0 h-full w-full">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ViewportController focusTarget={focusTarget} onZoomChange={setZoom} onClusterSelectRef={clusterSelectRef} />
        {clusters.map((cluster) => {
          const isActive = cluster.items.some((item) => item.id === activeId)

          if (cluster.items.length > 1) {
            return (
              <Marker
                key={cluster.key}
                position={cluster.position}
                icon={createClusterIcon(cluster.items.length, isActive)}
                eventHandlers={{
                  click: () => {
                    onActiveChange(cluster.items[0].id)
                    clusterSelectRef.current?.(cluster.position, Math.min(zoom + 2, 14))
                  },
                }}
              />
            )
          }

          const item = cluster.items[0]

          return (
            <Marker
              key={item.id}
              position={[Number(item.latitude), Number(item.longitude)]}
              icon={createPriceIcon(item.price, item.id === activeId)}
              eventHandlers={{
                click: () => onActiveChange(item.id),
                mouseover: () => onActiveChange(item.id),
              }}
            >
              <Popup>
                <div className="w-56 space-y-3">
                  {item.images?.[0]?.url && <img src={item.images[0].url} alt={item.title} className="h-28 w-full rounded-xl object-cover" />}
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.city}</p>
                    <p className="mt-1 font-bold text-blue-700">{item.price} DH</p>
                  </div>
                  <Link to={`/services/${item.id}`} className="text-sm font-semibold text-blue-700">
                    View details
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

function clusterItems(items, zoom) {
  const precision = zoom <= 6 ? 1 : zoom <= 8 ? 0.4 : zoom <= 10 ? 0.16 : 0.04
  const buckets = new Map()

  items
    .filter((item) => item.latitude && item.longitude)
    .forEach((item) => {
      const lat = Number(item.latitude)
      const lng = Number(item.longitude)
      const key = `${Math.round(lat / precision) * precision}:${Math.round(lng / precision) * precision}`
      const entry = buckets.get(key) ?? { key, items: [], totalLat: 0, totalLng: 0 }

      entry.items.push(item)
      entry.totalLat += lat
      entry.totalLng += lng
      buckets.set(key, entry)
    })

  return Array.from(buckets.values()).map((bucket) => ({
    ...bucket,
    position: [bucket.totalLat / bucket.items.length, bucket.totalLng / bucket.items.length],
  }))
}
