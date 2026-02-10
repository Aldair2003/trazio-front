import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { subjectService } from '@/services/subjectService'
import { examService } from '@/services/examService'
import { assignmentService } from '@/services/assignmentService'
import { projectService } from '@/services/projectService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CreateExamDialog from '@/components/exams/CreateExamDialog'
import CreateAssignmentDialog from '@/components/assignments/CreateAssignmentDialog'
import CreateProjectDialog from '@/components/projects/CreateProjectDialog'

export default function SubjectDetailPage() {
  const { subjectId } = useParams()

  const { data: subject, isLoading: isLoadingSubject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => subjectService.getById(Number(subjectId)),
    enabled: !!subjectId,
  })

  const { data: exams } = useQuery({
    queryKey: ['exams', 'subject', subjectId],
    queryFn: () => examService.getAll({ subjectId: Number(subjectId) }),
    enabled: !!subjectId,
  })

  const { data: assignments } = useQuery({
    queryKey: ['assignments', 'subject', subjectId],
    queryFn: () => assignmentService.getAll({ subjectId: Number(subjectId) }),
    enabled: !!subjectId,
  })

  const { data: projects } = useQuery({
    queryKey: ['projects', 'subject', subjectId],
    queryFn: () => projectService.getAll({ subjectId: Number(subjectId) }),
    enabled: !!subjectId,
  })

  if (isLoadingSubject) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!subject) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Materia no encontrada</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subject Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{subject.name}</CardTitle>
              {subject.description && (
                <CardDescription className="text-base">{subject.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Exámenes</h2>
          <CreateExamDialog />
        </div>
        {exams && exams.length > 0 ? (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Examen</CardTitle>
                      <CardDescription>{formatDate(exam.date)}</CardDescription>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {exam.user?.name}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{exam.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay exámenes registrados</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assignments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tareas</h2>
          <CreateAssignmentDialog />
        </div>
        {assignments && assignments.length > 0 ? (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Tarea</CardTitle>
                      <CardDescription>Entrega: {formatDate(assignment.dueDate)}</CardDescription>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {assignment.user?.name}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{assignment.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay tareas registradas</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Proyectos</h2>
          <CreateProjectDialog />
        </div>
        {projects && projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Proyecto</CardTitle>
                      <CardDescription>Entrega: {formatDate(project.dueDate)}</CardDescription>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {project.user?.name}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay proyectos registrados</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
