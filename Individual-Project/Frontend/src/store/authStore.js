import { create } from 'zustand'
import { disconnectSocket } from '../utils/socket'

const getStoredAuthState = () => {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem('tourmate-auth')
    if (!stored) return null

    const data = JSON.parse(stored)
    if (data?.state) {
      return {
        user: data.state.user || null,
        token: data.state.token || null,
        isAuthenticated: !!data.state.isAuthenticated,
        isAuthReady: true
      }
    }
  } catch (error) {
    console.error('Failed to load auth state:', error)
  }

  return { user: null, token: null, isAuthenticated: false, isAuthReady: true }
}

const initialAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isAuthReady: false,
  ...getStoredAuthState()
}

export const useAuthStore = create((set, get) => ({
  ...initialAuthState,

  setAuth: (user, token) => {
    localStorage.setItem('tourmate-auth', JSON.stringify({ state: { user, token, isAuthenticated: true } }))
    set({ user, token, isAuthenticated: true, isAuthReady: true })
  },

  logout: () => {
    localStorage.removeItem('tourmate-auth')
    disconnectSocket()
    set({ user: null, token: null, isAuthenticated: false, isAuthReady: true })
  },

  updateUser: (userData) =>
    set((state) => {
      const updatedUser = { ...state.user, ...userData }
      localStorage.setItem('tourmate-auth', JSON.stringify({ state: { user: updatedUser, token: state.token, isAuthenticated: true } }))
      return { user: updatedUser }
    }),

  init: () => {
    if (get().isAuthReady) return

    try {
      const stored = localStorage.getItem('tourmate-auth')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.state) {
          set({ ...data.state, isAuthReady: true })
          return
        }
      }
    } catch (error) {
      console.error('Failed to load auth state:', error)
    }

    set({ isAuthReady: true })
  }
}))
