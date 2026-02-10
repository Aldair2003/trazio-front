import { useQuery } from '@tanstack/react-query'
import { highlightService } from '@/services/highlightService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, User, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { timeAgo } from '@/lib/utils'
import type { Highlight } from '@/types'

interface HighlightedWorksProps {
  userId: number
  userName: string
  isOwnProfile: boolean
}

export default function HighlightedWorks({ userId, userName, isOwnProfile }: HighlightedWorksProps) {
  // Obtener posts donde este usuario ha sido destacado
  // Esto requiere un nuevo endpoint en el backend que obtenga los highlights recibidos
  const { data: highlights = [], isLoading } = useQuery<Highlight[]>({
    queryKey: ['user-highlights-received', userId],
    queryFn: async () => {
      // Por ahora usamos el endpoint de teacher highlights si es docente
      // o necesitamos crear uno nuevo para estudiantes
      try {
        const response = await highlightService.getTeacherHighlights(userId)
        return response
      } catch {
        return []
      }
    },
    enabled: !!userId,
  })

  if (isLoading) {
    return null
  }

  if (highlights.length === 0) {
    return null
  }

  return (
    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          {isOwnProfile ? 'Mis Destacados' : `Destacados de ${userName}`}
        </CardTitle>
        <CardDescription>
          {highlights.length} trabajo{highlights.length !== 1 ? 's' : ''} destacado{highlights.length !== 1 ? 's' : ''} por docentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {highlights.slice(0, 5).map((highlight) => (
            <div 
              key={highlight.id} 
              className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-yellow-100 dark:border-yellow-900/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {highlight.comment && (
                    <p className="text-sm italic text-muted-foreground mb-2">
                      "{highlight.comment}"
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <Link 
                      to={`/profile/${highlight.teacherId}`}
                      className="hover:text-primary hover:underline"
                    >
                      {highlight.teacher?.name || 'Docente'}
                    </Link>
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    <span>{timeAgo(highlight.createdAt)}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Destacado
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
