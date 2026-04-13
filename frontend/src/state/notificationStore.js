import { create } from 'zustand'
import { notificationsApi } from '../api/modules.js'

let poller

export const useNotificationPolling = create((set) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  fetch: async () => {
    set({ loading: true })

    try {
      const data = await notificationsApi.list()
      set({
        items: data.items ?? [],
        unreadCount: data.unread_count ?? 0,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },
  markAllRead: async () => {
    await notificationsApi.markAllRead()
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })),
      unreadCount: 0,
    }))
  },
  start: async () => {
    clearInterval(poller)
    await useNotificationPolling.getState().fetch()
    poller = setInterval(() => useNotificationPolling.getState().fetch(), 15000)
  },
  stop: () => {
    clearInterval(poller)
    set({ items: [], unreadCount: 0 })
  },
}))
