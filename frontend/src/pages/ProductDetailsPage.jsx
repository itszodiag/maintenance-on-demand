import { useEffect, useState } from 'react'
import { Heart, MessageCircle, PhoneCall, ShoppingCart } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { cartApi, conversationsApi, productsApi, reviewsApi } from '../api/modules.js'
import { EmptyState, SectionCard, SectionHeading } from '../components/layout/AppLayout.jsx'
import { MoroccoMap } from '../components/maps/MoroccoMap.jsx'
import { useAuthStore } from '../state/authStore.js'
import { useFavoritesStore } from '../state/favoritesStore.js'

export function ProductDetailsPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isFavorite = useFavoritesStore((state) => state.isFavorite)
  const toggleFavorite = useFavoritesStore((state) => state.toggle)
  const [product, setProduct] = useState(null)
  const [message, setMessage] = useState('')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    productsApi.details(productId).then(setProduct).catch((error) => setMessage(error.message))
  }, [productId])

  if (!product) {
    return <div className="soft-panel p-6 text-slate-500">Loading product details...</div>
  }

  const openChat = async () => {
    if (!user) {
      navigate('/auth')
      return
    }

    const result = await conversationsApi.open({ participant_id: product.vendor.id, kind: 'direct' })
    navigate(`/chat?conversation=${result.conversation.id}`)
  }

  const submitReview = async (event) => {
    event.preventDefault()
    const response = await reviewsApi.create({
      type: 'product',
      id: product.id,
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment,
    })
    setProduct((current) => ({ ...current, reviews: [response.review, ...(current.reviews ?? [])] }))
    setReviewForm({ rating: 5, comment: '' })
  }

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Product details" title={product.title} description={product.description} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {(product.images?.length ? product.images : [{ url: null }]).map((image, index) => (
              <div key={image?.id ?? index} className="overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-50 via-sky-50 to-white">
                {image?.url ? (
                  <img src={image.url} alt={product.title} className="h-72 w-full object-cover" />
                ) : (
                  <div className="flex h-72 items-center justify-center text-slate-400">Product gallery</div>
                )}
              </div>
            ))}
          </div>

          <SectionCard>
            <div className="grid gap-4 md:grid-cols-4">
              <Metric label="Brand" value={product.brand} />
              <Metric label="Speciality" value={product.speciality} />
              <Metric label="Stock" value={`${product.stock} units`} />
              <Metric label="Price" value={`${product.price} MAD`} />
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="text-xl font-bold">Vendor</h3>
            <p className="mt-3 text-sm text-slate-600">{product.vendor?.display_name} | {product.city}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={openChat} className="button-secondary">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat vendor
              </button>
              {product.vendor?.phone && (
                <a href={`tel:${product.vendor.phone}`} className="button-secondary">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Call
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate('/auth')
                    return
                  }

                  toggleFavorite('provider', product.vendor.id)
                }}
                className={`button-secondary ${isFavorite('provider', product.vendor.id) ? 'bg-blue-700 text-white hover:bg-blue-800' : ''}`}
              >
                <Heart className={`mr-2 h-4 w-4 ${isFavorite('provider', product.vendor.id) ? 'fill-current' : ''}`} />
                Save vendor
              </button>
            </div>
          </SectionCard>

          <SectionCard>
            <h3 className="text-xl font-bold">Reviews</h3>
            <div className="mt-4 space-y-4">
              {(product.reviews ?? []).length ? (
                product.reviews.map((review) => (
                  <div key={review.id} className="rounded-[20px] border border-blue-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{review.author?.display_name ?? review.author?.name}</p>
                      <span className="text-sm text-amber-600">{review.rating} / 5</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="No reviews yet" description="This product will show customer reviews as orders complete." />
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
            <h3 className="text-xl font-bold">Buy this product</h3>
            <p className="mt-2 text-sm text-slate-600">Add it to your cart and complete checkout with cash on delivery or Stripe test mode.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate('/auth')
                    return
                  }

                  cartApi.add({ product_id: product.id, quantity: 1 }).then(() => setMessage('Added to cart successfully.'))
                }}
                className="button-primary"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to cart
              </button>
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
            </div>
            {message && <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</p>}
          </SectionCard>

          <SectionCard>
            <h3 className="mb-4 text-xl font-bold">Location</h3>
            <MoroccoMap markers={[product]} height={320} linkPrefix="/products" />
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
