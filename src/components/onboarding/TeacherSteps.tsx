import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
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
  Lightbulb,
  Search,
  BookMarked,
  GraduationCap
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
  const allSemestersSelected = selectedSemesters.length === totalSemesters
  
  const toggleAllSemesters = () => {
    if (allSemestersSelected) {
      // Deseleccionar todos
      selectedSemesters.forEach(semester => onToggleSemester(semester))
    } else {
      // Seleccionar todos los que faltan
      Array.from({ length: totalSemesters }, (_, i) => i + 1).forEach(semester => {
        if (!selectedSemesters.includes(semester)) {
          onToggleSemester(semester)
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold">Semestres</h2>
        <p className="text-gray-600 mt-2">Selecciona los semestres en los que dictas clases</p>
      </div>

      {/* Botón para seleccionar todos */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {selectedSemesters.length} de {totalSemesters} semestres seleccionados
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllSemesters}
        >
          {allSemestersSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </Button>
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
          Continuar ({selectedSemesters.length} semestres)
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ========== PASO 4: Selección de Materias ==========
interface Step4Props {
  curriculums: Curriculum[]
  subjectsByCurriculumAndSemester: { 
    [curriculumId: number]: { 
      [semester: number]: CurriculumSubject[] 
    } 
  }
  selectedSubjectIds: number[]
  onToggleSubject: (subjectId: number) => void
  onNext: () => void
  onBack: () => void
}

export function TeacherStep4_Subjects({
  curriculums,
  subjectsByCurriculumAndSemester,
  selectedSubjectIds,
  onToggleSubject,
  onNext,
  onBack,
}: Step4Props) {
  const [searchTerm, setSearchTerm] = useState('')

  // Función para seleccionar/deseleccionar todas las materias de un semestre
  const toggleAllSemesterSubjects = (subjects: CurriculumSubject[]) => {
    const semesterSubjectIds = subjects.map(s => s.id)
    const allSelected = semesterSubjectIds.every(id => selectedSubjectIds.includes(id))
    
    if (allSelected) {
      // Deseleccionar todas
      semesterSubjectIds.forEach(id => {
        if (selectedSubjectIds.includes(id)) {
          onToggleSubject(id)
        }
      })
    } else {
      // Seleccionar todas las que no están seleccionadas
      semesterSubjectIds.forEach(id => {
        if (!selectedSubjectIds.includes(id)) {
          onToggleSubject(id)
        }
      })
    }
  }

  // Filtrar materias por búsqueda
  const filterSubjects = (subjects: CurriculumSubject[]) => {
    if (!searchTerm) return subjects
    return subjects.filter(subject => 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <BookOpen className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold">Materias que Impartes</h2>
        <p className="text-gray-600 mt-2">Selecciona las materias que dictas en cada semestre</p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar materia por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-6 max-h-[500px] overflow-y-auto">
        {Object.entries(subjectsByCurriculumAndSemester).map(([curriculumIdStr, semesterData]) => {
          const curriculumId = Number(curriculumIdStr)
          // FIX: Convertir ambos a number para comparación correcta
          const curriculum = curriculums.find(c => Number(c.id) === Number(curriculumId))
          
          // Contar materias seleccionadas de esta malla
          const allSubjectsInCurriculum = Object.values(semesterData).flat()
          const selectedInCurriculum = allSubjectsInCurriculum.filter(s => selectedSubjectIds.includes(s.id)).length
          
          return (
            <div key={curriculumId} className="border-2 border-indigo-200 rounded-xl p-4 bg-gradient-to-br from-indigo-50 to-white">
              {/* Header de Malla */}
              <div className="mb-4 pb-3 border-b-2 border-indigo-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                      {String(curriculum?.type).toLowerCase() === 'new' ? (
                        <Sparkles className="w-6 h-6 text-blue-600" />
                      ) : (
                        <BookMarked className="w-6 h-6 text-green-600" />
                      )}
                      {curriculum?.name || `Malla ${curriculumId}`}
                    </h2>
                    <p className="text-sm font-medium mt-1 flex items-center gap-2">
                      {String(curriculum?.type).toLowerCase() === 'new' ? (
                        <>
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600">Malla Repotenciada</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Malla Antigua</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-700">
                      {selectedInCurriculum}
                    </div>
                    <div className="text-xs text-indigo-600">
                      materias seleccionadas
                    </div>
                  </div>
                </div>
              </div>

              {/* Materias por Semestre */}
              <div className="space-y-3">
                {Object.entries(semesterData).map(([semesterStr, subjects]) => {
                  const filteredSubjects = filterSubjects(subjects)
                  if (filteredSubjects.length === 0) return null

                  const selectedInSemester = filteredSubjects.filter(s => selectedSubjectIds.includes(s.id)).length
                  const allSelected = filteredSubjects.every(s => selectedSubjectIds.includes(s.id))

                  return (
                    <Card key={semesterStr} className="p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg text-indigo-600 flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Semestre {semesterStr}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {selectedInSemester}/{filteredSubjects.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAllSemesterSubjects(filteredSubjects)}
                            className="text-xs"
                          >
                            {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {filteredSubjects.map((subject) => (
                          <label
                            key={subject.id}
                            className="flex items-center gap-3 p-3 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={selectedSubjectIds.includes(subject.id)}
                              onCheckedChange={() => onToggleSubject(subject.id)}
                            />
                            <span className="flex-1 font-medium">{subject.name}</span>
                            {subject.code && (
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {subject.code}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mensaje si no hay resultados */}
      {searchTerm && Object.values(subjectsByCurriculumAndSemester).every(semesterData => 
        Object.values(semesterData).flat().filter(s => 
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.code?.toLowerCase().includes(searchTerm.toLowerCase())
        ).length === 0
      ) && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No se encontraron materias con "{searchTerm}"</p>
        </div>
      )}

      <div className="flex gap-4 pt-4 border-t">
        <Button onClick={onBack} variant="outline" size="lg">
          Volver
        </Button>
        <Button 
          onClick={onNext} 
          disabled={selectedSubjectIds.length === 0}
          className="flex-1" 
          size="lg"
        >
          Continuar ({selectedSubjectIds.length} materias seleccionadas)
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
