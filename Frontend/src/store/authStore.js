import { create } from 'zustand'
import { disconnectSocket } from '../utils/socket'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem('tourmate-auth', JSON.stringify({ state: { user, token, isAuthenticated: true } }))
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('tourmate-auth')
    disconnectSocket()
    set({ user: null, token: null, isAuthenticated: false })
  },

  updateUser: (userData) =>
    set((state) => {
      const updatedUser = { ...state.user, ...userData }
      localStorage.setItem('tourmate-auth', JSON.stringify({ state: { user: updatedUser, token: state.token, isAuthenticated: true } }))
      return { user: updatedUser }
    }),

  // Initialize from localStorage
  init: () => {
    try {
      const stored = localStorage.getItem('tourmate-auth')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.state) {
          set(data.state)
        }
      }
    } catch (error) {
      console.error('Failed to load auth state:', error)
    }
  }
}))
