import { apiClient, setAuthToken, removeAuthToken } from '@/lib/axios'
import type { LoginCredentials, RegisterData, AuthResponse } from '@/types'

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials)
    // Limpiar cualquier storage anterior antes de guardar el nuevo token
    localStorage.removeItem('trazio-auth-storage')
    setAuthToken(data.access_token)
    return data
  },

  // Register
  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', registerData)
    // Limpiar cualquier storage anterior antes de guardar el nuevo token
    localStorage.removeItem('trazio-auth-storage')
    setAuthToken(data.access_token)
    return data
  },

  // Logout
  logout: () => {
    removeAuthToken()
    // Limpiar cualquier storage de auth
    localStorage.removeItem('trazio-auth-storage')
  },

  // Get current user (usando el token) - SIEMPRE del backend
  getCurrentUser: async () => {
    const { data } = await apiClient.get('/auth/me')
    return data
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return data
  },
}
