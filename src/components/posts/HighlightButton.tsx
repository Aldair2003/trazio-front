import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { highlightService } from '@/services/highlightService'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { UserRole } from '@/types'

interface HighlightButtonProps {
  postId: number
  postOwnerId: number
  size?: 'sm' | 'default' | 'lg' | 'icon'
  showCount?: boolean
  initialHighlightsCount?: number
}

export default function HighlightButton({ 
  postId, 
  postOwnerId,
  size = 'icon',
  showCount = false,
  initialHighlightsCount = 0
}: HighlightButtonProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [hasHighlighted, setHasHighlighted] = useState(false)
  const [highlightsCount, setHighlightsCount] = useState(initialHighlightsCount)

  const isTeacher = user?.role === UserRole.TEACHER
  const isOwner = user?.id === postOwnerId
  const canHighlight = isTeacher && !isOwner

  // Verificar si ya destacó - siempre se llama pero solo se ejecuta si es docente
  const { isLoading: isLoadingCheck } = useQuery({
    queryKey: ['highlights', 'hasHighlighted', postId, user?.id],
    queryFn: async () => {
      const result = await highlightService.hasHighlighted(postId)
      setHasHighlighted(result.hasHighlighted)
      return result
    },
    enabled: canHighlight,
  })

  // Mutación para destacar
  const highlightMutation = useMutation({
    mutationFn: async () => {
      if (hasHighlighted) {
        await highlightService.removeHighlight(postId)
        return { action: 'removed' }
      } else {
        await highlightService.highlight({ postId, comment: comment || undefined })
        return { action: 'highlighted' }
      }
    },
    onSuccess: (result) => {
      if (result.action === 'highlighted') {
        setHasHighlighted(true)
        setHighlightsCount((prev) => prev + 1)
        toast({
          title: '⭐ Trabajo destacado',
          description: 'Has destacado este trabajo exitosamente',
        })
      } else {
        setHasHighlighted(false)
        setHighlightsCount((prev) => Math.max(0, prev - 1))
        toast({
          title: 'Destacado eliminado',
          description: 'Has quitado el destacado de este trabajo',
        })
      }
      setIsDialogOpen(false)
      setComment('')
      queryClient.invalidateQueries({ queryKey: ['highlights'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo procesar la acción',
      })
    },
  })

  // Si no puede destacar, solo mostrar contador si hay destacados
  if (!canHighlight) {
    if (showCount && highlightsCount > 0) {
      return (
        <div className="flex items-center gap-1 text-yellow-600">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm">{highlightsCount}</span>
        </div>
      )
    }
    return null
  }

  const handleClick = () => {
    if (hasHighlighted) {
      // Quitar destacado directamente
      highlightMutation.mutate()
    } else {
      // Abrir diálogo para agregar comentario
      setIsDialogOpen(true)
    }
  }

  const handleConfirmHighlight = () => {
    highlightMutation.mutate()
  }

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        onClick={handleClick}
        disabled={highlightMutation.isPending || isLoadingCheck}
        className={hasHighlighted ? 'text-yellow-500 hover:text-yellow-600' : 'hover:text-yellow-500'}
        title={hasHighlighted ? 'Quitar destacado' : 'Destacar trabajo'}
      >
        {highlightMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Star className={`h-4 w-4 ${hasHighlighted ? 'fill-current' : ''}`} />
        )}
        {showCount && highlightsCount > 0 && (
          <span className="ml-1 text-sm">{highlightsCount}</span>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Destacar este trabajo
            </DialogTitle>
            <DialogDescription>
              Destaca este trabajo para reconocer el esfuerzo del estudiante. 
              Opcionalmente puedes agregar un comentario.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="highlight-comment">Comentario (opcional)</Label>
              <Textarea
                id="highlight-comment"
                placeholder="Ej: Excelente trabajo, demuestra dominio del tema..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmHighlight}
              disabled={highlightMutation.isPending}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {highlightMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Star className="h-4 w-4 mr-2" />
              )}
              Destacar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
