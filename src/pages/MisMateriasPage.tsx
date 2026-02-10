import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { profileService } from '@/services/profileService'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  FolderOpen, 
  User, 
  Plus,
  ChevronRight,
  GraduationCap
} from 'lucide-react'
import { UserRole } from '@/types'

interface StudentSubjectRelation {
  id: number
  studentId: number
  teacherId: number
  curriculumSubjectId: number
  semester: number
  isActive: boolean
  teacher?: {
    id: number
    name: string
    email: string
  }
  curriculumSubject?: {
    id: number
    name: string
    code?: string
    semester: number
  }
}

interface ProfileData {
  id: number
  name: string
  email: string
  role: UserRole
  profile?: {
    currentSemester: number
    curriculumId: number
    curriculum?: {
      name: string
      university: string
      career: string
    }
  }
  currentSubjects?: StudentSubjectRelation[]
}

export default function MisMateriasPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: profileData, isLoading } = useQuery<ProfileData>({
    queryKey: ['profile', 'me'],
    queryFn: () => profileService.getMyProfile(),
    enabled: user?.role === UserRole.STUDENT,
  })

  // Verificar que sea estudiante
  if (user?.role !== UserRole.STUDENT) {
    navigate('/feed')
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  const currentSubjects = profileData?.currentSubjects || []
  const currentSemester = profileData?.profile?.currentSemester || 1
  const curriculum = profileData?.profile?.curriculum

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Mis Materias</h1>
            {curriculum && (
              <p className="text-sm text-muted-foreground">
                {curriculum.career} • Semestre {currentSemester} • {curriculum.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Materias del semestre actual */}
      {currentSubjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tienes materias registradas</h3>
            <p className="text-muted-foreground mb-4">
              Completa tu onboarding para agregar tus materias del semestre
            </p>
            <Button asChild>
              <Link to="/onboarding">Completar perfil</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSubjects.map((relation) => (
            <SubjectCard key={relation.id} relation={relation} />
          ))}
        </div>
      )}

      {/* Leyenda de acciones rápidas */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-none">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            ¿Qué puedes documentar?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Exámenes</p>
                <p className="text-xs text-muted-foreground">Documenta tus parciales</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <ClipboardList className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Tareas</p>
                <p className="text-xs text-muted-foreground">Registra tus entregas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FolderOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Proyectos</p>
                <p className="text-xs text-muted-foreground">Muestra tu trabajo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface SubjectCardProps {
  relation: StudentSubjectRelation
}

function SubjectCard({ relation }: SubjectCardProps) {
  const subject = relation.curriculumSubject
  const teacher = relation.teacher

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {subject?.name || 'Materia'}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {subject?.code && (
                <Badge variant="outline" className="text-xs">
                  {subject.code}
                </Badge>
              )}
              <span>Semestre {subject?.semester || relation.semester}</span>
            </CardDescription>
          </div>
          <Badge variant={relation.isActive ? 'default' : 'secondary'}>
            {relation.isActive ? 'Activa' : 'Completada'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Docente asignado */}
        {teacher && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Prof. {teacher.name}
            </span>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/exams?curriculumSubjectId=${relation.curriculumSubjectId}`}>
              <Calendar className="h-4 w-4 mr-1" />
              Exámenes
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/assignments?curriculumSubjectId=${relation.curriculumSubjectId}`}>
              <ClipboardList className="h-4 w-4 mr-1" />
              Tareas
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/projects?curriculumSubjectId=${relation.curriculumSubjectId}`}>
              <FolderOpen className="h-4 w-4 mr-1" />
              Proyectos
            </Link>
          </Button>
        </div>

        {/* Ver más */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 group-hover:bg-primary/10"
          asChild
        >
          <Link to={`/feed?curriculumSubjectId=${relation.curriculumSubjectId}`}>
            Ver publicaciones de esta materia
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
