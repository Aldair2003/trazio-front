import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const JWT_STORAGE_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || 'trazio_token'

// Crear instancia de axios
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para agregar el token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(JWT_STORAGE_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem(JWT_STORAGE_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Helper para guardar token
export const setAuthToken = (token: string) => {
  localStorage.setItem(JWT_STORAGE_KEY, token)
}

// Helper para obtener token
export const getAuthToken = () => {
  return localStorage.getItem(JWT_STORAGE_KEY)
}

// Helper para remover token
export const removeAuthToken = () => {
  localStorage.removeItem(JWT_STORAGE_KEY)
}

// Helper para verificar si hay token
export const hasAuthToken = () => {
  return !!getAuthToken()
}
