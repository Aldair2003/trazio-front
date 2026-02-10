import { useQuery } from '@tanstack/react-query'
import { postService } from '@/services/postService'
import PostCard from '@/components/posts/PostCard'
import CreatePostDialog from '@/components/posts/CreatePostDialog'
import { Loader2, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postService.getAll(),
  })

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Bienvenido a TRAZIO</CardTitle>
              <p className="text-muted-foreground mt-1">
                Comparte y descubre experiencias académicas de la comunidad universitaria
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Create Post */}
      <CreatePostDialog />

      {/* Posts Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Publicaciones Recientes</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No hay publicaciones aún. ¡Sé el primero en compartir!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
