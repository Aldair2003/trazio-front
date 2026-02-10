import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useRef } from 'react'
import { authService } from '@/services/authService'
import { hasAuthToken } from '@/lib/axios'
import { Loader2 } from 'lucide-react'

// Pages
import HomePage from '@/pages/HomePage'
import FeedPage from '@/pages/FeedPage'
import ProfilePage from '@/pages/ProfilePage'
import SubjectDetailPage from '@/pages/SubjectDetailPage'
import SubjectsPage from '@/pages/SubjectsPage'
import ExamsPage from '@/pages/ExamsPage'
import AssignmentsPage from '@/pages/AssignmentsPage'
import ProjectsPage from '@/pages/ProjectsPage'
import OnboardingPageV2 from '@/pages/OnboardingPageV2'
import SettingsPage from '@/pages/SettingsPage'
import MisMateriasPage from '@/pages/MisMateriasPage'
// import RecursosPage from '@/pages/RecursosPage'
import MisClasesPage from '@/pages/MisClasesPage'

// Layout
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-full shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
        <p className="text-sm text-muted-foreground">Cargando TRAZIO...</p>
      </div>
    </div>
  )
}

// Componente que decide a dónde redirigir basado en el estado ACTUAL del usuario
function AuthenticatedRedirect({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const location = useLocation()

  // Debug
  console.log('AuthenticatedRedirect:', { 
    isInitialized, 
    isAuthenticated, 
    user: user ? { id: user.id, profileCompleted: user.profileCompleted } : null,
    path: location.pathname 
  })

  // Mientras no se haya verificado con el backend, mostrar loading
  if (!isInitialized) {
    return <LoadingScreen />
  }

  // Usuario no autenticado
  if (!isAuthenticated || !user) {
    // Si está en login/register, mostrar esas páginas
    if (location.pathname === '/login' || location.pathname === '/register') {
      return <>{children}</>
    }
    // Cualquier otra ruta, redirigir a login
    return <Navigate to="/login" replace />
  }

  // Usuario autenticado - verificar profileCompleted
  const hasCompletedProfile = user.profileCompleted === true

  // Si está en /login o /register y ya está autenticado, redirigir
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <Navigate to={hasCompletedProfile ? '/feed' : '/onboarding'} replace />
  }

  // Si está en /onboarding
  if (location.pathname === '/onboarding') {
    // Si ya completó perfil, ir al feed
    if (hasCompletedProfile) {
      console.log('Usuario ya completó perfil, redirigiendo a /feed')
      return <Navigate to="/feed" replace />
    }
    // Si no ha completado, mostrar onboarding
    return <>{children}</>
  }

  // Cualquier otra ruta protegida
  if (!hasCompletedProfile) {
    console.log('Usuario no ha completado perfil, redirigiendo a /onboarding')
    return <Navigate to="/onboarding" replace />
  }

  // Usuario autenticado con perfil completo, mostrar contenido
  return <>{children}</>
}

function App() {
  const { setUser, logout, isInitialized } = useAuthStore()
  const initRef = useRef(false)

  // Inicializar auth UNA SOLA VEZ
  useEffect(() => {
    // Prevenir doble ejecución en StrictMode
    if (initRef.current) return
    initRef.current = true

    const initializeAuth = async () => {
      console.log('Inicializando auth...')
      
      if (hasAuthToken()) {
        try {
          const userData = await authService.getCurrentUser()
          console.log('Usuario del backend:', userData)
          console.log('profileCompleted:', userData.profileCompleted, typeof userData.profileCompleted)
          setUser(userData)
        } catch (error) {
          console.error('Error al verificar usuario:', error)
          logout()
        }
      } else {
        console.log('No hay token, estableciendo como no autenticado')
        setUser(null)
      }
    }

    initializeAuth()
  }, [setUser, logout]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return <LoadingScreen />
  }

  return (
    <>
      <Routes>
        {/* Auth - login y register */}
        <Route path="/login" element={
          <AuthenticatedRedirect>
            <AuthLayout />
          </AuthenticatedRedirect>
        } />
        <Route path="/register" element={
          <AuthenticatedRedirect>
            <AuthLayout />
          </AuthenticatedRedirect>
        } />

        {/* Onboarding */}
        <Route path="/onboarding" element={
          <AuthenticatedRedirect>
            <OnboardingPageV2 />
          </AuthenticatedRedirect>
        } />

        {/* Rutas protegidas con MainLayout */}
        <Route element={
          <AuthenticatedRedirect>
            <MainLayout />
          </AuthenticatedRedirect>
        }>
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:subjectId" element={<SubjectDetailPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Rutas para estudiantes */}
          <Route path="/mis-materias" element={<MisMateriasPage />} />
          {/* <Route path="/recursos" element={<RecursosPage />} /> */}
          
          {/* Rutas para docentes */}
          <Route path="/mis-clases" element={<MisClasesPage />} />
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </>
  )
}

export default App
