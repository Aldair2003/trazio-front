import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { postService } from '@/services/postService'
import { profileService } from '@/services/profileService'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Download, 
  User, 
  BookOpen,
  Calendar,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserRole, type Post, type CurriculumSubject } from '@/types'
import { timeAgo } from '@/lib/utils'
import { useState } from 'react'

interface StudentSubjectRelation {
  id: number
  curriculumSubjectId: number
  curriculumSubject?: CurriculumSubject
  teacher?: {
    id: number
    name: string
  }
}

interface ProfileData {
  currentSubjects?: StudentSubjectRelation[]
}

export default function RecursosPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  // Obtener materias del estudiante
  const { data: profileData, isLoading: isLoadingProfile } = useQuery<ProfileData>({
    queryKey: ['profile', 'me'],
    queryFn: () => profileService.getMyProfile(),
    enabled: user?.role === UserRole.STUDENT,
  })

  // Obtener recursos (posts tipo 'resource')
  const { data: resources, isLoading: isLoadingResources } = useQuery<Post[]>({
    queryKey: ['posts', 'resources', selectedSubject],
    queryFn: () => {
      const curriculumSubjectId = selectedSubject !== 'all' ? Number(selectedSubject) : undefined
      return postService.getResources(curriculumSubjectId)
    },
    enabled: user?.role === UserRole.STUDENT,
  })

  // Verificar que sea estudiante
  if (user?.role !== UserRole.STUDENT) {
    navigate('/feed')
    return null
  }

  const currentSubjects = profileData?.currentSubjects || []
  const isLoading = isLoadingProfile || isLoadingResources

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold">Recursos</h1>
            <p className="text-sm text-muted-foreground">
              Material compartido por tus docentes
            </p>
          </div>
        </div>
      </div>

      {/* Filtro por materia */}
      <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="all" className="flex-shrink-0">
            Todos
          </TabsTrigger>
          {currentSubjects.map((relation) => (
            <TabsTrigger 
              key={relation.curriculumSubjectId} 
              value={String(relation.curriculumSubjectId)}
              className="flex-shrink-0"
            >
              {relation.curriculumSubject?.name || 'Materia'}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedSubject} className="mt-6">
          {/* Lista de recursos */}
          {!resources || resources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay recursos disponibles</h3>
                <p className="text-muted-foreground">
                  {selectedSubject === 'all' 
                    ? 'Tus docentes aún no han compartido recursos'
                    : 'No hay recursos para esta materia'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ResourceCardProps {
  resource: Post
}

function ResourceCard({ resource }: ResourceCardProps) {
  const handleDownload = async () => {
    if (resource.filePath) {
      try {
        const response = await fetch(resource.filePath)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = resource.fileName || 'recurso'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      } catch {
        window.open(resource.filePath, '_blank')
      }
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-base line-clamp-2">
                {resource.content.split('\n')[0].substring(0, 100)}
              </CardTitle>
              {resource.curriculumSubject && (
                <Badge variant="outline" className="mt-1">
                  {resource.curriculumSubject.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Contenido */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {resource.content}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {resource.user?.name || 'Docente'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {timeAgo(resource.createdAt)}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          {resource.filePath && (
            <Button variant="default" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Descargar
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href={`/feed?hashtag=recurso`}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Ver en Feed
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
