import { useEffect } from 'react'
import dayjs from 'dayjs'
import { SectionCard, SectionHeading } from '../components/layout/AppLayout.jsx'
import { useNotificationPolling } from '../state/notificationStore.js'

export function NotificationsPage() {
  const items = useNotificationPolling((state) => state.items)
  const fetchNotifications = useNotificationPolling((state) => state.fetch)
  const markAllRead = useNotificationPolling((state) => state.markAllRead)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Notifications"
        title="Stay on top of messages, requests, and order updates"
        description="Notifications are powered by database alerts and realtime broadcasting."
        action={<button type="button" onClick={markAllRead} className="button-secondary">Mark all read</button>}
      />

      <div className="space-y-4">
        {items.map((item) => (
          <SectionCard key={item.id} className={item.read_at ? '' : 'border-blue-300 bg-blue-50/50'}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-blue-700">{item.type}</p>
                <p className="mt-2 font-semibold text-slate-900">{item.data.title ?? 'New activity'}</p>
                <p className="mt-2 text-sm text-slate-600">{item.data.message ?? item.data.body ?? 'You have a new platform notification.'}</p>
              </div>
              <p className="text-sm text-slate-400">{dayjs(item.created_at).format('MMM D, HH:mm')}</p>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}
