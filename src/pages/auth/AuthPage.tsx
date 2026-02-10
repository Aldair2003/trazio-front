import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  BookOpen,
  GraduationCap,
  Users,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Target,
  Zap,
  Heart,
  Star,
  Award,
  Calculator,
  Pencil,
  Lightbulb,
  Trophy,
  Rocket,
  Brain,
} from 'lucide-react'

/* ========== SCHEMAS ========== */
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = z
  .object({
    name: z.string().min(3, 'Mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'No coinciden',
    path: ['confirmPassword'],
  })

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>

/* ========== ELEMENTOS ACADÉMICOS FLOTANTES ========== */
const academicElements: Array<{
  Icon: React.ComponentType<{ className?: string }>
  delay: number
  duration: number
  x: string
  y: string
  animation: string
}> = [
  { Icon: BookOpen, delay: 0, duration: 8, x: '15%', y: '15%', animation: 'float-rotate' },
  { Icon: GraduationCap, delay: 2, duration: 10, x: '80%', y: '25%', animation: 'wave' },
  { Icon: Calculator, delay: 1, duration: 9, x: '20%', y: '75%', animation: 'float-rotate' },
  { Icon: Pencil, delay: 3, duration: 7, x: '75%', y: '70%', animation: 'wave' },
  { Icon: Lightbulb, delay: 1.5, duration: 8.5, x: '10%', y: '45%', animation: 'pulse-scale' },
  { Icon: Trophy, delay: 2.5, duration: 9.5, x: '85%', y: '50%', animation: 'float-rotate' },
  { Icon: Brain, delay: 0.5, duration: 10.5, x: '25%', y: '30%', animation: 'pulse-scale' },
  { Icon: Rocket, delay: 3.5, duration: 8, x: '70%', y: '85%', animation: 'wave' },
]

/* ========== PARTÍCULAS BRILLANTES ========== */
const sparkleParticles: Array<{
  Icon: React.ComponentType<{ className?: string }>
  delay: number
  duration: number
  x: string
  y: string
  size: string
}> = [
  { Icon: Sparkles, delay: 0, duration: 3, x: '10%', y: '10%', size: '12px' },
  { Icon: Star, delay: 1, duration: 4, x: '90%', y: '20%', size: '10px' },
  { Icon: Zap, delay: 0.5, duration: 3.5, x: '5%', y: '60%', size: '14px' },
  { Icon: Heart, delay: 1.5, duration: 4.5, x: '95%', y: '80%', size: '11px' },
  { Icon: Target, delay: 2, duration: 3, x: '50%', y: '5%', size: '13px' },
  { Icon: Award, delay: 0.8, duration: 3.8, x: '30%', y: '90%', size: '12px' },
]

/* ========== NODOS DE RED (conexiones entre estudiantes) ========== */
const networkNodes = [
  { x: 20, y: 30, size: 8, delay: 0 },
  { x: 40, y: 20, size: 10, delay: 0.3 },
  { x: 60, y: 35, size: 9, delay: 0.6 },
  { x: 75, y: 25, size: 11, delay: 0.9 },
  { x: 85, y: 40, size: 8, delay: 1.2 },
  { x: 30, y: 60, size: 10, delay: 0.4 },
  { x: 50, y: 70, size: 9, delay: 0.7 },
  { x: 70, y: 65, size: 12, delay: 1 },
]

/* ========== CÓMO FUNCIONA TRAZIO ========== */
const howItWorksSteps = [
  {
    icon: Pencil,
    title: 'Documenta',
    description: 'Registra tus experiencias académicas',
    color: 'from-blue-400 to-blue-600',
  },
  {
    icon: Users,
    title: 'Comparte',
    description: 'Conecta con tu comunidad',
    color: 'from-indigo-400 to-purple-600',
  },
  {
    icon: TrendingUp,
    title: 'Crece',
    description: 'Mejora cada semestre',
    color: 'from-purple-400 to-pink-600',
  },
]


/* ========== MAIN COMPONENT ========== */
export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { setUser } = useAuthStore()


  /* -- Login form -- */
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  /* -- Register form -- */
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  })

  /* -- Mutations -- */
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user)
      toast({ title: `¡Hola, ${data.user.name}!` })
      // Redirigir según si completó el perfil o no
      if (data.user.profileCompleted) {
        navigate('/feed')
      } else {
        navigate('/onboarding')
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast({
        variant: 'destructive',
        title: 'Credenciales inválidas',
        description: err.response?.data?.message || 'Verifica tu email y contraseña',
      })
    },
    onSettled: () => setIsLoading(false),
  })

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setUser(data.user)
      toast({ title: '¡Bienvenido a TRAZIO!' })
      // Después del registro, siempre ir al onboarding
      navigate('/onboarding')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast({
        variant: 'destructive',
        title: 'No se pudo crear la cuenta',
        description: err.response?.data?.message || 'Intenta con otro email',
      })
    },
    onSettled: () => setIsLoading(false),
  })

  const onLogin = (data: LoginData) => {
    setIsLoading(true)
    loginMutation.mutate(data)
  }

  const onRegister = (data: RegisterData) => {
    setIsLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = data
    registerMutation.mutate(rest)
  }

  const switchMode = (newMode: 'login' | 'register') => {
    if (newMode === mode) return
    setShowPwd(false)
    setShowConfirmPwd(false)
    setMode(newMode)
  }

  const isRegister = mode === 'register'

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-50">
      {/* =============================================
          PANEL IZQUIERDO - INTERACTIVO Y ANIMADO
          ============================================= */}
      <div className="relative hidden lg:flex lg:w-[48%] bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
        {/* Gradiente animado de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/30 via-transparent to-purple-600/30 animate-gradient opacity-70" />

        {/* Blobs grandes pulsantes */}
        <div className="absolute -top-20 -left-20 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute -bottom-20 -right-20 w-[35rem] h-[35rem] bg-purple-400/15 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25rem] h-[25rem] bg-indigo-400/10 rounded-full blur-[90px] animate-blob animation-delay-4000" />

        {/* SVG: Red de conexiones (nodos conectados) */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
          </defs>
          {/* Líneas conectando nodos */}
          <line x1="20%" y1="30%" x2="40%" y2="20%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-dash" />
          <line x1="40%" y1="20%" x2="60%" y2="35%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-dash animation-delay-1000" />
          <line x1="60%" y1="35%" x2="75%" y2="25%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-dash animation-delay-2000" />
          <line x1="75%" y1="25%" x2="85%" y2="40%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-dash animation-delay-500" />
          <line x1="20%" y1="30%" x2="30%" y2="60%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-dash animation-delay-1500" />
          <line x1="30%" y1="60%" x2="50%" y2="70%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-dash animation-delay-3000" />
          <line x1="50%" y1="70%" x2="70%" y2="65%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-dash animation-delay-2500" />
          <line x1="60%" y1="35%" x2="50%" y2="70%" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="5,5" className="animate-dash animation-delay-1000" />
        </svg>

        {/* Nodos de red (representan estudiantes conectados) */}
        {networkNodes.map((node, idx) => (
          <div
            key={`node-${idx}`}
            className="absolute rounded-full bg-white/40 backdrop-blur-sm border border-white/50 animate-pulse-scale"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              animationDelay: `${node.delay}s`,
              animationDuration: '3s',
            }}
          />
        ))}

        {/* Elementos académicos flotantes con animaciones variadas */}
        {academicElements.map((elem, idx) => (
          <div
            key={`academic-${idx}`}
            className={`absolute opacity-25`}
            style={{
              left: elem.x,
              top: elem.y,
              animation: `${elem.animation} ${elem.duration}s ease-in-out infinite`,
              animationDelay: `${elem.delay}s`,
            }}
          >
            <elem.Icon className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        ))}

        {/* Partículas brillantes pequeñas */}
        {sparkleParticles.map((particle, idx) => (
          <div
            key={`sparkle-${idx}`}
            className="absolute animate-pulse-scale opacity-50"
            style={{
              left: particle.x,
              top: particle.y,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              width: particle.size,
              height: particle.size,
            }}
          >
            <particle.Icon className="w-full h-full text-yellow-200 drop-shadow-glow" />
          </div>
        ))}

        {/* Partículas flotantes de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full bg-white/20"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${10 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Grid patrón de fondo */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Contenido principal con z-index alto */}
        <div className="relative z-20 flex flex-col justify-between py-8 px-8 xl:px-12 w-full h-full min-h-0">
          {/* Header: Logo y título */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 group cursor-pointer">
              <div className="relative p-2.5 bg-white/15 rounded-2xl backdrop-blur-md border border-white/30 group-hover:bg-white/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl">
                <BookOpen className="h-7 w-7 text-white drop-shadow-lg" />
                <div className="absolute -inset-1 bg-white/20 rounded-2xl blur-md -z-10 group-hover:bg-white/30 transition-all" />
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
                TRAZIO
              </h1>
            </div>

            <p className="text-lg text-blue-50/90 max-w-md leading-relaxed drop-shadow-lg">
              Plataforma colaborativa para tu trayectoria universitaria
            </p>

            {/* Feature cards compactas */}
            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <InteractiveCard
                icon={<GraduationCap className="h-5 w-5" />}
                title="Trayectoria"
                bgColor="bg-blue-500/20"
              />
              <InteractiveCard
                icon={<Users className="h-5 w-5" />}
                title="Comunidad"
                bgColor="bg-indigo-500/20"
              />
              <InteractiveCard
                icon={<TrendingUp className="h-5 w-5" />}
                title="Progreso"
                bgColor="bg-purple-500/20"
              />
              <InteractiveCard
                icon={<MessageCircle className="h-5 w-5" />}
                title="Colaboración"
                bgColor="bg-pink-500/20"
              />
            </div>
          </div>

          {/* Footer: Cómo funciona */}
          <div className="space-y-4">
            {/* Título animado */}
            <div className="text-center">
              <h3 className="text-base font-bold text-white/90 drop-shadow-md uppercase tracking-wider">
                Cómo funciona
              </h3>
              <div className="h-0.5 w-16 mx-auto mt-2 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full" />
            </div>

            {/* Timeline de pasos */}
            <div className="relative space-y-3.5 py-2">
              {/* Línea conectora vertical */}
              <div className="absolute left-[20px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-400/40 via-purple-400/40 to-pink-400/40" />
              
              {howItWorksSteps.map((step, index) => (
                <div
                  key={index}
                  className="relative flex items-start gap-3.5 group"
                  style={{
                    animation: `fadeInLeft 0.6s ease-out ${index * 0.15}s both`,
                  }}
                >
                  {/* Icono circular con número */}
                  <div className="relative shrink-0 z-10">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${step.color} shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <step.icon className="w-4 h-4 text-white" />
                    </div>
                    {/* Número pequeño en la esquina */}
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[9px] font-bold text-blue-600 shadow-md">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1 pt-0.5">
                    <h4 className="text-white font-bold text-sm mb-0.5 group-hover:translate-x-1 transition-transform">
                      {step.title}
                    </h4>
                    <p className="text-blue-100/70 text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Flechita decorativa */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                    <ArrowRight className="w-3.5 h-3.5 text-white/60" />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA decorativo */}
            <div className="relative mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 hover:border-white/30 transition-all duration-500 group shadow-xl overflow-hidden">
              {/* Patrón de fondo */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '20px 20px',
                }} />
              </div>
              
              <div className="relative flex items-center gap-3">
                <div className="shrink-0 p-2 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Rocket className="h-4 w-4 text-yellow-100" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-semibold leading-snug">
                    Únete y documenta tu camino
                  </p>
                  <p className="text-[11px] text-blue-200/60 mt-0.5">
                    Es gratis y fácil de usar
                  </p>
                </div>
                <div className="shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decoraciones de esquina sutiles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] backdrop-blur-sm" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-tr-[100px] backdrop-blur-sm" />
      </div>

      {/* =============================================
          PANEL DERECHO - Formulario
          ============================================= */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-8 lg:py-12">
        <div className="w-full max-w-[420px] flex flex-col justify-center">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="p-2 bg-primary/10 rounded-xl">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-extrabold text-primary">TRAZIO</span>
          </div>

          {/* Contenedor del formulario */}
          <div className="w-full">
            {/* Tab switcher */}
            <div className="relative flex bg-muted rounded-xl p-1 mb-8 shadow-inner w-full">
            {/* Sliding indicator */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-md transition-transform duration-500 ease-out ${
                isRegister ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
              }`}
            />
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                !isRegister ? 'text-foreground scale-105' : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                isRegister ? 'text-foreground scale-105' : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* ===== FORM CONTAINER con transición ===== */}
          <div className="relative min-h-[360px] w-full">
            {/* LOGIN FORM */}
            <div
              className={`transition-all duration-500 ease-out ${
                isRegister
                  ? 'opacity-0 -translate-x-8 absolute inset-x-0 top-0 pointer-events-none'
                  : 'opacity-100 translate-x-0 relative'
              }`}
            >
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      autoComplete="email"
                      className="pl-10 h-11 rounded-xl border-muted-foreground/15 bg-white hover:border-primary/30 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                      {...loginForm.register('email')}
                      disabled={isLoading}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-destructive animate-fade-in-up">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    <Input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="pl-10 pr-10 h-11 rounded-xl border-muted-foreground/15 bg-white hover:border-primary/30 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                      {...loginForm.register('password')}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-all hover:scale-110"
                      tabIndex={-1}
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-destructive animate-fade-in-up">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98] group"
                >
                  {isLoading && loginMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Ingresar
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* REGISTER FORM */}
            <div
              className={`transition-all duration-500 ease-out ${
                !isRegister
                  ? 'opacity-0 translate-x-8 absolute inset-x-0 top-0 pointer-events-none'
                  : 'opacity-100 translate-x-0 relative'
              }`}
            >
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    <Input
                      type="text"
                      placeholder="Tu nombre completo"
                      autoComplete="name"
                      className="pl-10 h-11 rounded-xl border-muted-foreground/15 bg-white hover:border-primary/30 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                      {...registerForm.register('name')}
                      disabled={isLoading}
                    />
                  </div>
                  {registerForm.formState.errors.name && (
                    <p className="text-xs text-destructive animate-fade-in-up">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      autoComplete="email"
                      className="pl-10 h-11 rounded-xl border-muted-foreground/15 bg-white hover:border-primary/30 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                      {...registerForm.register('email')}
                      disabled={isLoading}
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-xs text-destructive animate-fade-in-up">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Contraseña
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    <Input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      className="pl-10 pr-10 h-11 rounded-xl border-muted-foreground/15 bg-white hover:border-primary/30 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                      {...registerForm.register('password')}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-all hover:scale-110"
                      tabIndex={-1}
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-xs text-destructive animate-fade-in-up">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Confirmar
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                    <Input
                      type={showConfirmPwd ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      autoComplete="new-password"
                      className="pl-10 pr-10 h-11 rounded-xl border-muted-foreground/15 bg-white hover:border-primary/30 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
                      {...registerForm.register('confirmPassword')}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-all hover:scale-110"
                      tabIndex={-1}
                    >
                      {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive animate-fade-in-up">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-6 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98] group"
                >
                  {isLoading && registerMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Crear cuenta
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          </div>

          {/* Footer text - Centrado en el panel derecho */}
          <p className="text-center text-xs text-muted-foreground/60 mt-8">
            © 2026 TRAZIO
          </p>
        </div>
      </div>
    </div>
  )
}

/* ========== Interactive Card Component (Compacta) ========== */
function InteractiveCard({
  icon,
  title,
  bgColor,
}: {
  icon: React.ReactNode
  title: string
  bgColor: string
}) {
  return (
    <div
      className={`relative flex items-center gap-2.5 p-3 rounded-xl ${bgColor} backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-lg overflow-hidden`}
    >
      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer" />
      
      <div className="relative z-10 p-1.5 bg-white/15 rounded-lg shrink-0 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
        <span className="text-white drop-shadow-md">{icon}</span>
      </div>
      <h3 className="relative z-10 text-white font-bold text-xs drop-shadow-md group-hover:translate-x-1 transition-transform">
        {title}
      </h3>
    </div>
  )
}
