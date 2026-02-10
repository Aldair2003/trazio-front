import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CurriculumSubject,
  AcademicStatus,
  TrazioGoal,
  ACADEMIC_INTERESTS 
} from '@/types'
import { 
  AlertCircle, 
  Calendar, 
  User, 
  Sparkles, 
  Target,
  ArrowRight,
  CheckCircle2,
  Lightbulb
} from 'lucide-react'

// ========== PASO 5: Materias Arrastradas ==========
interface Step5Props {
  allSubjects: CurriculumSubject[]
  currentSemester: number
  hasDraggedSubjects: boolean
  draggedSubjectIds: number[]
  onToggleHasDragged: (value: boolean) => void
  onToggleSubject: (subjectId: number) => void
  onNext: () => void
  onBack: () => void
}

export function StudentStep5_DraggedSubjects({
  allSubjects,
  currentSemester,
  hasDraggedSubjects,
  draggedSubjectIds,
  onToggleHasDragged,
  onToggleSubject,
  onNext,
  onBack,
}: Step5Props) {
  // Agrupar materias por semestre (solo semestres anteriores)
  const previousSemesters = allSubjects
    .filter(s => s.semester < currentSemester)
    .reduce((acc, subject) => {
      if (!acc[subject.semester]) acc[subject.semester] = []
      acc[subject.semester].push(subject)
      return acc
    }, {} as Record<number, CurriculumSubject[]>)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-orange-600 mb-4" />
        <h2 className="text-2xl font-bold">¿Estás arrastrando materias?</h2>
        <p className="text-gray-600 mt-2">
          Selecciona las materias de semestres anteriores que aún estás cursando
        </p>
      </div>

      {/* Pregunta inicial */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={hasDraggedSubjects}
            onCheckedChange={onToggleHasDragged}
            id="hasDragged"
          />
          <label htmlFor="hasDragged" className="text-lg font-semibold cursor-pointer">
            Sí, estoy arrastrando materias de semestres anteriores
          </label>
        </div>
      </div>

      {/* Si NO arrastra materias */}
      {!hasDraggedSubjects && (
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
          <p className="text-gray-600">¡Excelente! Estás al día con tu plan de estudios</p>
        </div>
      )}

      {/* Si SÍ arrastra materias */}
      {hasDraggedSubjects && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(previousSemesters).map(([semester, subjects]) => (
            <Card key={semester} className="p-4">
              <h3 className="font-semibold text-lg mb-3 text-blue-600">
                Semestre {semester}
              </h3>
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <label
                    key={subject.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <Checkbox
                      checked={draggedSubjectIds.includes(subject.id)}
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
      )}

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

// ========== PASO 6: Asignación automática de docentes (solo informativo) ==========
interface Step6Props {
  onNext: () => void
  onBack: () => void
}

export function StudentStep6_TeacherAssignment({ onNext, onBack }: Step6Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 mx-auto text-purple-600 mb-4" />
        <h2 className="text-2xl font-bold">Asignación Automática de Docentes</h2>
        <p className="text-gray-600 mt-2">TRAZIO vincula docentes y estudiantes automáticamente</p>
      </div>

      <div className="space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3">¿Cómo funciona?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span>Si un docente ya está registrado y dicta tus materias, se asigna automáticamente</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span>Si el docente aún no está en TRAZIO, la materia queda pendiente de asignación</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <span>Cuando el docente se registre, se vinculará automáticamente contigo</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span><strong>Tip:</strong> No necesitas hacer nada. El sistema se encarga de todo.</span>
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Volver
        </Button>
        <Button onClick={onNext} className="flex-1" size="lg">
          Entendido, Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ========== PASO 7: Datos Académicos Personales ==========
interface Step7Props {
  birthYear: number
  admissionYear: number
  academicStatus: AcademicStatus
  onChangebirthYear: (value: number) => void
  onChangeAdmissionYear: (value: number) => void
  onChangeStatus: (value: AcademicStatus) => void
  onNext: () => void
  onBack: () => void
}

export function StudentStep7_PersonalData({
  birthYear,
  admissionYear,
  academicStatus,
  onChangebirthYear,
  onChangeAdmissionYear,
  onChangeStatus,
  onNext,
  onBack,
}: Step7Props) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <User className="w-12 h-12 mx-auto text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold">Datos Académicos Personales</h2>
        <p className="text-gray-600 mt-2">Información básica para tu perfil</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="birthYear">Año de Nacimiento *</Label>
          <Input
            id="birthYear"
            type="number"
            value={birthYear || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 4) {
                onChangebirthYear(parseInt(value));
              }
            }}
            min="1980"
            max={currentYear - 15}
            placeholder="Ej: 2005"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="admissionYear">Año de Ingreso a la Universidad *</Label>
          <Input
            id="admissionYear"
            type="number"
            value={admissionYear || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 4) {
                onChangeAdmissionYear(parseInt(value));
              }
            }}
            min="2000"
            max={currentYear}
            placeholder="Ej: 2023"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Estado Académico *</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              onClick={() => onChangeStatus(AcademicStatus.STUDYING)}
              className={`p-4 border-2 rounded-lg transition-all ${
                academicStatus === AcademicStatus.STUDYING
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="font-semibold">Cursando</p>
              </div>
            </button>

            <button
              onClick={() => onChangeStatus(AcademicStatus.GRADUATED)}
              className={`p-4 border-2 rounded-lg transition-all ${
                academicStatus === AcademicStatus.GRADUATED
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="font-semibold">Egresado</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Volver
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!birthYear || !admissionYear}
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

// Exportar componentes
export const StudentStepsExtra = {
  Step5: StudentStep5_DraggedSubjects,
  Step6: StudentStep6_TeacherAssignment,
  Step7: StudentStep7_PersonalData,
}
