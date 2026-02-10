import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Hash, Trash2, Heart, Download, FileText, Star, Calendar, ClipboardList, FolderOpen, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { timeAgo } from '@/lib/utils'
import type { Post, FileType } from '@/types'
import { UserRole } from '@/types'
import { useAuthStore } from '@/stores/authStore'
import CommentSection from './CommentSection'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { postService } from '@/services/postService'
import { likeService } from '@/services/likeService'
import { highlightService } from '@/services/highlightService'
import { useToast } from '@/hooks/use-toast'

interface PostCardProps {
  post: Post
}

// Configuración de tipos de post
const postTypeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, label: string, color: string, bgColor: string }> = {
  general: { icon: MessageSquare, label: 'Publicación', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  exam: { icon: Calendar, label: 'Examen', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  assignment: { icon: ClipboardList, label: 'Tarea', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  project: { icon: FolderOpen, label: 'Proyecto', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  resource: { icon: FileText, label: 'Recurso', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
}

// Función para detectar el tipo de archivo basado en la URL
const detectFileType = (filePath: string, fileType?: FileType): FileType => {
  if (fileType) return fileType
  
  const lowerPath = filePath.toLowerCase()
  if (lowerPath.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'image'
  if (lowerPath.match(/\.(mp4|webm|mov|avi)$/)) return 'video'
  return 'document'
}

// Función para descargar archivo
const handleDownload = async (url: string, fileName?: string) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName || 'archivo'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    // Fallback: abrir en nueva pestaña
    window.open(url, '_blank')
  }
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showComments, setShowComments] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)

  const isOwner = user?.id === post.userId

  // Obtener conteo de likes
  const { data: likesCountData } = useQuery({
    queryKey: ['likes', 'count', post.id],
    queryFn: () => likeService.countLikes(post.id),
  })

  // Verificar si el usuario dio like
  const { data: hasLikedData, isLoading: isLoadingHasLiked } = useQuery({
    queryKey: ['likes', 'hasLiked', post.id, user?.id],
    queryFn: () => likeService.hasLiked(post.id, Number(user!.id)),
    enabled: !!user,
  })

  useEffect(() => {
    if (likesCountData !== undefined) {
      setLikesCount(likesCountData)
    }
  }, [likesCountData])

  useEffect(() => {
    if (hasLikedData !== undefined) {
      setHasLiked(hasLikedData)
    }
  }, [hasLikedData])

  const deleteMutation = useMutation({
    mutationFn: () => postService.delete(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Publicación eliminada',
        description: 'La publicación ha sido eliminada exitosamente',
      })
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar la publicación',
      })
    },
  })

  // Mutación para dar/quitar like - recibe el estado actual como parámetro
  const likeMutation = useMutation({
    mutationFn: async (shouldUnlike: boolean) => {
      if (shouldUnlike) {
        await likeService.unlikePost(post.id, Number(user!.id))
        return { action: 'unliked' }
      } else {
        await likeService.likePost(post.id, Number(user!.id))
        return { action: 'liked' }
      }
    },
    onMutate: async (shouldUnlike: boolean) => {
      // Cancelar queries pendientes para evitar conflictos
      await queryClient.cancelQueries({ queryKey: ['likes', 'hasLiked', post.id, user?.id] })
      await queryClient.cancelQueries({ queryKey: ['likes', 'count', post.id] })
      
      // Guardar valor anterior para revertir si falla
      const previousLiked = shouldUnlike
      const previousCount = likesCount
      
      // Optimistic update
      setHasLiked(!shouldUnlike)
      setLikesCount(shouldUnlike ? previousCount - 1 : previousCount + 1)
      
      return { previousLiked, previousCount }
    },
    onError: (_error, _variables, context) => {
      // Revertir al estado anterior
      if (context) {
        setHasLiked(context.previousLiked)
        setLikesCount(context.previousCount)
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el like',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', 'count', post.id] })
      queryClient.invalidateQueries({ queryKey: ['likes', 'hasLiked', post.id, user?.id] })
    },
  })

  const handleLikeClick = () => {
    // Capturamos el estado actual ANTES de llamar a mutate
    const currentHasLiked = hasLiked
    likeMutation.mutate(currentHasLiked)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      deleteMutation.mutate()
    }
  }

  // Obtener configuración del tipo de post
  const postType = post.type || 'general'
  const typeConfig = postTypeConfig[postType] || postTypeConfig.general
  const TypeIcon = typeConfig.icon

  // Verificar si el usuario es docente para mostrar botón de destacar
  const isTeacher = user?.role === UserRole.TEACHER

  // Estado para destacados
  const [hasHighlighted, setHasHighlighted] = useState(false)
  const [highlightsCount, setHighlightsCount] = useState(post.highlightsCount || 0)

  // Verificar si el docente ya destacó
  const { data: hasHighlightedData } = useQuery({
    queryKey: ['highlights', 'hasHighlighted', post.id, user?.id],
    queryFn: () => highlightService.hasHighlighted(post.id),
    enabled: isTeacher,
  })

  useEffect(() => {
    if (hasHighlightedData !== undefined) {
      setHasHighlighted(hasHighlightedData.hasHighlighted)
    }
  }, [hasHighlightedData])

  // Mutación para destacar
  const highlightMutation = useMutation({
    mutationFn: async (shouldRemove: boolean) => {
      if (shouldRemove) {
        await highlightService.removeHighlight(post.id)
        return { action: 'removed' }
      } else {
        await highlightService.highlight({ postId: post.id })
        return { action: 'highlighted' }
      }
    },
    onMutate: async (shouldRemove: boolean) => {
      const previousHighlighted = hasHighlighted
      const previousCount = highlightsCount
      setHasHighlighted(!shouldRemove)
      setHighlightsCount(shouldRemove ? previousCount - 1 : previousCount + 1)
      return { previousHighlighted, previousCount }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        setHasHighlighted(context.previousHighlighted)
        setHighlightsCount(context.previousCount)
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el destacado',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['highlights', 'hasHighlighted', post.id] })
    },
  })

  const handleHighlightClick = () => {
    highlightMutation.mutate(hasHighlighted)
  }

  return (
    <Card className="overflow-hidden">
      {/* Badge de tipo de post */}
      {postType !== 'general' && (
        <div className={`px-4 py-2 ${typeConfig.bgColor} flex items-center gap-2`}>
          <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
          <span className={`text-sm font-medium ${typeConfig.color}`}>
            {typeConfig.label}
            {post.curriculumSubject && (
              <span className="font-normal"> en {post.curriculumSubject.name}</span>
            )}
          </span>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.userId}`}>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {post.user ? getInitials(post.user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${post.userId}`}
                  className="font-semibold hover:underline"
                >
                  {post.user?.name || 'Usuario'}
                </Link>
                {post.user?.role === UserRole.TEACHER && (
                  <Badge variant="secondary" className="text-xs">
                    Docente
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón destacar (solo docentes) */}
            {isTeacher && !isOwner && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleHighlightClick}
                disabled={highlightMutation.isPending}
                className={hasHighlighted ? 'text-yellow-500' : ''}
                title={hasHighlighted ? 'Quitar destacado' : 'Destacar publicación'}
              >
                <Star className={`h-4 w-4 ${hasHighlighted ? 'fill-current' : ''}`} />
              </Button>
            )}
            
            {isOwner && (
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>

        {post.filePath && (
          <div className="mt-4">
            {/* Imagen */}
            {detectFileType(post.filePath, post.fileType) === 'image' && (
              <div className="relative group">
                <img
                  src={post.filePath}
                  alt="Post image"
                  className="w-full rounded-md object-cover max-h-96"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDownload(post.filePath!, post.fileName)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
              </div>
            )}

            {/* Video */}
            {detectFileType(post.filePath, post.fileType) === 'video' && (
              <div className="relative">
                <video
                  src={post.filePath}
                  controls
                  className="w-full rounded-md max-h-96"
                  preload="metadata"
                >
                  Tu navegador no soporta la reproducción de video.
                </video>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleDownload(post.filePath!, post.fileName)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar video
                </Button>
              </div>
            )}

            {/* Documento */}
            {detectFileType(post.filePath, post.fileType) === 'document' && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                <div className="flex items-center gap-3">
                  <FileText className="h-10 w-10 text-orange-500" />
                  <div>
                    <p className="font-medium">{post.fileName || 'Documento'}</p>
                    <p className="text-sm text-muted-foreground">
                      Haz clic para descargar
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(post.filePath!, post.fileName)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
              </div>
            )}
          </div>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.hashtags.map((hashtag) => (
              <Link
                key={hashtag.id}
                to={`/feed?hashtag=${hashtag.name}`}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                <Hash className="h-3 w-3" />
                {hashtag.name}
              </Link>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        {/* Destacados por docentes */}
        {highlightsCount > 0 && (
          <div className="w-full px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm text-yellow-700 dark:text-yellow-400">
              Destacado por {highlightsCount} docente{highlightsCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 w-full border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeClick}
            disabled={!user || likeMutation.isPending || isLoadingHasLiked}
            className={`flex items-center gap-2 ${hasLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likesCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">
              {post.comments?.length || 0}
            </span>
          </Button>

          {/* Mostrar contador de destacados */}
          {highlightsCount > 0 && (
            <div className="flex items-center gap-2 text-yellow-600">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm">{highlightsCount}</span>
            </div>
          )}
        </div>

        {showComments && <CommentSection postId={post.id} />}
      </CardFooter>
    </Card>
  )
}
