import { useQuery } from '@tanstack/react-query'
import { examService } from '@/services/examService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Calendar, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CreateExamDialog from '@/components/exams/CreateExamDialog'
import { useNavigate } from 'react-router-dom'

export default function ExamsPage() {
  const navigate = useNavigate()

  // Ahora obtenemos solo MIS exámenes (repositorio personal)
  const { data: exams, isLoading } = useQuery({
    queryKey: ['my-exams'],
    queryFn: () => examService.getMyRepository(),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mis Exámenes</h1>
            <p className="text-muted-foreground">Tu repositorio personal de exámenes</p>
          </div>
        </div>
        <CreateExamDialog />
      </div>

      {/* Exams List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : exams && exams.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card
              key={exam.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => exam.subject && navigate(`/subjects/${exam.subjectId}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {exam.subject?.name || 'Materia'}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {formatDate(exam.date)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{exam.description}</p>
                {exam.student && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Estudiante: {exam.student.name}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No hay exámenes registrados aún
            </p>
            <CreateExamDialog />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
