import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { curriculumService } from '@/services/curriculumService'
import { onboardingService } from '@/services/onboardingService'
import { 
  UserRole, 
  type Curriculum, 
  type CurriculumSubject,
  AcademicStatus,
  TrazioGoal,
  TeacherVisibility
} from '@/types'
import { toast } from '@/hooks/use-toast'
import { 
  Users, 
  GraduationCap, 
  ArrowRight,
  Lightbulb,
  LogOut
} from 'lucide-react'

// Importar componentes de pasos
import { StudentSteps } from '@/components/onboarding/StudentSteps'
import { StudentStepsExtra } from '@/components/onboarding/StudentStepsExtra'
import { StudentStepsFinal } from '@/components/onboarding/StudentStepsFinal'
import { TeacherSteps } from '@/components/onboarding/TeacherSteps'

export default function OnboardingPageV2() {
  const navigate = useNavigate()
  const { user, logout, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  
  // Estados del flujo
  const [step, setStep] = useState<'role' | 'student' | 'teacher'>('role')
  const [studentStep, setStudentStep] = useState(1) // 1-10
  const [teacherStep, setTeacherStep] = useState(1) // 1-6

  // Datos del sistema
  const [curriculums, setCurriculums] = useState<Curriculum[]>([])
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null)
  const [semesterSubjects, setSemesterSubjects] = useState<CurriculumSubject[]>([])
  const [allSubjects, setAllSubjects] = useState<CurriculumSubject[]>([])

  // Datos del estudiante
  const [studentData, setStudentData] = useState({
    curriculumId: 0,
    currentSemester: 0,
    birthYear: 0,
    admissionYear: 0,
    academicStatus: AcademicStatus.STUDYING,
    hasDraggedSubjects: false,
    draggedSubjectIds: [] as number[],
    academicInterests: [] as string[],
    trazioGoal: undefined as TrazioGoal | undefined,
    bio: '',
  })

  // Datos del docente
  const [teacherData, setTeacherData] = useState({
    institutionalEmail: '',
    bio: '',
    curriculumIds: [] as number[],
    semesterIds: [] as number[],
    subjectIds: [] as number[],
    visibility: TeacherVisibility.ALL_CAREER,
  })

  // Materias agrupadas por semestre para el docente
  const [teacherSubjectsBySemester, setTeacherSubjectsBySemester] = useState<{ [semester: number]: CurriculumSubject[] }>({})

  useEffect(() => {
    if (user?.profileCompleted) {
      navigate('/feed')
    }
    loadCurriculums()
  }, [user, navigate])

  const loadCurriculums = async () => {
    try {
      const data = await curriculumService.getAllCurriculums()
      setCurriculums(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las mallas curriculares',
        variant: 'destructive',
      })
    }
  }

  const loadSubjectsBySemester = async (curriculumId: number, semester: number) => {
    try {
      const subjects = await curriculumService.getSubjectsBySemester(curriculumId, semester)
      setSemesterSubjects(subjects)
    } catch (error) {
      console.error('Error loading subjects:', error)
    }
  }

  const loadAllSubjects = async (curriculumId: number) => {
    try {
      const subjects = await curriculumService.getAllSubjectsByCurriculum(curriculumId)
      setAllSubjects(subjects)
    } catch (error) {
      console.error('Error loading all subjects:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleRoleSelection = (role: UserRole) => {
    setStep(role === UserRole.STUDENT ? 'student' : 'teacher')
  }

  const handleStudentNext = async () => {
    // Validaciones por paso
    if (studentStep === 1 && !studentData.curriculumId) {
      toast({ title: 'Selecciona una malla curricular', variant: 'destructive' })
      return
    }
    if (studentStep === 3 && !studentData.currentSemester) {
      toast({ title: 'Selecciona tu semestre actual', variant: 'destructive' })
      return
    }
    if (studentStep === 7 && (!studentData.birthYear || !studentData.admissionYear)) {
      toast({ title: 'Completa los datos académicos', variant: 'destructive' })
      return
    }

    // Si está en el paso 3, cargar las materias del semestre
    if (studentStep === 3 && studentData.currentSemester) {
      await loadSubjectsBySemester(studentData.curriculumId, studentData.currentSemester)
    }

    setStudentStep(prev => prev + 1)
  }

  const handleStudentBack = () => {
    setStudentStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmitStudent = async () => {
    // Validación previa antes de enviar
    if (!studentData.curriculumId || studentData.curriculumId === 0) {
      toast({
        title: 'Error de validación',
        description: 'Debes seleccionar una malla curricular',
        variant: 'destructive',
      })
      return
    }

    if (!studentData.currentSemester || studentData.currentSemester === 0) {
      toast({
        title: 'Error de validación',
        description: 'Debes seleccionar tu semestre actual',
        variant: 'destructive',
      })
      return
    }

    if (!studentData.birthYear || studentData.birthYear === 0) {
      toast({
        title: 'Error de validación',
        description: 'Debes ingresar tu año de nacimiento',
        variant: 'destructive',
      })
      return
    }

    if (!studentData.admissionYear || studentData.admissionYear === 0) {
      toast({
        title: 'Error de validación',
        description: 'Debes ingresar tu año de ingreso',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // Convertir explícitamente a números para asegurar el tipo correcto
      const dataToSend = {
        ...studentData,
        curriculumId: Number(studentData.curriculumId),
        currentSemester: Number(studentData.currentSemester),
        birthYear: Number(studentData.birthYear),
        admissionYear: Number(studentData.admissionYear),
        draggedSubjectIds: studentData.draggedSubjectIds.map(id => Number(id)),
      }

      console.log('Enviando datos:', dataToSend)
      
      await onboardingService.completeStudentProfileV2(dataToSend)
      
      toast({
        title: '¡Perfil completado!',
        description: 'Tu perfil de estudiante ha sido configurado exitosamente',
      })

      // Actualizar el usuario con perfil completado
      if (user) {
        setUser({ ...user, profileCompleted: true, role: UserRole.STUDENT })
      }

      navigate('/feed')
    } catch (error) {
      console.error('Error completo:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo completar el perfil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Handlers para materias arrastradas
  const handleToggleHasDragged = (value: boolean) => {
    setStudentData({ ...studentData, hasDraggedSubjects: value, draggedSubjectIds: [] })
  }

  const handleToggleDraggedSubject = (subjectId: number) => {
    const ids = studentData.draggedSubjectIds
    const numericId = Number(subjectId)
    if (ids.includes(numericId)) {
      setStudentData({ ...studentData, draggedSubjectIds: ids.filter(id => id !== numericId) })
    } else {
      setStudentData({ ...studentData, draggedSubjectIds: [...ids, numericId] })
    }
  }

  // Handlers para intereses
  const handleToggleInterest = (interest: string) => {
    const interests = studentData.academicInterests
    if (interests.includes(interest)) {
      setStudentData({ ...studentData, academicInterests: interests.filter(i => i !== interest) })
    } else {
      setStudentData({ ...studentData, academicInterests: [...interests, interest] })
    }
  }

  // ========== HANDLERS PARA DOCENTE ==========
  const handleTeacherNext = async () => {
    // Validaciones por paso
    if (teacherStep === 2 && teacherData.curriculumIds.length === 0) {
      toast({ title: 'Selecciona al menos una malla curricular', variant: 'destructive' })
      return
    }
    if (teacherStep === 3 && teacherData.semesterIds.length === 0) {
      toast({ title: 'Selecciona al menos un semestre', variant: 'destructive' })
      return
    }
    if (teacherStep === 4 && teacherData.subjectIds.length === 0) {
      toast({ title: 'Selecciona al menos una materia', variant: 'destructive' })
      return
    }

    // Si está en el paso 3, cargar las materias de los semestres seleccionados
    if (teacherStep === 3 && teacherData.semesterIds.length > 0 && teacherData.curriculumIds.length > 0) {
      await loadTeacherSubjects()
    }

    setTeacherStep(prev => prev + 1)
  }

  const handleTeacherBack = () => {
    setTeacherStep(prev => Math.max(1, prev - 1))
  }

  const loadTeacherSubjects = async () => {
    try {
      const subjectsBySemester: { [semester: number]: CurriculumSubject[] } = {}
      
      for (const curriculumId of teacherData.curriculumIds) {
        for (const semester of teacherData.semesterIds) {
          const subjects = await curriculumService.getSubjectsBySemester(curriculumId, semester)
          if (!subjectsBySemester[semester]) {
            subjectsBySemester[semester] = []
          }
          subjectsBySemester[semester].push(...subjects)
        }
      }
      
      setTeacherSubjectsBySemester(subjectsBySemester)
    } catch (error) {
      console.error('Error loading teacher subjects:', error)
    }
  }

  const handleSubmitTeacher = async () => {
    setLoading(true)
    try {
      // Validación previa
      if (teacherData.curriculumIds.length === 0) {
        toast({ title: 'Debes seleccionar al menos una malla curricular', variant: 'destructive' })
        setLoading(false)
        return
      }
      
      if (teacherData.subjectIds.length === 0) {
        toast({ title: 'Debes seleccionar al menos una materia', variant: 'destructive' })
        setLoading(false)
        return
      }
      
      // Preparar datos - convertir IDs a números
      const dataToSend: any = {
        curriculumIds: teacherData.curriculumIds.map(id => Number(id)),
        subjectIds: teacherData.subjectIds.map(id => Number(id)),
        visibility: teacherData.visibility,
      }
      
      // Solo agregar campos opcionales si tienen valor
      if (teacherData.institutionalEmail && teacherData.institutionalEmail.trim()) {
        dataToSend.institutionalEmail = teacherData.institutionalEmail.trim()
      }
      
      if (teacherData.bio && teacherData.bio.trim()) {
        dataToSend.bio = teacherData.bio.trim()
      }
      
      await onboardingService.completeTeacherProfileV2(dataToSend)
      
      toast({
        title: '¡Perfil completado!',
        description: 'Tu perfil de docente ha sido configurado exitosamente',
      })

      // Actualizar el usuario con perfil completado
      if (user) {
        setUser({ ...user, profileCompleted: true, role: UserRole.TEACHER })
      }

      navigate('/feed')
    } catch (error) {
      console.error('Error al completar perfil de docente:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo completar el perfil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // ========== RENDERIZADO ==========

  if (step === 'role') {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-4 overflow-hidden">
        <Card className="w-full max-w-4xl shadow-2xl max-h-[95vh] overflow-y-auto relative">
          {/* Botón de cerrar sesión */}
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
          </button>

          <CardHeader className="text-center space-y-2 sm:space-y-3 py-4 sm:py-6">
            <div className="flex justify-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg">
                <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ¡Bienvenido a TRAZIO!
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 px-2">
              Tu plataforma académica para documentar tu trayectoria universitaria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 pb-6 px-4 sm:px-6">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-1 sm:mb-2">
                Selecciona tu rol para comenzar
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Esta configuración es obligatoria y solo se realiza una vez
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <button
                onClick={() => handleRoleSelection(UserRole.STUDENT)}
                className="group relative p-4 sm:p-6 lg:p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center space-y-2 sm:space-y-3">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl sm:rounded-2xl group-hover:scale-110 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all duration-300 shadow-lg">
                    <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    Estudiante
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                    Registra tu progreso académico, conecta con tus docentes y documenta tu trayectoria
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Comenzar
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelection(UserRole.TEACHER)}
                className="group relative p-4 sm:p-6 lg:p-8 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center space-y-2 sm:space-y-3">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl sm:rounded-2xl group-hover:scale-110 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 shadow-lg">
                    <Users className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    Docente
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 text-center leading-relaxed">
                    Conecta con tus estudiantes, gestiona tus materias y haz seguimiento académico
                  </p>
                  <div className="flex items-center text-indigo-600 font-medium text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Comenzar
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </div>
                </div>
              </button>
            </div>

            <div className="p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800 text-center flex items-center justify-center gap-2">
                <Lightbulb className="h-4 w-4 flex-shrink-0" />
                <span><span className="font-semibold">Recuerda:</span> Este paso es obligatorio y define tu experiencia en TRAZIO</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ========== FLUJO DE ESTUDIANTE ==========
  if (step === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 py-8 relative">
        {/* Botón de cerrar sesión */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors group shadow-md z-10"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
        </button>

        <div className="max-w-5xl mx-auto">
          {/* Header con logo y título */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Configuración de Estudiante</h1>
            </div>
          </div>

          {/* Indicador de progreso mejorado */}
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  Paso {studentStep} de 10
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {studentStep === 1 && 'Selección de malla curricular'}
                  {studentStep === 2 && 'Confirmación de datos'}
                  {studentStep === 3 && 'Selección de semestre'}
                  {studentStep === 4 && 'Materias asignadas'}
                  {studentStep === 5 && 'Materias arrastradas'}
                  {studentStep === 6 && 'Asignación de docentes'}
                  {studentStep === 7 && 'Datos personales'}
                  {studentStep === 8 && 'Intereses académicos'}
                  {studentStep === 9 && 'Tu objetivo en TRAZIO'}
                  {studentStep === 10 && 'Confirmación final'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  {Math.round((studentStep / 10) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(studentStep / 10) * 100}%` }}
              />
            </div>
            
            {/* Mini indicadores visuales */}
            <div className="grid grid-cols-10 gap-2 mt-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i + 1 < studentStep
                      ? 'bg-green-500'
                      : i + 1 === studentStep
                      ? 'bg-blue-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <Card className="shadow-xl">
            <CardContent className="pt-8 pb-8">
              {/* PASO 1: Selección de malla */}
              {studentStep === 1 && (
                <StudentSteps.Step1
                  curriculums={curriculums}
                  selectedCurriculumId={studentData.curriculumId}
                  onSelect={(curriculum) => {
                    setStudentData({ ...studentData, curriculumId: Number(curriculum.id) })
                    setSelectedCurriculum(curriculum)
                    loadAllSubjects(Number(curriculum.id))
                  }}
                  onNext={handleStudentNext}
                  onBack={() => setStep('role')}
                />
              )}

              {/* PASO 2: Contexto académico */}
              {studentStep === 2 && selectedCurriculum && (
                <StudentSteps.Step2
                  curriculum={selectedCurriculum}
                  onNext={handleStudentNext}
                  onBack={handleStudentBack}
                />
              )}

              {/* PASO 3: Selección de semestre */}
              {studentStep === 3 && (
                <StudentSteps.Step3
                  currentSemester={studentData.currentSemester}
                  onSelect={(semester) => {
                    setStudentData({ ...studentData, currentSemester: Number(semester) })
                  }}
                  onNext={handleStudentNext}
                  onBack={handleStudentBack}
                />
              )}

              {/* PASO 4: Materias asignadas */}
              {studentStep === 4 && (
                <StudentSteps.Step4
                  subjects={semesterSubjects}
                  onNext={handleStudentNext}
                  onBack={handleStudentBack}
                />
              )}

              {/* PASO 5: Materias arrastradas */}
              {studentStep === 5 && (
                <StudentStepsExtra.Step5
                  allSubjects={allSubjects}
                  currentSemester={studentData.currentSemester}
                  hasDraggedSubjects={studentData.hasDraggedSubjects}
                  draggedSubjectIds={studentData.draggedSubjectIds}
                  onToggleHasDragged={handleToggleHasDragged}
                  onToggleSubject={handleToggleDraggedSubject}
                  onNext={handleStudentNext}
                  onBack={handleStudentBack}
                />
              )}

              {/* PASO 6: Asignación de docentes */}
              {studentStep === 6 && (
                <StudentStepsExtra.Step6
                  onNext={handleStudentNext}
                  onBack={handleStudentBack}
                />
              )}

              {/* PASO 7: Datos personales */}
              {studentStep === 7 && (
                <StudentStepsExtra.Step7
                  birthYear={studentData.birthYear}
                  admissionYear={studentData.admissionYear}
                  academicStatus={studentData.academicStatus}
                  onChangebirthYear={(value: number) => setStudentData({ ...studentData, birthYear: Number(value) })}
                  onChangeAdmissionYear={(value: number) => setStudentData({ ...studentData, admissionYear: Number(value) })}
                  onChangeStatus={(value) => setStudentData({ ...studentData, academicStatus: value })}
                  onNext={handleStudentNext}
                  onBack={handleStudentBack}
                />
              )}

              {/* PASO 8: Intereses académicos */}
              {studentStep === 8 && (
                <StudentStepsFinal.Step8
                  selectedInterests={studentData.academicInterests}
                  onToggleInterest={handleToggleInterest}
                  onNext={handleStudentNext}
                  onBack={handleStudentBack}
                />
              )}

              {/* PASO 9: Objetivo en TRAZIO */}
              {studentStep === 9 && (
                <StudentStepsFinal.Step9
                  selectedGoal={studentData.trazioGoal}
                  onSelectGoal={(goal) => setStudentData({ ...studentData, trazioGoal: goal })}
                  onNext={handleStudentNext}
                  onBack={handleStudentBack}
                />
              )}

              {/* PASO 10: Confirmación */}
              {studentStep === 10 && (
                <StudentStepsFinal.Step10
                  bio={studentData.bio}
                  onChangeBio={(value) => setStudentData({ ...studentData, bio: value })}
                  onSubmit={handleSubmitStudent}
                  onBack={handleStudentBack}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>

          {/* Footer informativo */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda? Todos los datos pueden ser editados después desde tu perfil
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ========== FLUJO DE DOCENTE ==========
  if (step === 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 py-8 relative">
        {/* Botón de cerrar sesión */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors group shadow-md z-10"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
        </button>

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Configuración de Docente</h1>
            </div>
          </div>

          {/* Indicador de progreso */}
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  Paso {teacherStep} de 6
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {teacherStep === 1 && 'Contexto académico'}
                  {teacherStep === 2 && 'Mallas curriculares'}
                  {teacherStep === 3 && 'Semestres'}
                  {teacherStep === 4 && 'Materias que impartes'}
                  {teacherStep === 5 && 'Preferencias de visibilidad'}
                  {teacherStep === 6 && 'Confirmación final'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-indigo-600">
                  {Math.round((teacherStep / 6) * 100)}%
                </span>
              </div>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(teacherStep / 6) * 100}%` }}
              />
            </div>
            
            {/* Mini indicadores */}
            <div className="grid grid-cols-6 gap-2 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i + 1 < teacherStep
                      ? 'bg-green-500'
                      : i + 1 === teacherStep
                      ? 'bg-indigo-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <Card className="shadow-xl">
            <CardContent className="pt-8 pb-8">
              {/* PASO 1: Contexto académico */}
              {teacherStep === 1 && (
                <TeacherSteps.Step1
                  institutionalEmail={teacherData.institutionalEmail}
                  bio={teacherData.bio}
                  onChangeEmail={(value) => setTeacherData({ ...teacherData, institutionalEmail: value })}
                  onChangeBio={(value) => setTeacherData({ ...teacherData, bio: value })}
                  onNext={handleTeacherNext}
                  onBack={() => setStep('role')}
                />
              )}

              {/* PASO 2: Mallas curriculares */}
              {teacherStep === 2 && (
                <TeacherSteps.Step2
                  curriculums={curriculums}
                  selectedCurriculumIds={teacherData.curriculumIds}
                  onToggleCurriculum={(id) => {
                    const ids = teacherData.curriculumIds
                    if (ids.includes(id)) {
                      setTeacherData({ ...teacherData, curriculumIds: ids.filter(cid => cid !== id) })
                    } else {
                      setTeacherData({ ...teacherData, curriculumIds: [...ids, id] })
                    }
                  }}
                  onNext={handleTeacherNext}
                  onBack={handleTeacherBack}
                />
              )}

              {/* PASO 3: Semestres */}
              {teacherStep === 3 && (
                <TeacherSteps.Step3
                  totalSemesters={8}
                  selectedSemesters={teacherData.semesterIds}
                  onToggleSemester={(semester) => {
                    const semesters = teacherData.semesterIds
                    if (semesters.includes(semester)) {
                      setTeacherData({ ...teacherData, semesterIds: semesters.filter(s => s !== semester) })
                    } else {
                      setTeacherData({ ...teacherData, semesterIds: [...semesters, semester] })
                    }
                  }}
                  onNext={handleTeacherNext}
                  onBack={handleTeacherBack}
                />
              )}

              {/* PASO 4: Materias */}
              {teacherStep === 4 && (
                <TeacherSteps.Step4
                  subjectsBySemester={teacherSubjectsBySemester}
                  selectedSubjectIds={teacherData.subjectIds}
                  onToggleSubject={(subjectId) => {
                    const ids = teacherData.subjectIds
                    if (ids.includes(subjectId)) {
                      setTeacherData({ ...teacherData, subjectIds: ids.filter(id => id !== subjectId) })
                    } else {
                      setTeacherData({ ...teacherData, subjectIds: [...ids, subjectId] })
                    }
                  }}
                  onNext={handleTeacherNext}
                  onBack={handleTeacherBack}
                />
              )}

              {/* PASO 5: Visibilidad */}
              {teacherStep === 5 && (
                <TeacherSteps.Step5
                  visibility={teacherData.visibility}
                  onChangeVisibility={(value) => setTeacherData({ ...teacherData, visibility: value })}
                  onNext={handleTeacherNext}
                  onBack={handleTeacherBack}
                />
              )}

              {/* PASO 6: Confirmación */}
              {teacherStep === 6 && (
                <TeacherSteps.Step6
                  selectedSubjectsCount={teacherData.subjectIds.length}
                  onSubmit={handleSubmitTeacher}
                  onBack={handleTeacherBack}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda? Todos los datos pueden ser editados después desde tu perfil
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
