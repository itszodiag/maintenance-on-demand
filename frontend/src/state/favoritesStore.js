import { create } from 'zustand'
import { favoritesApi } from '../api/modules.js'

let hydratedForUserId = null

function toIdMap(items = []) {
  return Object.fromEntries(items.map((item) => [item.id, true]))
}

export const useFavoritesStore = create((set, get) => ({
  serviceIds: {},
  productIds: {},
  providerIds: {},
  loading: false,
  hydrate: async (userId) => {
    if (!userId) {
      set({ serviceIds: {}, productIds: {}, providerIds: {}, loading: false })
      hydratedForUserId = null
      return
    }

    if (hydratedForUserId === userId) {
      return
    }

    set({ loading: true })

    try {
      const data = await favoritesApi.list()
      hydratedForUserId = userId
      set({
        serviceIds: toIdMap(data.services ?? []),
        productIds: toIdMap(data.products ?? []),
        providerIds: toIdMap(data.providers ?? []),
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },
  reset: () => {
    hydratedForUserId = null
    set({ serviceIds: {}, productIds: {}, providerIds: {}, loading: false })
  },
  isFavorite: (type, id) => {
    const state = get()
    const maps = {
      service: state.serviceIds,
      product: state.productIds,
      provider: state.providerIds,
    }

    return Boolean(maps[type]?.[id])
  },
  toggle: async (type, id) => {
    const response = await favoritesApi.toggle({ type, id })

    set((state) => {
      const key = type === 'service' ? 'serviceIds' : type === 'product' ? 'productIds' : 'providerIds'
      const next = { ...state[key] }

      if (response.saved) {
        next[id] = true
      } else {
        delete next[id]
      }

      return {
        [key]: next,
      }
    })

    return response
  },
}))
