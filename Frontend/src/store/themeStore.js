import { create } from 'zustand'

const STORAGE_KEY = 'tourmate-theme'

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const isDark = theme === 'dark'

  root.classList.toggle('dark', isDark)
  root.dataset.theme = theme
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'white'

  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'white'
}

export const useThemeStore = create((set, get) => ({
  theme: 'white',
  isReady: false,

  init: () => {
    if (get().isReady) return

    const theme = getStoredTheme()
    applyTheme(theme)
    set({ theme, isReady: true })
  },

  setTheme: (theme) => {
    const normalizedTheme = theme === 'dark' ? 'dark' : 'white'
    localStorage.setItem(STORAGE_KEY, normalizedTheme)
    applyTheme(normalizedTheme)
    set({ theme: normalizedTheme })
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'white' : 'dark'
    get().setTheme(nextTheme)
  }
}))