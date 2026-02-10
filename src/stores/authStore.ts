import { create } from 'zustand'
import type { User } from '@/types'
import { removeAuthToken } from '@/lib/axios'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean // Indica si ya se verificó con el backend
  setUser: (user: User | null) => void
  setInitialized: () => void
  logout: () => void
}

// NO usamos persist - el estado del usuario viene SIEMPRE del backend
// Solo el token JWT se guarda en localStorage
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false, // Empieza como NO inicializado
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isInitialized: true, // Ya se verificó
    }),
  setInitialized: () => set({ isInitialized: true }),
  logout: () => {
    // Limpiar token del localStorage
    removeAuthToken()
    // Limpiar cualquier otro storage que pueda existir
    localStorage.removeItem('trazio-auth-storage')
    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true, // Sigue inicializado
    })
  },
}))
