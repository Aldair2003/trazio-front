import { useQuery } from '@tanstack/react-query'
import { assignmentService } from '@/services/assignmentService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, ClipboardList, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CreateAssignmentDialog from '@/components/assignments/CreateAssignmentDialog'
import { useNavigate } from 'react-router-dom'

export default function AssignmentsPage() {
  const navigate = useNavigate()

  // Ahora obtenemos solo MIS tareas (repositorio personal)
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => assignmentService.getMyRepository(),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mis Tareas</h1>
            <p className="text-muted-foreground">Tu repositorio personal de tareas y pendientes</p>
          </div>
        </div>
        <CreateAssignmentDialog />
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : assignments && assignments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => assignment.subject && navigate(`/subjects/${assignment.subjectId}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {assignment.subject?.name || 'Materia'}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Entrega: {formatDate(assignment.dueDate)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                {assignment.student && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Estudiante: {assignment.student.name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No hay tareas registradas aún
            </p>
            <CreateAssignmentDialog />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
