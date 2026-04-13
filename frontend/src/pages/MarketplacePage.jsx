import { useDeferredValue, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Heart, MessageCircle, PhoneCall, ShoppingCart } from 'lucide-react'
import { cartApi, conversationsApi, productsApi } from '../api/modules.js'
import { EmptyState, SectionHeading } from '../components/layout/AppLayout.jsx'
import { moroccoCities } from '../data/options.js'
import { useAuthStore } from '../state/authStore.js'
import { useFavoritesStore } from '../state/favoritesStore.js'

export function MarketplacePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isFavorite = useFavoritesStore((state) => state.isFavorite)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    brand: searchParams.get('brand') || '',
    max_price: searchParams.get('max_price') || '',
  })
  const [loading, setLoading] = useState(true)
  const deferredSearch = useDeferredValue(filters.search)

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)

      const params = { ...filters, search: deferredSearch }
      const queryParams = new URLSearchParams(searchParams)

      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.set(key, value)
        else queryParams.delete(key)
      })
      setSearchParams(queryParams, { replace: true })

      try {
        const data = await productsApi.list(params)
        setProducts(data.data ?? data)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [deferredSearch, filters, searchParams, setSearchParams])

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Marketplace"
        title="Maintenance products with direct vendor checkout"
        description="Browse stocked inventory, talk to vendors, save favorites, and add items to your cart."
      />

      <div className="soft-panel grid gap-4 p-5 md:grid-cols-4">
        <input className="field" placeholder="Search products" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
        <select className="field" value={filters.city} onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}>
          <option value="">All cities</option>
          {moroccoCities.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
        <input className="field" placeholder="Brand" value={filters.brand} onChange={(event) => setFilters((current) => ({ ...current, brand: event.target.value }))} />
        <input className="field" type="number" min="0" placeholder="Max price" value={filters.max_price} onChange={(event) => setFilters((current) => ({ ...current, max_price: event.target.value }))} />
      </div>

      {loading && <div className="soft-panel p-6 text-slate-500">Loading products...</div>}
      {!loading && !products.length && <EmptyState title="No products found" description="Try another city, brand, or budget range." />}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <article key={product.id} className="soft-panel overflow-hidden">
            <Link to={`/products/${product.id}`} className="block h-48 bg-gradient-to-br from-blue-50 via-sky-50 to-white">
              {product.images?.[0] ? (
                <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-blue-700">{product.speciality}</div>
              )}
            </Link>
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-blue-700">{product.speciality}</p>
              <Link to={`/products/${product.id}`} className="mt-2 block text-lg font-bold">{product.title}</Link>
              <p className="mt-2 text-sm text-slate-500">{product.brand} | {product.city}</p>
              <p className="mt-3 text-2xl font-black text-blue-800">{product.price} MAD</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      navigate('/auth')
                      return
                    }

                    toggleFavorite('product', product.id)
                  }}
                  className={`button-secondary ${isFavorite('product', product.id) ? 'bg-blue-700 text-white hover:bg-blue-800' : ''}`}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite('product', product.id) ? 'fill-current' : ''}`} />
                  Save
                </button>
                {user && (
                  <button type="button" onClick={() => cartApi.add({ product_id: product.id, quantity: 1 })} className="button-secondary">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      navigate('/auth')
                      return
                    }

                    conversationsApi.open({ participant_id: product.vendor.id, kind: 'direct' }).then((result) => {
                      navigate(`/chat?conversation=${result.conversation.id}`)
                    })
                  }}
                  className="button-secondary"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Chat
                </button>
                {product.vendor?.phone && (
                  <a href={`tel:${product.vendor.phone}`} className="button-secondary">
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Call
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
