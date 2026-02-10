import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import AuthPage from '@/pages/auth/AuthPage'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <AuthPage />
}
