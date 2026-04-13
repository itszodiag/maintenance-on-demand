import { useEffect, useState } from 'react'
import { Heart, MessageCircle, PhoneCall, Send } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { conversationsApi, reviewsApi, serviceRequestsApi, servicesApi } from '../api/modules.js'
import { EmptyState, SectionCard, SectionHeading } from '../components/layout/AppLayout.jsx'
import { MoroccoMap } from '../components/maps/MoroccoMap.jsx'
import { useAuthStore } from '../state/authStore.js'
import { toFormData } from '../lib/formData.js'
import { useFavoritesStore } from '../state/favoritesStore.js'

export function ServiceDetailsPage() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isFavorite = useFavoritesStore((state) => state.isFavorite)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const [service, setService] = useState(null)
  const [requestForm, setRequestForm] = useState({ requested_for: '', city: '', address: '', description: '', images: [] })
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    servicesApi.details(serviceId)
      .then((data) => {
        setService(data)
        setRequestForm((current) => ({ ...current, city: data.city || current.city }))
      })
      .catch((error) => setMessage(error.message))
  }, [serviceId])

  if (!service) {
    return <div className="soft-panel p-6 text-slate-500">Loading service details...</div>
  }

  const submitRequest = async (event) => {
    event.preventDefault()

    if (!user) {
      navigate('/auth')
      return
    }

    const response = await serviceRequestsApi.create(toFormData({
      ...requestForm,
      service_id: service.id,
    }))

    setMessage(response.message)
    setRequestForm({ requested_for: '', city: service.city, address: '', description: '', images: [] })
  }

  const openChat = async () => {
    if (!user) {
      navigate('/auth')
      return
    }

    const result = await conversationsApi.open({ participant_id: service.provider.id, kind: 'direct' })
    navigate(`/chat?conversation=${result.conversation.id}`)
  }

  const ensureAuth = () => {
    if (!user) {
      navigate('/auth')
      return false
    }

    return true
  }

  const submitReview = async (event) => {
    event.preventDefault()
    const response = await reviewsApi.create({
      type: 'service',
      id: service.id,
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment,
    })
    setService((current) => ({
      ...current,
      reviews: [response.review, ...(current.reviews ?? [])],
    }))
    setReviewForm({ rating: 5, comment: '' })
  }

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Service details" title={service.title} description={service.description} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {(service.images?.length ? service.images : [{ url: null }]).map((image, index) => (
              <div key={image?.id ?? index} className="overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-50 via-sky-50 to-white">
                {image?.url ? (
                  <img src={image.url} alt={service.title} className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center text-slate-400">Service gallery</div>
                )}
              </div>
            ))}
          </div>

          <SectionCard>
            <div className="grid gap-4 md:grid-cols-4">
              <Metric label="Category" value={service.category} />
              <Metric label="City" value={service.city} />
              <Metric label="Price" value={`${service.price} MAD`} />
              <Metric label="Rating" value={`${service.average_rating} / 5`} />
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="text-xl font-bold">Provider</h3>
            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{service.provider?.display_name}</p>
              <p>{service.provider?.city}</p>
              <p>{service.provider?.bio || 'Experienced provider available across multiple maintenance requests.'}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (ensureAuth()) {
                    toggleFavorite('provider', service.provider.id)
                  }
                }}
                className={`button-secondary ${isFavorite('provider', service.provider.id) ? 'bg-blue-700 text-white hover:bg-blue-800' : ''}`}
              >
                <Heart className={`mr-2 h-4 w-4 ${isFavorite('provider', service.provider.id) ? 'fill-current' : ''}`} />
                Save provider
              </button>
              <button type="button" onClick={openChat} className="button-secondary">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat
              </button>
              {service.provider?.phone && (
                <a href={`tel:${service.provider.phone}`} className="button-secondary">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Call
                </a>
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="text-xl font-bold">Reviews</h3>
            <div className="mt-4 space-y-4">
              {(service.reviews ?? []).length ? (
                service.reviews.map((review) => (
                  <div key={review.id} className="rounded-[20px] border border-blue-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{review.author?.display_name ?? review.author?.name}</p>
                      <span className="text-sm text-amber-600">{review.rating} / 5</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="No reviews yet" description="Be the first client to review this service." />
              )}
            </div>
            {user && (
              <form onSubmit={submitReview} className="mt-6 grid gap-4 md:grid-cols-[140px,1fr,160px]">
                <select className="field" value={reviewForm.rating} onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}>
                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                </select>
                <input className="field" placeholder="Share your experience" value={reviewForm.comment} onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))} required />
                <button type="submit" className="button-primary">Post review</button>
              </form>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <h3 className="text-xl font-bold">Request this service</h3>
            <form onSubmit={submitRequest} className="mt-4 grid gap-4">
              <input className="field" type="date" value={requestForm.requested_for} onChange={(event) => setRequestForm((current) => ({ ...current, requested_for: event.target.value }))} />
              <input className="field" placeholder="City" value={requestForm.city} onChange={(event) => setRequestForm((current) => ({ ...current, city: event.target.value }))} required />
              <input className="field" placeholder="Address" value={requestForm.address} onChange={(event) => setRequestForm((current) => ({ ...current, address: event.target.value }))} required />
              <textarea className="field" rows="4" placeholder="Describe the issue, preferred time, or access details" value={requestForm.description} onChange={(event) => setRequestForm((current) => ({ ...current, description: event.target.value }))} />
              <input className="field" type="file" accept="image/*" multiple onChange={(event) => setRequestForm((current) => ({ ...current, images: Array.from(event.target.files ?? []) }))} />
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="button-primary">
                  <Send className="mr-2 h-4 w-4" />
                  Send request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (ensureAuth()) {
                      toggleFavorite('service', service.id)
                    }
                  }}
                  className={`button-secondary ${isFavorite('service', service.id) ? 'bg-blue-700 text-white hover:bg-blue-800' : ''}`}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite('service', service.id) ? 'fill-current' : ''}`} />
                  Save
                </button>
              </div>
              {message && <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</p>}
            </form>
          </SectionCard>

          <SectionCard>
            <h3 className="mb-4 text-xl font-bold">Location</h3>
            <MoroccoMap markers={[service]} height={320} />
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-[20px] bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 font-bold text-slate-900">{value}</p>
    </div>
  )
}
