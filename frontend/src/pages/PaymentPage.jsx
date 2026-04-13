import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Banknote, CreditCard, ExternalLink } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { paymentsApi } from '../api/modules.js'
import { SectionCard, SectionHeading, StatusBadge } from '../components/layout/AppLayout.jsx'

export function PaymentPage() {
  const { paymentType, paymentId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [details, setDetails] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true)

      try {
        const data = await paymentsApi.details(paymentType, paymentId)
        setDetails(data)
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadDetails()
  }, [paymentId, paymentType])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      if (searchParams.get('cancelled')) {
        setMessage('Stripe checkout was cancelled. You can choose another payment method.')
      }

      return
    }

    setProcessing(true)
    paymentsApi
      .stripeConfirm(paymentType, paymentId, { session_id: sessionId })
      .then((response) => {
        setDetails((current) => current ? { ...current, item: response.item } : current)
        setMessage(response.message)
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setProcessing(false))
  }, [paymentId, paymentType, searchParams])

  const preferredTypeLabel = useMemo(
    () => (paymentType === 'order' ? 'Marketplace order' : 'Service request'),
    [paymentType],
  )

  const startCashPayment = async () => {
    setProcessing(true)

    try {
      const response = await paymentsApi.cash(paymentType, paymentId)
      setDetails((current) => current ? { ...current, item: response.item } : current)
      setMessage(response.message)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const startStripePayment = async () => {
    setProcessing(true)

    try {
      const currentUrl = `${window.location.origin}/payments/${paymentType}/${paymentId}`
      const response = await paymentsApi.stripeSession(paymentType, paymentId, {
        success_url: `${currentUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${currentUrl}?cancelled=1`,
      })

      window.location.href = response.checkout_url
    } catch (error) {
      setMessage(error.message)
      setProcessing(false)
    }
  }

  if (loading || !details) {
    return <div className="soft-panel p-6 text-slate-500">Loading payment details...</div>
  }

  const item = details.item
  const isPaid = item.payment_status === 'paid'

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Payment"
        title={details.title}
        description={`Complete payment for this ${preferredTypeLabel.toLowerCase()} and keep the workflow moving.`}
        action={(
          <button type="button" onClick={() => navigate(-1)} className="button-secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        )}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <SectionCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-blue-700">{preferredTypeLabel}</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">{details.title}</h3>
            </div>
            <StatusBadge status={item.payment_status === 'paid' ? 'paid' : item.status} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Summary label="Amount" value={`${details.amount} MAD`} />
            <Summary label="Payment status" value={item.payment_status} />
            <Summary label="City" value={item.city} />
            <Summary label="Method" value={item.payment_method ?? 'Not selected yet'} />
          </div>

          {paymentType === 'order' ? (
            <div className="mt-6 space-y-3">
              <h4 className="text-lg font-bold">Order items</h4>
              {item.items?.map((entry) => (
                <div key={entry.id} className="rounded-[20px] border border-blue-100 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{entry.title}</p>
                      <p className="text-sm text-slate-500">{entry.quantity} x {entry.unit_price} MAD</p>
                    </div>
                    <p className="font-bold text-blue-800">{entry.line_total} MAD</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[24px] border border-blue-100 bg-blue-50/40 p-5">
              <p className="font-semibold text-slate-900">{item.address}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description || details.description}</p>
            </div>
          )}

          {message && <p className="mt-6 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</p>}
        </SectionCard>

        <SectionCard>
          <h3 className="text-xl font-bold">Choose payment method</h3>
          <p className="mt-2 text-sm text-slate-600">Cash keeps the item pending until completion. Stripe test mode marks it as paid after successful checkout.</p>

          <div className="mt-6 space-y-4">
            <button
              type="button"
              disabled={processing || isPaid}
              onClick={startCashPayment}
              className="flex w-full items-start justify-between rounded-[24px] border border-blue-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Cash on delivery</p>
                  <p className="mt-1 text-sm text-slate-600">Confirm the booking or order and pay in cash when the service or delivery is completed.</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-blue-700">{item.payment_method === 'cash' ? 'Selected' : 'Choose'}</span>
            </button>

            <button
              type="button"
              disabled={processing || isPaid}
              onClick={startStripePayment}
              className="flex w-full items-start justify-between rounded-[24px] border border-blue-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Stripe test mode</p>
                  <p className="mt-1 text-sm text-slate-600">Create a secure Stripe Checkout session and return here after the test payment succeeds.</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                {item.payment_method === 'stripe' ? 'Continue' : 'Open'}
                <ExternalLink className="h-4 w-4" />
              </span>
            </button>
          </div>

          {isPaid && (
            <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
              <p className="font-semibold text-emerald-800">Payment completed</p>
              <p className="mt-2 text-sm text-emerald-700">Everything is confirmed. You can return to your profile or dashboard to keep tracking progress.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/profile" className="button-secondary">Open profile</Link>
                <Link to="/chat" className="button-primary">Open chat</Link>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

function Summary({ label, value }) {
  return (
    <div className="rounded-[20px] bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 font-bold text-slate-900 capitalize">{value}</p>
    </div>
  )
}
