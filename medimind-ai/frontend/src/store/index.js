import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Theme Store ──────────────────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
      },
      initTheme: () => {
        const t = get().theme
        document.documentElement.classList.toggle('dark', t === 'dark')
      },
    }),
    { name: 'medimind-theme' }
  )
)

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: 'medimind-auth' }
  )
)
