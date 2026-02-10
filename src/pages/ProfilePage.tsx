import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { profileService } from '@/services/profileService'
import { postService } from '@/services/postService'
import { examService } from '@/services/examService'
import { assignmentService } from '@/services/assignmentService'
import { projectService } from '@/services/projectService'
import PostCard from '@/components/posts/PostCard'
import CreatePostDialog from '@/components/posts/CreatePostDialog'
import EditProfileDialog from '@/components/profile/EditProfileDialog'
import ProfileImageUpload from '@/components/profile/ProfileImageUpload'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Mail, 
  Calendar, 
  BookOpen, 
  GraduationCap,
  User,
  Target,
  Heart,
  Users,
  Award,
  Briefcase,
  FileText,
  FolderOpen,
  ClipboardList,
  ExternalLink,
  Star,
  ChevronRight,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/authStore'
import type { UserRole, AcademicStatus, TrazioGoal, TeacherVisibility, Highlight, Post, Exam, Assignment, Project } from '@/types'
import { Button } from '@/components/ui/button'

// Interfaces locales para tipado
interface StudentSubjectRelation {
  id: number
  studentId: number
  teacherId: number
  curriculumSubjectId: number
  semester: number
  isActive: boolean
  isDragged?: boolean
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

interface TeacherSubjectRelation {
  id: number
  curriculumSubject?: {
    id: number
    name: string
    semester?: number
    curriculum?: {
      name: string
    }
  }
  studentCount?: number
}

// Mapeos de traducción
const ACADEMIC_STATUS_LABELS: Record<AcademicStatus, string> = {
  studying: 'Cursando',
  graduated: 'Graduado',
}

const TRAZIO_GOAL_LABELS: Record<TrazioGoal, string> = {
  document: 'Documentar mi trayectoria',
  collaborate: 'Trabajos colaborativos',
  portfolio: 'Portafolio académico',
  track_progress: 'Seguimiento del progreso',
}

const TRAZIO_GOAL_ICONS: Record<TrazioGoal, React.ComponentType<{ className?: string }>> = {
  document: BookOpen,
  collaborate: Users,
  portfolio: Briefcase,
  track_progress: Award,
}

const VISIBILITY_LABELS: Record<TeacherVisibility, string> = {
  my_students: 'Solo mis estudiantes',
  all_career: 'Toda la carrera',
  highlighted: 'Aportes destacados',
}

// Componente para mostrar trabajos destacados
function HighlightedWorksSection({ userId, isOwnProfile }: { userId: number; isOwnProfile: boolean }) {
  // Obtener posts destacados donde este usuario es el autor
  const { data: highlightedPosts = [], isLoading } = useQuery({
    queryKey: ['user-highlighted-posts', userId],
    queryFn: async () => {
      // Obtenemos los posts del usuario y filtramos los que tienen highlights
      const posts = await postService.getUserPosts(userId)
      return posts.filter((post: Post) => post.highlights && post.highlights.length > 0)
    },
    enabled: !!userId,
  })

  if (isLoading || highlightedPosts.length === 0) {
    return null
  }

  return (
    <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          {isOwnProfile ? 'Mis Trabajos Destacados' : `Trabajos Destacados`}
        </CardTitle>
        <CardDescription>
          {highlightedPosts.length} trabajo{highlightedPosts.length !== 1 ? 's' : ''} destacado{highlightedPosts.length !== 1 ? 's' : ''} por docentes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {highlightedPosts.slice(0, 3).map((post: Post) => (
            <div 
              key={post.id} 
              className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-yellow-100 dark:border-yellow-900/30"
            >
              <p className="text-sm font-medium line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-2 mt-2">
                {post.highlights?.map((h: Highlight) => (
                  <Link 
                    key={h.id}
                    to={`/profile/${h.teacherId}`}
                    className="flex items-center gap-1 text-xs text-yellow-700 dark:text-yellow-400 hover:underline"
                  >
                    <Star className="h-3 w-3 fill-current" />
                    {h.teacher?.name || 'Docente'}
                  </Link>
                ))}
              </div>
              {post.highlights?.[0]?.comment && (
                <p className="text-xs italic text-muted-foreground mt-2">
                  "{post.highlights[0].comment}"
                </p>
              )}
            </div>
          ))}
        </div>
        {highlightedPosts.length > 3 && (
          <Button variant="ghost" size="sm" className="w-full mt-3" asChild>
            <Link to={`/feed?userId=${userId}`}>
              Ver todos los destacados
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { userId: paramUserId } = useParams<{ userId: string }>()
  const { user: currentUser } = useAuthStore()
  
  // Si no hay userId en params, usar el del usuario actual
  const userId = paramUserId ? parseInt(paramUserId) : currentUser?.id
  const isOwnProfile = !paramUserId || parseInt(paramUserId) === currentUser?.id

  // Obtener perfil del usuario
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => isOwnProfile 
      ? profileService.getMyProfile() 
      : profileService.getPublicProfile(userId!),
    enabled: !!userId,
  })

  // Obtener publicaciones del usuario
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => postService.getUserPosts(userId!),
    enabled: !!userId,
  })

  // Obtener repositorio académico del usuario
  const { data: exams = [], isLoading: examsLoading } = useQuery({
    queryKey: ['user-exams', userId],
    queryFn: () => isOwnProfile 
      ? examService.getMyRepository() 
      : examService.getUserRepository(userId!),
    enabled: !!userId,
  })

  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['user-assignments', userId],
    queryFn: () => isOwnProfile 
      ? assignmentService.getMyRepository() 
      : assignmentService.getUserRepository(userId!),
    enabled: !!userId,
  })

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['user-projects', userId],
    queryFn: () => isOwnProfile 
      ? projectService.getMyRepository() 
      : projectService.getUserRepository(userId!),
    enabled: !!userId,
  })

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Perfil no encontrado</p>
      </div>
    )
  }

  const initials = profile.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Columna izquierda - Info del perfil */}
        <div className="lg:col-span-1 space-y-3">
          {/* Card principal del perfil - Más compacto */}
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 px-3">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-primary/10">
                    <AvatarImage 
                      src={profile.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} 
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {isOwnProfile && <ProfileImageUpload currentImage={profile.profileImage} />}
                </div>
                
                <div className="w-full">
                  <h1 className="text-lg font-bold truncate">{profile.name}</h1>
                  <Badge variant={profile.role === 'student' ? 'default' : 'secondary'} className="mt-1.5 flex items-center gap-1 w-fit mx-auto text-xs">
                    {profile.role === 'student' ? (
                      <>
                        <GraduationCap className="h-3 w-3" />
                        <span>Estudiante</span>
                      </>
                    ) : (
                      <>
                        <Users className="h-3 w-3" />
                        <span>Docente</span>
                      </>
                    )}
                  </Badge>
                </div>

                {isOwnProfile && (
                  <div className="w-full">
                    <EditProfileDialog 
                      currentProfile={profile.profile} 
                      role={profile.role as UserRole}
                    />
                  </div>
                )}

                <div className="w-full space-y-1.5 text-xs text-muted-foreground">
                  {profile.email && (
                    <div className="flex items-center gap-1.5 justify-center">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate text-xs">{profile.email}</span>
                    </div>
                  )}
                  {profile.registrationDate && (
                    <div className="flex items-center gap-1.5 justify-center">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-xs">Desde {formatDate(profile.registrationDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de información académica - ESTUDIANTE - Más compacto */}
          {profile.role === 'student' && profile.profile && (
            <>
              <Card className="shadow-sm">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Información Académica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 px-3 pb-3">
                  {/* Malla curricular */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Malla Curricular</p>
                    <p className="text-sm font-medium leading-tight mt-0.5">{profile.profile.curriculum?.name || 'No especificada'}</p>
                  </div>

                  {/* Semestre actual */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Semestre Actual</p>
                    <Badge variant="outline" className="mt-0.5 text-xs">
                      Semestre {profile.profile.currentSemester}
                    </Badge>
                  </div>

                  {/* Estado académico */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Estado</p>
                    <p className="text-sm mt-0.5">{ACADEMIC_STATUS_LABELS[profile.profile.academicStatus as AcademicStatus]}</p>
                  </div>

                  {/* Año de ingreso */}
                  {profile.profile.admissionYear && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Año de Ingreso</p>
                      <p className="text-sm mt-0.5">{profile.profile.admissionYear}</p>
                    </div>
                  )}

                  {/* Biografía */}
                  {profile.profile.bio && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">Sobre mí</p>
                      <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{profile.profile.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Intereses académicos - Más compacto */}
              {profile.profile.academicInterests && profile.profile.academicInterests.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Intereses Académicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {profile.profile.academicInterests.map((interest: string) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Objetivo en TRAZIO - Más compacto */}
              {profile.profile.trazioGoal && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Mi Objetivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = TRAZIO_GOAL_ICONS[profile.profile.trazioGoal as TrazioGoal]
                        return <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      })()}
                      <p className="text-xs font-medium">
                        {TRAZIO_GOAL_LABELS[profile.profile.trazioGoal as TrazioGoal]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Materias actuales - Más compacto */}
              {profile.currentSubjects && profile.currentSubjects.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Materias Actuales
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {profile.currentSubjects.length} materia{profile.currentSubjects.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="space-y-2">
                      {profile.currentSubjects.slice(0, 4).map((relation: StudentSubjectRelation) => (
                        <div key={relation.id} className="p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors">
                          <p className="font-medium text-xs leading-tight">{relation.curriculumSubject?.name || 'Materia'}</p>
                          {relation.teacher && (
                            <Link 
                              to={`/profile/${relation.teacher.id}`}
                              className="text-xs text-muted-foreground mt-0.5 hover:text-primary hover:underline flex items-center gap-1"
                            >
                              <Users className="h-3 w-3" />
                              <span className="truncate">{relation.teacher.name}</span>
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          )}
                          {relation.isDragged && (
                            <Badge variant="outline" className="mt-1 text-[10px] h-5">
                              Arrastrada
                            </Badge>
                          )}
                        </div>
                      ))}
                      {profile.currentSubjects.length > 4 && (
                        <p className="text-xs text-muted-foreground text-center pt-1">
                          +{profile.currentSubjects.length - 4} más
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trabajos Destacados por Docentes */}
              <HighlightedWorksSection userId={userId!} isOwnProfile={isOwnProfile} />
            </>
          )}

          {/* Card de información académica - DOCENTE - Más compacto */}
          {profile.role === 'teacher' && profile.profile && (
            <>
              <Card className="shadow-sm">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información Profesional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email institucional */}
                  {profile.profile.institutionalEmail && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Email Institucional</p>
                      <p className="text-sm">{profile.profile.institutionalEmail}</p>
                    </div>
                  )}

                  {/* Biografía profesional */}
                  {profile.profile.bio && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Sobre mí</p>
                      <p className="text-sm text-gray-700 mt-1">{profile.profile.bio}</p>
      </div>
                  )}

                  {/* Visibilidad */}
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Visibilidad</p>
                    <Badge variant="outline" className="mt-1">
                      {VISIBILITY_LABELS[profile.profile.visibility as TeacherVisibility]}
                    </Badge>
          </div>
        </CardContent>
      </Card>

              {/* Materias que imparte */}
              {profile.subjects && profile.subjects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Materias que Imparte
                    </CardTitle>
                    <CardDescription>
                      {profile.subjects.length} materia{profile.subjects.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.subjects.map((ts: TeacherSubjectRelation) => (
                        <div key={ts.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{ts.curriculumSubject?.name || 'Materia'}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {ts.curriculumSubject?.curriculum?.name || 'Malla'} - Semestre {ts.curriculumSubject?.semester}
                              </p>
            </div>
                            {ts.studentCount !== undefined && (
                              <Badge variant="secondary" className="shrink-0">
                                {ts.studentCount} estudiantes
                              </Badge>
                            )}
                </div>
              </div>
                      ))}
            </div>
                  </CardContent>
                </Card>
              )}
            </>
            )}
          </div>

        {/* Columna derecha - Contenido (publicaciones, etc.) - Ocupa más espacio */}
        <div className="lg:col-span-3 space-y-4">
          {isOwnProfile && (
            <CreatePostDialog />
          )}

          <Card className="p-4">
          <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="posts">Publicaciones</TabsTrigger>
                <TabsTrigger value="repository">Repositorio Académico</TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-3 mt-4">
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : posts.length === 0 ? (
                <Card className="shadow-sm">
                  <CardContent className="py-8 text-center">
                    <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {isOwnProfile 
                        ? 'Aún no has publicado nada. ¡Comparte tu progreso académico!'
                        : 'Este usuario aún no ha publicado nada.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post: Post) => (
                  <PostCard key={post.id} post={post} />
                ))
          )}
        </TabsContent>

        <TabsContent value="repository" className="space-y-4 mt-4">
              {/* Sección de Exámenes - Más compacto */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 pt-4 px-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Exámenes {isOwnProfile ? '(Míos)' : `(de ${profile.name})`}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {exams.length} examen{exams.length !== 1 ? 'es' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {examsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : exams.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isOwnProfile ? 'No has registrado exámenes aún' : 'No hay exámenes registrados'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {exams.map((exam: Exam) => (
                        <div key={exam.id} className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{exam.title || 'Examen'}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {exam.curriculumSubject?.name || 'Materia'} - {formatDate(exam.date)}
                              </p>
                              {exam.description && (
                                <p className="text-xs text-muted-foreground mt-1">{exam.description}</p>
                              )}
                              {exam.grade && (
                                <Badge variant="outline" className="mt-2">
                                  Nota: {exam.grade}
                                </Badge>
                              )}
                              {exam.attachments && exam.attachments.length > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                                  <ExternalLink className="h-3 w-3" />
                                  {exam.attachments.length} archivo{exam.attachments.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                            <Badge variant={exam.status === 'completed' ? 'default' : 'secondary'}>
                              {exam.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sección de Tareas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Tareas {isOwnProfile ? '(Mías)' : `(de ${profile.name})`}
                  </CardTitle>
                  <CardDescription>
                    {assignments.length} tarea{assignments.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {assignmentsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : assignments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isOwnProfile ? 'No has registrado tareas aún' : 'No hay tareas registradas'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((assignment: Assignment) => (
                        <div key={assignment.id} className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{assignment.title || 'Tarea'}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {assignment.curriculumSubject?.name || 'Materia'} - Entrega: {formatDate(assignment.dueDate)}
                              </p>
                              {assignment.description && (
                                <p className="text-xs text-muted-foreground mt-1">{assignment.description}</p>
                              )}
                              {assignment.grade && (
                                <Badge variant="outline" className="mt-2">
                                  Nota: {assignment.grade}
                                </Badge>
                              )}
                              {assignment.attachments && assignment.attachments.length > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                                  <ExternalLink className="h-3 w-3" />
                                  {assignment.attachments.length} archivo{assignment.attachments.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                            <Badge variant={assignment.status === 'submitted' ? 'default' : 'secondary'}>
                              {assignment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sección de Proyectos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    Proyectos {isOwnProfile ? '(Míos)' : `(de ${profile.name})`}
                  </CardTitle>
                  <CardDescription>
                    {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {projectsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isOwnProfile ? 'No has registrado proyectos aún' : 'No hay proyectos registrados'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {projects.map((project: Project) => (
                        <div key={project.id} className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{project.title || 'Proyecto'}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {project.curriculumSubject?.name || 'Materia'} - Entrega: {formatDate(project.dueDate)}
                              </p>
                              {project.description && (
                                <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                              )}
                              {project.grade && (
                                <Badge variant="outline" className="mt-2">
                                  Nota: {project.grade}
                                </Badge>
                              )}
                              {project.attachments && project.attachments.length > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                                  <ExternalLink className="h-3 w-3" />
                                  {project.attachments.length} archivo{project.attachments.length !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                            <Badge variant={project.status === 'submitted' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
      </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
