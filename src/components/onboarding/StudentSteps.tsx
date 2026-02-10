import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  Curriculum, 
  CurriculumSubject
} from '@/types'
import { CheckCircle2, BookOpen, Calendar, Sparkles, ArrowRight } from 'lucide-react'

// ========== PASO 1: Selección de Malla ==========
interface Step1Props {
  curriculums: Curriculum[]
  selectedCurriculumId: number
  onSelect: (curriculum: Curriculum) => void
  onNext: () => void
  onBack?: () => void
}

export function StudentStep1_CurriculumSelection({ curriculums, selectedCurriculumId, onSelect, onNext, onBack }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <BookOpen className="w-12 h-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold">¿Qué malla curricular estás cursando?</h2>
        <p className="text-gray-600 mt-2">Selecciona la malla que corresponde a tu ingreso</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {curriculums.map((curriculum) => (
          <button
            key={curriculum.id}
            onClick={() => onSelect(curriculum)}
            className={`p-6 border-2 rounded-lg transition-all ${
              selectedCurriculumId === curriculum.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  {curriculum.type === 'new' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                      NUEVA
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                      ANTIGUA
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg">{curriculum.name}</h3>
                <p className="text-sm text-gray-600 mt-1">8 semestres • {curriculum.career}</p>
              </div>
              {selectedCurriculumId === curriculum.id && (
                <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        {onBack && (
          <Button onClick={onBack} variant="outline" size="lg">
            Volver
          </Button>
        )}
        <Button onClick={onNext} disabled={!selectedCurriculumId} size="lg" className={!onBack ? "ml-auto" : ""}>
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ========== PASO 2: Contexto Académico ==========
interface Step2Props {
  curriculum: Curriculum
  onNext: () => void
  onBack: () => void
}

export function StudentStep2_AcademicContext({ curriculum, onNext, onBack }: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold">Confirmación de Contexto Académico</h2>
        <p className="text-gray-600 mt-2">Estos datos están configurados automáticamente</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-600">Universidad</Label>
            <p className="font-semibold text-lg">{curriculum.university}</p>
          </div>
          <div>
            <Label className="text-gray-600">Carrera</Label>
            <p className="font-semibold text-lg">{curriculum.career}</p>
          </div>
          <div>
            <Label className="text-gray-600">Malla Curricular</Label>
            <p className="font-semibold text-lg">{curriculum.name}</p>
          </div>
          <div>
            <Label className="text-gray-600">Duración</Label>
            <p className="font-semibold text-lg">{curriculum.totalSemesters} semestres</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Volver
        </Button>
        <Button onClick={onNext} className="flex-1" size="lg">
          Confirmar y Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ========== PASO 3: Selección de Semestre ==========
interface Step3Props {
  currentSemester: number
  onSelect: (semester: number) => void
  onNext: () => void
  onBack: () => void
}

export function StudentStep3_SemesterSelection({ currentSemester, onSelect, onNext, onBack }: Step3Props) {
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar className="w-12 h-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold">¿En qué semestre estás actualmente?</h2>
        <p className="text-gray-600 mt-2">Selecciona el semestre que estás cursando</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {semesters.map((semester) => (
          <button
            key={semester}
            onClick={() => onSelect(semester)}
            className={`p-6 border-2 rounded-lg transition-all ${
              currentSemester === semester
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{semester}</div>
              <div className="text-sm text-gray-600 mt-1">Semestre</div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Volver
        </Button>
        <Button onClick={onNext} disabled={!currentSemester} className="flex-1" size="lg">
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ========== PASO 4: Vista de materias asignadas automáticamente ==========
interface Step4Props {
  subjects: CurriculumSubject[]
  onNext: () => void
  onBack: () => void
}

export function StudentStep4_AssignedSubjects({ subjects, onNext, onBack }: Step4Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
        <h2 className="text-2xl font-bold">Materias Asignadas Automáticamente</h2>
        <p className="text-gray-600 mt-2">
          Estas son las materias de tu semestre actual ({subjects.length} materias)
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 space-y-3 max-h-96 overflow-y-auto">
        {subjects.map((subject, index) => (
          <div key={subject.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{subject.name}</p>
              {subject.code && <p className="text-sm text-gray-500">{subject.code}</p>}
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> Los docentes se asignarán automáticamente cuando se registren en el sistema.
        </p>
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

// Exportar todos los componentes
export const StudentSteps = {
  Step1: StudentStep1_CurriculumSelection,
  Step2: StudentStep2_AcademicContext,
  Step3: StudentStep3_SemesterSelection,
  Step4: StudentStep4_AssignedSubjects,
}
