import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Heart, MapPinned, MessageCircle, PhoneCall, Search, SlidersHorizontal } from 'lucide-react'
import { servicesApi, conversationsApi } from '../api/modules.js'
import { EmptyState, SectionHeading, StatusBadge } from '../components/layout/AppLayout.jsx'
import { ListingsMap } from '../components/maps/ListingsMap.jsx'
import { moroccoCities, serviceCategories } from '../data/options.js'
import { useAuthStore } from '../state/authStore.js'
import { useFavoritesStore } from '../state/favoritesStore.js'
import { geocodeMorocco } from '../lib/geocoding.js'

export function ServicesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const isFavorite = useFavoritesStore((state) => state.isFavorite)
  const toggleFavoriteState = useFavoritesStore((state) => state.toggle)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [mapFocus, setMapFocus] = useState(null)
  const [locationSearch, setLocationSearch] = useState(searchParams.get('location') || '')
  const [locationResult, setLocationResult] = useState(null)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    rating: searchParams.get('rating') || '',
    max_price: searchParams.get('max_price') || '',
  })
  const deferredSearch = useDeferredValue(filters.search)

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true)
      setError('')

      const params = {
        ...filters,
        search: deferredSearch,
      }
      const queryParams = new URLSearchParams(searchParams)

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          queryParams.set(key, value)
        } else {
          queryParams.delete(key)
        }
      })

      if (locationSearch) {
        queryParams.set('location', locationSearch)
      } else {
        queryParams.delete('location')
      }

      setSearchParams(queryParams, { replace: true })

      try {
        const data = await servicesApi.list(params)
        setServices(data.data ?? data)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [deferredSearch, filters, locationSearch, searchParams, setSearchParams])

  useEffect(() => {
    if (!locationSearch) {
      setLocationResult(null)
      return
    }

    const timeout = window.setTimeout(() => {
      geocodeMorocco(locationSearch)
        .then((result) => {
          setLocationResult(result)
          setMapFocus({ center: [result.latitude, result.longitude], zoom: 12 })
        })
        .catch(() => undefined)
    }, 500)

    return () => window.clearTimeout(timeout)
  }, [locationSearch])

  const visibleServices = useMemo(() => {
    if (!locationResult) {
      return services
    }

    return services.filter((service) => {
      if (!service.latitude || !service.longitude) {
        return false
      }

      return distanceInKm(
        Number(service.latitude),
        Number(service.longitude),
        locationResult.latitude,
        locationResult.longitude,
      ) <= 25
    })
  }, [locationResult, services])

  const toggleFavorite = async (id) => {
    if (!user) {
      navigate('/auth')
      return
    }

    await toggleFavoriteState('service', id)
  }

  const openChat = async (providerId) => {
    if (!user) {
      navigate('/auth')
      return
    }

    const response = await conversationsApi.open({ participant_id: providerId, kind: 'direct' })
    navigate(`/chat?conversation=${response.conversation.id}`)
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Service discovery"
        title="Browse providers on a synced Morocco map"
        description="Search by city or neighborhood, compare listing prices, and explore the map like a modern travel marketplace."
      />

      <div className="sticky top-[92px] z-20 rounded-[30px] border border-blue-100 bg-white/90 p-4 shadow-lg shadow-blue-100/40 backdrop-blur-xl">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr),repeat(4,minmax(0,1fr))]">
          <label className="flex items-center gap-3 rounded-[22px] border border-blue-100 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-blue-700" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Search services, categories, providers..." value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
          </label>
          <label className="flex items-center gap-3 rounded-[22px] border border-blue-100 bg-slate-50 px-4 py-3">
            <MapPinned className="h-4 w-4 text-blue-700" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="City or neighborhood (Maarif, Sbata...)" value={locationSearch} onChange={(event) => setLocationSearch(event.target.value)} />
          </label>
          <select className="field" value={filters.city} onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}>
            <option value="">All cities</option>
            {moroccoCities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
          <select className="field" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
            <option value="">All categories</option>
            {serviceCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="field" type="number" min="0" placeholder="Max DH" value={filters.max_price} onChange={(event) => setFilters((current) => ({ ...current, max_price: event.target.value }))} />
            <select className="field" value={filters.rating} onChange={(event) => setFilters((current) => ({ ...current, rating: event.target.value }))}>
              <option value="">Any rating</option>
              <option value="3">3+ stars</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-blue-700">
            <SlidersHorizontal className="h-4 w-4" />
            {visibleServices.length} result(s)
          </span>
          {locationResult && <span className="rounded-full bg-slate-50 px-3 py-2">Centered on {locationResult.label}</span>}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,520px),minmax(0,1fr)] xl:items-start">
        <div className="space-y-4 xl:max-h-[calc(100vh-220px)] xl:overflow-y-auto xl:pr-2">
          {loading && <div className="soft-panel p-6 text-slate-500">Loading services...</div>}
          {!loading && error && <div className="soft-panel p-6 text-rose-700">{error}</div>}
          {!loading && !visibleServices.length && <EmptyState title="No matching services" description="Try widening your filters or exploring another city or neighborhood." />}

          {visibleServices.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              onMouseEnter={() => setActiveId(service.id)}
              onClick={() => setMapFocus({ center: [Number(service.latitude), Number(service.longitude)], zoom: 13, id: service.id })}
              className={`soft-panel flex flex-col gap-4 overflow-hidden p-0 transition duration-200 hover:-translate-y-1 hover:shadow-lg ${activeId === service.id ? 'ring-2 ring-blue-300' : ''}`}
            >
              <div className="grid gap-4 p-4 md:grid-cols-[170px,1fr]">
                <div className="overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-50 via-sky-50 to-white">
                  {service.images?.[0]?.url ? (
                    <img src={service.images[0].url} alt={service.title} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-blue-700">Service image</div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-blue-700">{service.category}</p>
                      <h3 className="mt-2 text-xl font-bold">{service.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">{service.city} | {service.provider?.display_name}</p>
                    </div>
                    <StatusBadge status={service.status} />
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-slate-600">{service.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-2xl font-black text-blue-800">{service.price} DH</p>
                      <p className="text-sm text-slate-500">{service.average_rating} rating | {service.reviews_count} reviews</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={(event) => { event.preventDefault(); toggleFavorite(service.id) }} className={`button-secondary ${isFavorite('service', service.id) ? 'bg-blue-700 text-white hover:bg-blue-800' : ''}`}>
                        <Heart className={`mr-2 h-4 w-4 ${isFavorite('service', service.id) ? 'fill-current' : ''}`} />
                        Save
                      </button>
                      <button type="button" onClick={(event) => { event.preventDefault(); openChat(service.provider.id) }} className="button-secondary">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat
                      </button>
                      {service.provider?.phone && (
                        <a href={`tel:${service.provider.phone}`} onClick={(event) => event.stopPropagation()} className="button-secondary">
                          <PhoneCall className="mr-2 h-4 w-4" />
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="xl:sticky xl:top-[184px]">
          <ListingsMap items={visibleServices} activeId={activeId} onActiveChange={setActiveId} focusTarget={mapFocus} />
        </div>
      </div>
    </div>
  )
}

function distanceInKm(lat1, lon1, lat2, lon2) {
  const earth = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2

  return earth * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}
