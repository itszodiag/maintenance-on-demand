import { create } from 'zustand'
import { authApi, profileApi } from '../api/modules.js'
import { resetEcho } from '../lib/reverb.js'

const tokenKey = 'maintenance_on_demand_token'
const userKey = 'maintenance_on_demand_user'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  initialized: false,
  loading: false,
  error: null,
  hydrate: async () => {
    const token = localStorage.getItem(tokenKey)
    const cachedUser = localStorage.getItem(userKey)

    if (!token) {
      set({ initialized: true })
      return
    }

    set({
      token,
      user: cachedUser ? JSON.parse(cachedUser) : null,
      loading: true,
    })

    try {
      const user = await authApi.me()
      set({
        user,
        token,
        loading: false,
        initialized: true,
      })
      localStorage.setItem(userKey, JSON.stringify(user))
      await profileApi.presence(true).catch(() => undefined)
    } catch {
      localStorage.removeItem(tokenKey)
      localStorage.removeItem(userKey)
      resetEcho()
      set({
        user: null,
        token: null,
        loading: false,
        initialized: true,
      })
    }
  },
  setSession: ({ token, user }) => {
    localStorage.setItem(tokenKey, token)
    localStorage.setItem(userKey, JSON.stringify(user))
    set({ token, user, initialized: true, error: null })
  },
  login: async (payload) => {
    set({ loading: true, error: null })

    try {
      const data = await authApi.login(payload)
      get().setSession(data)
      await profileApi.presence(true).catch(() => undefined)
      set({ loading: false })
      return data
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },
  register: async (payload) => {
    set({ loading: true, error: null })

    try {
      const data = await authApi.register(payload)
      get().setSession(data)
      await profileApi.presence(true).catch(() => undefined)
      set({ loading: false })
      return data
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },
  logout: async () => {
    try {
      await profileApi.presence(false)
      await authApi.logout()
    } catch {
      // Ignore logout network issues and clear local session regardless.
    }

    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userKey)
    resetEcho()
    set({ user: null, token: null, initialized: true })
  },
}))
