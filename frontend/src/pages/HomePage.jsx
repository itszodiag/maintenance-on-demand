import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { homeApi } from '../api/modules.js'
import { EmptyState, SectionCard, SectionHeading } from '../components/layout/AppLayout.jsx'
import { serviceCategories } from '../data/options.js'

export function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [services, setServices] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    homeApi.featuredServices().then((data) => setServices(data)).catch(() => setServices([]))
    homeApi.featuredProducts().then((data) => setProducts(data)).catch(() => setProducts([]))
  }, [])

  return (
    <div className="space-y-12">
      <section className="glass-card overflow-hidden p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              <Sparkles className="h-4 w-4" />
              End-to-end maintenance platform
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight tracking-tight text-slate-900 lg:text-6xl">
              Search technicians, order supplies, chat instantly, and track every job across Morocco.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Built for modern maintenance workflows with booking, marketplace checkout, role-based dashboards, real-time chat, and smart maps.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                navigate(`/services?search=${encodeURIComponent(query)}`)
              }}
              className="mt-8 flex flex-col gap-3 rounded-[28px] border border-blue-100 bg-white p-4 shadow-sm lg:flex-row"
            >
              <input className="field flex-1" placeholder="Search plumbing, HVAC, electricians, repair..." value={query} onChange={(event) => setQuery(event.target.value)} />
              <button type="submit" className="button-primary">
                Explore services
              </button>
            </form>
          </div>

          <div className="grid gap-4">
            {[
              { title: 'Verified providers', text: 'Admin verification, reviews, and location-aware discovery.', icon: ShieldCheck },
              { title: 'Marketplace checkout', text: 'Buy products, manage stock, and pay by cash or Stripe test mode.', icon: ShoppingBag },
              { title: 'Live collaboration', text: 'WhatsApp-style messaging with typing, seen, and presence.', icon: Compass },
            ].map(({ title, text, icon: Icon }) => (
              <div key={title} className="rounded-[24px] border border-blue-100 bg-white/90 p-5 shadow-sm">
                <Icon className="h-8 w-8 text-blue-700" />
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Categories" title="Popular service verticals" description="Fast access to the maintenance categories clients search most." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {serviceCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => navigate(`/services?category=${encodeURIComponent(category)}`)}
              className="soft-panel flex items-center justify-between p-5 text-left transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="font-semibold">{category}</span>
              <ArrowRight className="h-4 w-4 text-blue-700" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Featured services"
          title="Top-rated providers ready to respond"
          description="Browse highlighted services with strong reviews and broad city coverage."
          action={<Link to="/services" className="button-secondary">See all services</Link>}
        />
        {services.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <Link key={service.id} to={`/services/${service.id}`} className="soft-panel overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                <div className="h-48 bg-gradient-to-br from-blue-100 via-sky-100 to-blue-50">
                  {service.images?.[0] ? (
                    <img src={service.images[0].url} alt={service.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <MapPinned className="h-10 w-10 text-blue-700" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">{service.title}</h3>
                    <span className="text-sm font-semibold text-blue-700">{service.price} MAD</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{service.city} | {service.category}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{service.description}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No services yet" description="Seed the backend or create a service from a technician dashboard to see it here." />
        )}
      </section>

      <section>
        <SectionHeading
          eyebrow="Marketplace"
          title="Products for repairs, upgrades, and site operations"
          description="From spare parts to smart tools, vendors can sell directly to clients and teams."
          action={<Link to="/marketplace" className="button-secondary">Visit marketplace</Link>}
        />
        {products.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="soft-panel overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                <div className="h-40 bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
                  {product.images?.[0] ? (
                    <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-10 w-10 text-blue-700" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold">{product.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{product.brand} | {product.speciality}</p>
                  <p className="mt-3 text-lg font-black text-blue-800">{product.price} MAD</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="Marketplace waiting for products" description="Vendor listings will appear here once inventory is published." />
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SectionCard>
          <h3 className="text-xl font-bold">Clients</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Search with filters, save favorites, request service, chat, and checkout products without leaving the platform.</p>
        </SectionCard>
        <SectionCard>
          <h3 className="text-xl font-bold">Operations teams</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Technicians, companies, and vendors get clear dashboards for requests, availability, orders, and analytics.</p>
        </SectionCard>
        <SectionCard>
          <h3 className="text-xl font-bold">Administrators</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Verify users, moderate catalog content, and monitor platform-wide performance from one control room.</p>
        </SectionCard>
      </section>
    </div>
  )
}
