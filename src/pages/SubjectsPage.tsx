import { useQuery } from '@tanstack/react-query'
import { subjectService } from '@/services/subjectService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, BookOpen } from 'lucide-react'
import CreateSubjectDialog from '@/components/subjects/CreateSubjectDialog'
import { useNavigate } from 'react-router-dom'

export default function SubjectsPage() {
  const navigate = useNavigate()

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectService.getAll(),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Materias</h1>
            <p className="text-muted-foreground">Explora todas las materias disponibles</p>
          </div>
        </div>
        <CreateSubjectDialog />
      </div>

      {/* Subjects List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : subjects && subjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/subjects/${subject.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {subject.name}
                </CardTitle>
                {subject.description && (
                  <CardDescription className="mt-2">{subject.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click para ver detalles, exámenes, tareas y proyectos
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No hay materias registradas aún
            </p>
            <CreateSubjectDialog />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
