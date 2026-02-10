import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { Loader2, User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react'

const registerSchema = z
  .object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z.string().email('Ingresa un email válido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password') || ''

  // Password strength
  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
  const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte']

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setUser(data.user)
      toast({
        title: '¡Cuenta creada exitosamente!',
        description: 'Bienvenido a TRAZIO. Tu aventura académica comienza ahora.',
      })
      navigate('/')
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error al crear la cuenta',
        description: error.response?.data?.message || 'No se pudo crear la cuenta. Intenta con otro email.',
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    setIsLoading(true)
    const { confirmPassword, ...registerData } = data
    registerMutation.mutate(registerData)
  }

  return (
    <div className="animate-fade-in-up">
      {/* Back to login */}
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Volver al inicio de sesión
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Crea tu cuenta
        </h2>
        <p className="text-muted-foreground mt-2">
          Únete a la comunidad académica de TRAZIO
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="space-y-2 animate-fade-in-up animation-delay-100">
          <Label htmlFor="name" className="text-sm font-medium">
            Nombre completo
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="name"
              type="text"
              placeholder="Juan Carlos Pérez"
              className="pl-10 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:bg-background transition-all duration-300 input-glow"
              {...register('name')}
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive flex items-center gap-1 animate-fade-in-up">
              <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2 animate-fade-in-up animation-delay-200">
          <Label htmlFor="email" className="text-sm font-medium">
            Email universitario
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="tu@universidad.edu"
              className="pl-10 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:bg-background transition-all duration-300 input-glow"
              {...register('email')}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1 animate-fade-in-up">
              <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2 animate-fade-in-up animation-delay-300">
          <Label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 6 caracteres"
              className="pl-10 pr-12 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:bg-background transition-all duration-300 input-glow"
              {...register('password')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive flex items-center gap-1 animate-fade-in-up">
              <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
              {errors.password.message}
            </p>
          )}

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="space-y-2 animate-fade-in-up">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      index < passwordStrength
                        ? strengthColors[passwordStrength - 1]
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Seguridad: <span className="font-medium">{strengthLabels[passwordStrength - 1] || 'Muy débil'}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2 animate-fade-in-up animation-delay-400">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmar contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              className="pl-10 pr-12 h-12 rounded-xl bg-muted/50 border-muted-foreground/20 focus:bg-background transition-all duration-300 input-glow"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive flex items-center gap-1 animate-fade-in-up">
              <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="animate-fade-in-up animation-delay-500">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Al crear una cuenta, aceptas los{' '}
            <span className="text-primary hover:underline cursor-pointer">términos de uso</span>
            {' '}y la{' '}
            <span className="text-primary hover:underline cursor-pointer">política de privacidad</span>
            {' '}de TRAZIO.
          </p>
        </div>

        {/* Submit Button */}
        <div className="animate-fade-in-up animation-delay-500 pt-1">
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Crear cuenta
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Benefits */}
      <div className="mt-8 p-4 rounded-2xl bg-muted/50 border border-muted-foreground/10 animate-fade-in-up animation-delay-600">
        <p className="text-xs font-semibold text-foreground mb-3">Al unirte a TRAZIO podrás:</p>
        <div className="space-y-2">
          {[
            'Documentar tu trayectoria académica',
            'Compartir experiencias y consejos',
            'Consultar aportes de otros estudiantes',
          ].map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="p-0.5 rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-xs text-muted-foreground">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login link */}
      <div className="mt-6 text-center animate-fade-in-up animation-delay-700">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
