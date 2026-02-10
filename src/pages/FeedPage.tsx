import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { postService } from '@/services/postService'
import PostCard from '@/components/posts/PostCard'
import CreatePostDialog from '@/components/posts/CreatePostDialog'
import { Loader2, Search, Hash, Filter, MessageSquare, Calendar, ClipboardList, FolderOpen, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PostType } from '@/types'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function FeedPage() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')
  const hashtagQuery = searchParams.get('hashtag')
  const curriculumSubjectId = searchParams.get('curriculumSubjectId')
  
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', searchQuery, hashtagQuery, curriculumSubjectId, activeFilter],
    queryFn: () =>
      postService.getAll({
        search: searchQuery || undefined,
        hashtag: hashtagQuery || undefined,
        curriculumSubjectId: curriculumSubjectId ? Number(curriculumSubjectId) : undefined,
        type: activeFilter !== 'all' ? (activeFilter as PostType) : undefined,
      }),
  })

  const getTitle = () => {
    if (searchQuery) return `Resultados para: "${searchQuery}"`
    if (hashtagQuery) return `#${hashtagQuery}`
    if (curriculumSubjectId) return 'Publicaciones de materia'
    return 'Feed de Publicaciones'
  }

  const filterOptions = [
    { value: 'all', label: 'Todos', icon: Filter },
    { value: PostType.GENERAL, label: 'General', icon: MessageSquare },
    { value: PostType.EXAM, label: 'Exámenes', icon: Calendar },
    { value: PostType.ASSIGNMENT, label: 'Tareas', icon: ClipboardList },
    { value: PostType.PROJECT, label: 'Proyectos', icon: FolderOpen },
    // { value: PostType.RESOURCE, label: 'Recursos', icon: FileText },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header elegante */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
            {hashtagQuery ? (
              <Hash className="h-5 w-5 text-white" />
            ) : (
              <Sparkles className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{getTitle()}</h1>
            <p className="text-sm text-muted-foreground">
              {searchQuery || hashtagQuery 
                ? 'Explora contenido relevante'
                : 'Comparte y descubre contenido académico'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Create Post - Diseño mejorado */}
      {!searchQuery && !hashtagQuery && (
        <div className="mb-6">
          <CreatePostDialog />
        </div>
      )}

      {/* Filtros - Diseño de chips modernos */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-50 rounded-xl">
          {filterOptions.map((option) => {
            const Icon = option.icon
            const isActive = activeFilter === option.value
            return (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-white text-blue-600 shadow-sm border border-blue-100" 
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive && "text-blue-500")} />
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Posts Feed - Diseño limpio */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-blue-50 rounded-full mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
            <p className="text-sm text-muted-foreground">Cargando publicaciones...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 bg-gray-50/50">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-700 mb-1">No hay publicaciones</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {activeFilter !== 'all' 
                    ? 'No se encontraron publicaciones con este filtro. Prueba con otra categoría.'
                    : 'Sé el primero en compartir algo con la comunidad académica.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Indicador de fin del feed */}
      {posts && posts.length > 0 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 px-4 py-2 rounded-full">
            <Sparkles className="h-3 w-3" />
            Has llegado al final
          </div>
        </div>
      )}
    </div>
  )
}
