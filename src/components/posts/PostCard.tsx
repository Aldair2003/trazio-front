import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Hash, Trash2, Heart, Download, FileText, Star, Calendar, ClipboardList, FolderOpen, MessageSquare, Github, Globe, Code, Users } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { timeAgo } from '@/lib/utils'
import type { Post, FileType, FileAttachment } from '@/types'
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

        {/* Información detallada del proyecto */}
        {post.type === 'project' && post.linkedEntity && 'technologies' in post.linkedEntity && (
          <div className="mt-4 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="space-y-3">
              {/* Título del proyecto */}
              <h3 className="font-semibold text-lg text-purple-900 dark:text-purple-100">
                {post.linkedEntity.title}
              </h3>

              {/* Descripción */}
              {post.linkedEntity.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {post.linkedEntity.description}
                </p>
              )}

              {/* Tecnologías */}
              {post.linkedEntity.technologies && post.linkedEntity.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Code className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                  {post.linkedEntity.technologies.map((tech: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Fecha de entrega */}
              {'dueDate' in post.linkedEntity && post.linkedEntity.dueDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha de entrega: {new Date(post.linkedEntity.dueDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}

              {/* Enlaces del proyecto */}
              <div className="flex flex-wrap gap-3 pt-2">
                {post.linkedEntity.repositoryUrl && (
                  <a
                    href={post.linkedEntity.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    Repositorio
                  </a>
                )}
                
                {post.linkedEntity.demoUrl && (
                  <a
                    href={post.linkedEntity.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Ver Demo
                  </a>
                )}
              </div>

              {/* Colaboradores si existen */}
              {post.linkedEntity.collaborators && post.linkedEntity.collaborators.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-2 border-t">
                  <Users className="h-4 w-4" />
                  <span>Colaboradores: {post.linkedEntity.collaborators.length}</span>
                </div>
              )}

              {/* Archivos adjuntos del proyecto */}
              {post.linkedEntity.attachments && post.linkedEntity.attachments.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Archivos adjuntos:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {post.linkedEntity.attachments.map((attachment: FileAttachment, index: number) => (
                      <div key={index} className="relative group bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border">
                        {/* Previsualización según tipo */}
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                          {attachment.fileType === 'image' ? (
                            <img
                              src={attachment.url}
                              alt={attachment.fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const parent = e.currentTarget.parentElement
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="flex flex-col items-center justify-center p-3">
                                      <svg class="h-8 w-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <p class="text-xs text-gray-500">Imagen</p>
                                    </div>
                                  `
                                }
                              }}
                            />
                          ) : attachment.fileType === 'video' ? (
                            <div className="relative w-full h-full">
                              <video
                                src={attachment.url}
                                className="w-full h-full object-cover"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                              <div className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full">
                                <FileText className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                          </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 h-full">
                              <FileText className="h-8 w-8 text-purple-600 mb-2" />
                              <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">{attachment.fileName}</p>
                            </div>
                          )}
                        </div>                        {/* Info y botón de descarga */}
                        <div className="p-2 bg-white dark:bg-gray-800">
                          <p className="text-xs font-medium truncate mb-1">{attachment.fileName || `Archivo ${index + 1}`}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => handleDownload(attachment.url, attachment.fileName)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información detallada del examen */}
        {post.type === 'exam' && post.linkedEntity && (
          <div className="mt-4 p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20">
            <div className="space-y-3">
              {/* Título del examen */}
              <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">
                {post.linkedEntity.title}
              </h3>

              {/* Descripción */}
              {post.linkedEntity.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {post.linkedEntity.description}
                </p>
              )}

              {/* Fecha del examen */}
              {'date' in post.linkedEntity && post.linkedEntity.date && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha del examen: {new Date(post.linkedEntity.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}

              {/* Archivos adjuntos del examen */}
              {post.linkedEntity.attachments && post.linkedEntity.attachments.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Archivos adjuntos:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {post.linkedEntity.attachments.map((attachment: FileAttachment, index: number) => (
                      <div key={index} className="relative group bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border">
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                          {attachment.fileType === 'image' ? (
                            <img
                              src={attachment.url}
                              alt={attachment.fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const parent = e.currentTarget.parentElement
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="flex flex-col items-center justify-center p-3">
                                      <svg class="h-8 w-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <p class="text-xs text-gray-500">Imagen</p>
                                    </div>
                                  `
                                }
                              }}
                            />
                          ) : attachment.fileType === 'video' ? (
                            <video 
                              src={attachment.url} 
                              className="w-full h-full object-cover rounded" 
                              controls
                              preload="metadata"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 h-full">
                              <FileText className="h-8 w-8 text-blue-600 mb-2" />
                              <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium px-1 line-clamp-2">{attachment.fileName}</p>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-white dark:bg-gray-800">
                          <p className="text-xs font-medium truncate mb-1">{attachment.fileName || `Archivo ${index + 1}`}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => handleDownload(attachment.url, attachment.fileName)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información detallada de la tarea */}
        {post.type === 'assignment' && post.linkedEntity && (
          <div className="mt-4 p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
            <div className="space-y-3">
              {/* Título de la tarea */}
              <h3 className="font-semibold text-lg text-green-900 dark:text-green-100">
                {post.linkedEntity.title}
              </h3>

              {/* Descripción */}
              {post.linkedEntity.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {post.linkedEntity.description}
                </p>
              )}

              {/* Fecha de entrega */}
              {'dueDate' in post.linkedEntity && post.linkedEntity.dueDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha de entrega: {new Date(post.linkedEntity.dueDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}

              {/* Archivos adjuntos de la tarea */}
              {post.linkedEntity.attachments && post.linkedEntity.attachments.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Archivos adjuntos:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {post.linkedEntity.attachments.map((attachment: FileAttachment, index: number) => (
                      <div key={index} className="relative group bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden border">
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                          {attachment.fileType === 'image' ? (
                            <img
                              src={attachment.url}
                              alt={attachment.fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const parent = e.currentTarget.parentElement
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="flex flex-col items-center justify-center p-3">
                                      <svg class="h-8 w-8 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <p class="text-xs text-gray-500">Imagen</p>
                                    </div>
                                  `
                                }
                              }}
                            />
                          ) : attachment.fileType === 'video' ? (
                            <video 
                              src={attachment.url} 
                              className="w-full h-full object-cover rounded" 
                              controls
                              preload="metadata"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 h-full">
                              <FileText className="h-8 w-8 text-green-600 mb-2" />
                              <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium px-1 line-clamp-2">{attachment.fileName}</p>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-white dark:bg-gray-800">
                          <p className="text-xs font-medium truncate mb-1">{attachment.fileName || `Archivo ${index + 1}`}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                            onClick={() => handleDownload(attachment.url, attachment.fileName)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
