import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { profileService } from '@/services/profileService'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  GraduationCap, 
  Users, 
  FileText,
  Plus,
  ChevronRight,
  BookOpen,
  BarChart3
} from 'lucide-react'
import { UserRole, type CurriculumSubject, type Curriculum } from '@/types'

interface TeacherSubjectData {
  id: number
  teacherId: number
  curriculumSubjectId: number
  isActive: boolean
  studentCount?: number
  curriculumSubject?: CurriculumSubject & {
    curriculum?: Curriculum
  }
}

interface TeacherProfileData {
  id: number
  name: string
  email: string
  role: UserRole
  profile?: {
    institutionalEmail?: string
    bio?: string
  }
  subjects?: TeacherSubjectData[]
}

export default function MisClasesPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: profileData, isLoading } = useQuery<TeacherProfileData>({
    queryKey: ['profile', 'me'],
    queryFn: () => profileService.getMyProfile(),
    enabled: user?.role === UserRole.TEACHER,
  })

  // Verificar que sea docente
  if (user?.role !== UserRole.TEACHER) {
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
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  const subjects = profileData?.subjects || []

  // Calcular estadísticas totales
  const totalStudents = subjects.reduce((acc, s) => acc + (s.studentCount || 0), 0)
  const activeSubjects = subjects.filter(s => s.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Mis Clases</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus materias y estudiantes
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSubjects}</p>
                <p className="text-xs text-muted-foreground">Materias activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Estudiantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Recursos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Publicaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de materias */}
      {subjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tienes materias asignadas</h3>
            <p className="text-muted-foreground mb-4">
              Completa tu perfil para agregar las materias que impartes
            </p>
            <Button asChild>
              <Link to="/onboarding">Completar perfil</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Materias que impartes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <TeacherSubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </div>
      )}

      {/* Acción rápida para publicar recurso */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-none">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Plus className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Compartir recurso educativo</h3>
                <p className="text-sm text-muted-foreground">
                  Comparte material de estudio con tus estudiantes
                </p>
              </div>
            </div>
            <Button asChild>
              <Link to="/feed">
                Ir al Feed
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface TeacherSubjectCardProps {
  subject: TeacherSubjectData
}

function TeacherSubjectCard({ subject }: TeacherSubjectCardProps) {
  const currSubject = subject.curriculumSubject
  const curriculum = currSubject?.curriculum

  return (
    <Card className="hover:shadow-md transition-shadow group h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base group-hover:text-primary transition-colors truncate">
              {currSubject?.name || 'Materia'}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
              {currSubject?.code && (
                <Badge variant="outline" className="text-xs">
                  {currSubject.code}
                </Badge>
              )}
              <span>Semestre {currSubject?.semester}</span>
              {curriculum && (
                <>
                  <span>•</span>
                  <span className="truncate">{curriculum.name}</span>
                </>
              )}
            </CardDescription>
          </div>
          <Badge variant={subject.isActive ? 'default' : 'secondary'} className="shrink-0">
            {subject.isActive ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Estudiantes */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">{subject.studentCount || 0} estudiantes</p>
            <p className="text-xs text-muted-foreground">inscritos en esta materia</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 mt-auto">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/feed?curriculumSubjectId=${subject.curriculumSubjectId}`}>
              <BookOpen className="h-4 w-4 mr-1" />
              Ver publicaciones
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
