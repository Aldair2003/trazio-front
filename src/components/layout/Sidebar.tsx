import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { hashtagService } from '@/services/hashtagService'
import { Hash, TrendingUp, Info, Calendar, ClipboardList, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Sidebar() {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false)
  
  const { data: popularHashtags } = useQuery({
    queryKey: ['hashtags', 'popular'],
    queryFn: () => hashtagService.getPopular(5), // Reducido de 8 a 5
  })

  return (
    <div className="space-y-3">
      {/* Acciones Rápidas - Repositorios */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" />
            Mi Repositorio
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start h-9"
            asChild
          >
            <Link to="/exams">
              <Calendar className="h-4 w-4 mr-2" />
              Exámenes
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start h-9"
            asChild
          >
            <Link to="/assignments">
              <ClipboardList className="h-4 w-4 mr-2" />
              Tareas
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start h-9"
            asChild
          >
            <Link to="/projects">
              <FolderOpen className="h-4 w-4 mr-2" />
              Proyectos
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Hashtags Populares - Más compacto */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="space-y-2">
            {popularHashtags?.slice(0, 5).map((hashtag) => (
              <Link
                key={hashtag.id}
                to={`/feed?hashtag=${hashtag.name}`}
                className="flex items-center gap-2 text-xs hover:text-primary transition-colors group py-1"
              >
                <Hash className="h-3 w-3 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                <span className="font-medium truncate">{hashtag.name}</span>
                {hashtag.postCount !== undefined && (
                  <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                    {hashtag.postCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* About - Colapsable y más compacto */}
      <Card className="shadow-sm">
        <CardHeader 
          className="pb-2 pt-3 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setIsAboutExpanded(!isAboutExpanded)}
        >
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Acerca de TRAZIO
            </div>
            <span className="text-xs text-muted-foreground">
              {isAboutExpanded ? '−' : '+'}
            </span>
          </CardTitle>
        </CardHeader>
        {isAboutExpanded && (
          <CardContent className="px-4 pb-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plataforma académica colaborativa que documenta la trayectoria universitaria para mejorar el aprendizaje.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
