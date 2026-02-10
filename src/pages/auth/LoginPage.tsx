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
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user)
      toast({
        title: '¡Bienvenido de vuelta!',
        description: `Has iniciado sesión como ${data.user.name}`,
      })
      navigate('/')
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
        description: error.response?.data?.message || 'Credenciales inválidas. Verifica tu email y contraseña.',
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true)
    loginMutation.mutate(data)
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Bienvenido de vuelta
        </h2>
        <p className="text-muted-foreground mt-2">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-2 animate-fade-in-up animation-delay-100">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
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
        <div className="space-y-2 animate-fade-in-up animation-delay-200">
          <Label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
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
        </div>

        {/* Submit Button */}
        <div className="animate-fade-in-up animation-delay-300 pt-2">
          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Iniciar Sesión
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Separator */}
      <div className="relative my-8 animate-fade-in-up animation-delay-400">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-4 text-muted-foreground">¿Eres nuevo aquí?</span>
        </div>
      </div>

      {/* Register Link */}
      <div className="animate-fade-in-up animation-delay-500">
        <Link to="/register">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl text-base font-medium border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group"
          >
            Crear una cuenta nueva
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
