import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Curriculum,
  CurriculumSubject,
  TeacherVisibility 
} from '@/types'
import { 
  Building2,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Calendar,
  Eye,
  Sparkles,
  Lightbulb
} from 'lucide-react'

// ========== PASO 1: Contexto Académico ==========
interface Step1Props {
  institutionalEmail: string
  bio: string
  onChangeEmail: (value: string) => void
  onChangeBio: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export function TeacherStep1_Context({
  institutionalEmail,
  bio,
  onChangeEmail,
  onChangeBio,
  onNext,
  onBack,
}: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Building2 className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold">Contexto Académico</h2>
        <p className="text-gray-600 mt-2">Confirma tu información institucional</p>
      </div>

      {/* Datos confirmados automáticamente */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4 text-indigo-900">Datos Institucionales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Universidad</p>
            <p className="font-semibold text-gray-900">PUCE Manabí</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">Carrera</p>
            <p className="font-semibold text-gray-900">Ingeniería de Software</p>
          </div>
        </div>
      </div>

      {/* Datos opcionales */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="institutionalEmail">Correo Institucional (opcional)</Label>
          <Input
            id="institutionalEmail"
            type="email"
            value={institutionalEmail}
            onChange={(e) => onChangeEmail(e.target.value)}
            placeholder="ejemplo@pucesm.edu.ec"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="bio">Descripción Profesional (opcional)</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => onChangeBio(e.target.value)}
            placeholder="Cuéntanos sobre tu experiencia docente..."
            rows={4}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Volver
        </Button>
        <Button onClick={onNext} className="flex-1" size="lg">
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ========== PASO 2: Selección de Mallas ==========
interface Step2Props {
  curriculums: Curriculum[]
  selectedCurriculumIds: number[]
  onToggleCurriculum: (id: number) => void
  onNext: () => void
  onBack: () => void
}

export function TeacherStep2_Curriculums({
  curriculums,
  selectedCurriculumIds,
  onToggleCurriculum,
  onNext,
  onBack,
}: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <BookOpen className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold">Mallas Curriculares</h2>
        <p className="text-gray-600 mt-2">Selecciona las mallas en las que dictas clases</p>
      </div>

      <div className="space-y-4">
        {curriculums.map((curriculum) => (
          <label
            key={curriculum.id}
            className="flex items-start gap-4 p-6 border-2 rounded-xl cursor-pointer hover:border-indigo-300 transition-all"
            style={{
              borderColor: selectedCurriculumIds.includes(curriculum.id) ? '#6366f1' : '#e5e7eb',
              backgroundColor: selectedCurriculumIds.includes(curriculum.id) ? '#eef2ff' : 'white'
            }}
          >
            <Checkbox
              checked={selectedCurriculumIds.includes(curriculum.id)}
              onCheckedChange={() => onToggleCurriculum(curriculum.id)}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{curriculum.name}</h3>
              {curriculum.description && (
                <p className="text-sm text-gray-600 mt-1">{curriculum.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {curriculum.semesters} semestres
              </p>
            </div>
            {selectedCurriculumIds.includes(curriculum.id) && (
              <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            )}
          </label>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Volver
        </Button>
        <Button 
          onClick={onNext} 
          disabled={selectedCurriculumIds.length === 0}
          className="flex-1" 
          size="lg"
        >
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ========== PASO 3: Selección de Semestres ==========
interface Step3Props {
  totalSemesters: number
  selectedSemesters: number[]
  onToggleSemester: (semester: number) => void
  onNext: () => void
  onBack: () => void
}

export function TeacherStep3_Semesters({
  totalSemesters,
  selectedSemesters,
  onToggleSemester,
  onNext,
  onBack,
}: Step3Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold">Semestres</h2>
        <p className="text-gray-600 mt-2">Selecciona los semestres en los que dictas clases</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: totalSemesters }, (_, i) => i + 1).map((semester) => (
          <button
            key={semester}
            onClick={() => onToggleSemester(semester)}
            className={`p-6 border-2 rounded-xl transition-all ${
              selectedSemesters.includes(semester)
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">{semester}</p>
              {selectedSemesters.includes(semester) && (
                <CheckCircle2 className="w-5 h-5 mx-auto mt-2 text-indigo-600" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Volver
        </Button>
        <Button 
          onClick={onNext} 
          disabled={selectedSemesters.length === 0}
          className="flex-1" 
          size="lg"
        >
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ========== PASO 4: Selección de Materias ==========
interface Step4Props {
  subjectsBySemester: { [semester: number]: CurriculumSubject[] }
  selectedSubjectIds: number[]
  onToggleSubject: (subjectId: number) => void
  onNext: () => void
  onBack: () => void
}

export function TeacherStep4_Subjects({
  subjectsBySemester,
  selectedSubjectIds,
  onToggleSubject,
  onNext,
  onBack,
}: Step4Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <BookOpen className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold">Materias que Impartes</h2>
        <p className="text-gray-600 mt-2">Selecciona las materias que dictas en cada semestre</p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(subjectsBySemester).map(([semester, subjects]) => (
          <Card key={semester} className="p-4">
            <h3 className="font-semibold text-lg mb-3 text-indigo-600">
              Semestre {semester}
            </h3>
            <div className="space-y-2">
              {subjects.map((subject) => (
                <label
                  key={subject.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <Checkbox
                    checked={selectedSubjectIds.includes(subject.id)}
                    onCheckedChange={() => onToggleSubject(subject.id)}
                  />
                  <span className="flex-1">{subject.name}</span>
                  {subject.code && (
                    <span className="text-sm text-gray-500">{subject.code}</span>
                  )}
                </label>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Volver
        </Button>
        <Button 
          onClick={onNext} 
          disabled={selectedSubjectIds.length === 0}
          className="flex-1" 
          size="lg"
        >
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ========== PASO 5: Preferencias de Visibilidad ==========
interface Step5Props {
  visibility: TeacherVisibility
  onChangeVisibility: (value: TeacherVisibility) => void
  onNext: () => void
  onBack: () => void
}

export function TeacherStep5_Visibility({
  visibility,
  onChangeVisibility,
  onNext,
  onBack,
}: Step5Props) {
  const visibilityOptions = [
    {
      value: TeacherVisibility.MY_STUDENTS,
      title: 'Solo mis estudiantes',
      description: 'Ver únicamente el contenido de los estudiantes que toman tus materias',
      icon: Eye,
    },
    {
      value: TeacherVisibility.ALL_CAREER,
      title: 'Toda la carrera',
      description: 'Ver el contenido de todos los estudiantes de Ingeniería de Software',
      icon: Building2,
    },
    {
      value: TeacherVisibility.HIGHLIGHTED,
      title: 'Aportes destacados',
      description: 'Ver contenido destacado de toda la comunidad académica',
      icon: Sparkles,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Eye className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold">Preferencias de Visibilidad</h2>
        <p className="text-gray-600 mt-2">¿Qué contenido deseas ver en tu feed?</p>
      </div>

      <div className="space-y-4">
        {visibilityOptions.map((option) => {
          const Icon = option.icon
          return (
            <button
              key={option.value}
              onClick={() => onChangeVisibility(option.value)}
              className={`w-full p-6 border-2 rounded-xl text-left transition-all ${
                visibility === option.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  visibility === option.value ? 'bg-indigo-500' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    visibility === option.value ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{option.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
                {visibility === option.value && (
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Volver
        </Button>
        <Button onClick={onNext} className="flex-1" size="lg">
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ========== PASO 6: Confirmación Final ==========
interface Step6Props {
  selectedSubjectsCount: number
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

export function TeacherStep6_Confirmation({
  selectedSubjectsCount,
  onSubmit,
  onBack,
  loading,
}: Step6Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold">¡Todo Listo!</h2>
        <p className="text-gray-600 mt-2">Tu perfil de docente está configurado</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-8">
        <h3 className="font-semibold text-lg mb-4 text-center">Resumen de tu configuración</h3>
        <div className="space-y-3 text-center">
          <p className="text-gray-700">
            <span className="font-semibold text-indigo-600">{selectedSubjectsCount}</span> materias seleccionadas
          </p>
          <p className="text-sm text-gray-600">
            Serás asignado automáticamente a los estudiantes que cursan tus materias
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 text-center flex items-center justify-center gap-2">
          <Lightbulb className="h-4 w-4" />
          <span className="font-semibold">Recuerda:</span> Podrás editar esta información desde tu perfil en cualquier momento
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg" disabled={loading}>
          Volver
        </Button>
        <Button onClick={onSubmit} className="flex-1" size="lg" disabled={loading}>
          {loading ? 'Guardando...' : 'Completar Configuración'}
        </Button>
      </div>
    </div>
  )
}

export const TeacherSteps = {
  Step1: TeacherStep1_Context,
  Step2: TeacherStep2_Curriculums,
  Step3: TeacherStep3_Semesters,
  Step4: TeacherStep4_Subjects,
  Step5: TeacherStep5_Visibility,
  Step6: TeacherStep6_Confirmation,
}
