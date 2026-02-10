import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentService } from '@/services/commentService'
import { useAuthStore } from '@/stores/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { timeAgo } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Loader2, Trash2 } from 'lucide-react'

interface CommentSectionProps {
  postId: number
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [commentContent, setCommentContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentService.getByPost(postId),
  })

  const createCommentMutation = useMutation({
    mutationFn: commentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setCommentContent('')
      toast({
        title: 'Comentario publicado',
      })
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo publicar el comentario',
      })
    },
    onSettled: () => {
      setIsSubmitting(false)
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: commentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Comentario eliminado',
      })
    },
  })

  const handleSubmitComment = () => {
    if (!user || !commentContent.trim()) return

    setIsSubmitting(true)
    createCommentMutation.mutate({
      postId,
      userId: Number(user.id),
      content: commentContent.trim(),
    })
  }

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm('¿Eliminar este comentario?')) {
      deleteCommentMutation.mutate(commentId)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="w-full space-y-4 border-t pt-4">
      {/* Formulario para nuevo comentario */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.profileImage} alt={user?.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {user ? getInitials(user.name) : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Escribe un comentario..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            disabled={isSubmitting}
            className="min-h-[60px]"
          />
          <Button
            size="sm"
            onClick={handleSubmitComment}
            disabled={!commentContent.trim() || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Comentar
          </Button>
        </div>
      </div>

      {/* Lista de comentarios */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {comments?.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link to={`/profile/${comment.userId}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user?.profileImage} alt={comment.user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {comment.user ? getInitials(comment.user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 bg-muted rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <Link
                    to={`/profile/${comment.userId}`}
                    className="font-semibold text-sm hover:underline"
                  >
                    {comment.user?.name || 'Usuario'}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(comment.createdAt)}
                    </span>
                    {user?.id === comment.userId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}

          {comments?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Sé el primero en comentar
            </p>
          )}
        </div>
      )}
    </div>
  )
}
