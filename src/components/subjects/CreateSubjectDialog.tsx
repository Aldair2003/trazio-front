import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { subjectService } from '@/services/subjectService'
import { Loader2, Plus, BookOpen } from 'lucide-react'

const subjectSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
})

type SubjectFormData = z.infer<typeof subjectSchema>

export default function CreateSubjectDialog() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  })

  const createSubjectMutation = useMutation({
    mutationFn: subjectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      toast({
        title: '¡Materia creada!',
        description: 'La materia ha sido creada exitosamente',
      })
      reset()
      setOpen(false)
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear la materia',
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const onSubmit = (data: SubjectFormData) => {
    setIsLoading(true)
    createSubjectMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Materia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Crear Nueva Materia
          </DialogTitle>
          <DialogDescription>
            Agrega una nueva materia al sistema para poder registrar exámenes, tareas y proyectos
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Materia</Label>
            <Input
              id="name"
              placeholder="Ej: Programación Avanzada"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Ej: Curso de programación orientada a objetos y patrones de diseño"
              className="min-h-[100px]"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Materia
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
