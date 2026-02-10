import { useQuery } from '@tanstack/react-query'
import { projectService } from '@/services/projectService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, FolderOpen, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CreateProjectDialog from '@/components/projects/CreateProjectDialog'
import { useNavigate } from 'react-router-dom'

export default function ProjectsPage() {
  const navigate = useNavigate()

  // Ahora obtenemos solo MIS proyectos (repositorio personal)
  const { data: projects, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectService.getMyRepository(),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mis Proyectos</h1>
            <p className="text-muted-foreground">Tu repositorio personal de proyectos académicos</p>
          </div>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => project.subject && navigate(`/subjects/${project.subjectId}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {project.subject?.name || 'Materia'}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Entrega: {formatDate(project.dueDate)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                {project.student && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Estudiante: {project.student.name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No hay proyectos registrados aún
            </p>
            <CreateProjectDialog />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
