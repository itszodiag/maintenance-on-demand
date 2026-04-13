import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cartApi } from '../api/modules.js'
import { EmptyState, SectionCard, SectionHeading } from '../components/layout/AppLayout.jsx'

export function CartPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [checkoutForm, setCheckoutForm] = useState({
    payment_method: 'cash',
    shipping_address: '',
    city: 'Casablanca',
    phone: '',
    notes: '',
  })
  const [message, setMessage] = useState('')

  const loadCart = () => cartApi.list().then((data) => setItems(data))

  useEffect(() => {
    loadCart().catch((error) => setMessage(error.message))
  }, [])

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.subtotal), 0), [items])

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return
    await cartApi.update(item.id, quantity)
    loadCart()
  }

  const checkout = async (event) => {
    event.preventDefault()
    const response = await cartApi.checkout(checkoutForm)
    const order = response.orders?.[0]

    if (order) {
      navigate(`/payments/order/${order.id}`)
      return
    }

    setMessage(response.message)
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Cart and checkout" title="Review products and place your order" description="Cash and Stripe test payments are both supported in the full checkout flow." />

      {!items.length ? (
        <EmptyState title="Your cart is empty" description="Browse the marketplace and add products to start checkout." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr,420px]">
          <div className="space-y-4">
            {items.map((item) => (
              <SectionCard key={item.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-bold">{item.product.title}</h3>
                  <p className="text-sm text-slate-500">{item.product.brand} | {item.product.city}</p>
                  <p className="mt-3 text-sm font-semibold text-blue-700">{item.product.price} MAD each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)} className="button-secondary">
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 font-bold">{item.quantity}</div>
                  <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)} className="button-secondary">
                    <Plus className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => cartApi.remove(item.id).then(loadCart)} className="button-secondary">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </SectionCard>
            ))}
          </div>

          <SectionCard>
            <h3 className="text-xl font-bold">Checkout</h3>
            <p className="mt-2 text-sm text-slate-500">Subtotal: {total.toFixed(2)} MAD</p>
            <form onSubmit={checkout} className="mt-5 space-y-4">
              <input className="field" placeholder="Shipping address" value={checkoutForm.shipping_address} onChange={(event) => setCheckoutForm((current) => ({ ...current, shipping_address: event.target.value }))} required />
              <input className="field" placeholder="City" value={checkoutForm.city} onChange={(event) => setCheckoutForm((current) => ({ ...current, city: event.target.value }))} required />
              <input className="field" placeholder="Phone" value={checkoutForm.phone} onChange={(event) => setCheckoutForm((current) => ({ ...current, phone: event.target.value }))} required />
              <textarea className="field" rows="3" placeholder="Notes" value={checkoutForm.notes} onChange={(event) => setCheckoutForm((current) => ({ ...current, notes: event.target.value }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="soft-panel flex cursor-pointer items-center gap-3 p-4">
                  <input type="radio" name="payment_method" checked={checkoutForm.payment_method === 'cash'} onChange={() => setCheckoutForm((current) => ({ ...current, payment_method: 'cash' }))} />
                  <span>
                    <p className="font-semibold">Cash</p>
                    <p className="text-sm text-slate-500">Pay on delivery</p>
                  </span>
                </label>
                <label className="soft-panel flex cursor-pointer items-center gap-3 p-4">
                  <input type="radio" name="payment_method" checked={checkoutForm.payment_method === 'stripe'} onChange={() => setCheckoutForm((current) => ({ ...current, payment_method: 'stripe' }))} />
                  <span>
                    <p className="font-semibold">Stripe test mode</p>
                    <p className="text-sm text-slate-500">Redirect to Stripe Checkout and confirm payment</p>
                  </span>
                </label>
              </div>
              <button type="submit" className="button-primary w-full">Place order</button>
            </form>
            {message && <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</p>}
          </SectionCard>
        </div>
      )}
    </div>
  )
}
