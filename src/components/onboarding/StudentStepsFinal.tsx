import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  TrazioGoal,
  ACADEMIC_INTERESTS 
} from '@/types'
import { 
  Sparkles, 
  Target,
  CheckCircle2,
  ArrowRight,
  FileText,
  Users,
  Briefcase,
  TrendingUp,
  Lightbulb
} from 'lucide-react'

// ========== PASO 8: Intereses Académicos ==========
interface Step8Props {
  selectedInterests: string[]
  onToggleInterest: (interest: string) => void
  onNext: () => void
  onBack: () => void
}

export function StudentStep8_AcademicInterests({
  selectedInterests,
  onToggleInterest,
  onNext,
  onBack,
}: Step8Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
        <h2 className="text-2xl font-bold">Intereses Académicos</h2>
        <p className="text-gray-600 mt-2">
          Selecciona tus áreas de interés para personalizar tu feed
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACADEMIC_INTERESTS.map((interest) => (
          <label
            key={interest}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedInterests.includes(interest)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedInterests.includes(interest)}
                onCheckedChange={() => onToggleInterest(interest)}
              />
              <span className="text-sm font-medium">{interest}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          <span><strong>Tip:</strong> Puedes cambiar tus intereses en cualquier momento desde tu perfil.</span>
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

// ========== PASO 9: Objetivo en TRAZIO ==========
interface Step9Props {
  selectedGoal?: TrazioGoal
  onSelectGoal: (goal: TrazioGoal) => void
  onNext: () => void
  onBack: () => void
}

export function StudentStep9_TrazioGoal({
  selectedGoal,
  onSelectGoal,
  onNext,
  onBack,
}: Step9Props) {
  const goals = [
    {
      value: TrazioGoal.DOCUMENT,
      icon: FileText,
      title: 'Documentar mi trayectoria',
      description: 'Registrar mi progreso académico y proyectos',
    },
    {
      value: TrazioGoal.COLLABORATE,
      icon: Users,
      title: 'Trabajos colaborativos',
      description: 'Conectar con compañeros para proyectos grupales',
    },
    {
      value: TrazioGoal.PORTFOLIO,
      icon: Briefcase,
      title: 'Portafolio académico',
      description: 'Construir un portafolio para mostrar mis logros',
    },
    {
      value: TrazioGoal.TRACK_PROGRESS,
      icon: TrendingUp,
      title: 'Seguimiento del progreso',
      description: 'Monitorear mi avance en la carrera',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-12 h-12 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold">¿Cuál es tu objetivo en TRAZIO?</h2>
        <p className="text-gray-600 mt-2">Elige el que mejor describa tu motivación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const Icon = goal.icon
          return (
            <button
              key={goal.value}
              onClick={() => onSelectGoal(goal.value)}
              className={`p-6 border-2 rounded-lg transition-all text-left ${
                selectedGoal === goal.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
                {selectedGoal === goal.value && (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
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

// ========== PASO 10: Confirmación Final ==========
interface Step10Props {
  bio: string
  onChangeBio: (value: string) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

export function StudentStep10_Confirmation({
  bio,
  onChangeBio,
  onSubmit,
  onBack,
  loading,
}: Step10Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-4" />
        <h2 className="text-2xl font-bold">¡Casi Listo!</h2>
        <p className="text-gray-600 mt-2">Agrega una biografía opcional y finaliza tu perfil</p>
      </div>

      <div>
        <Label htmlFor="bio">Biografía (Opcional)</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => onChangeBio(e.target.value)}
          placeholder="Cuéntanos un poco sobre ti, tus metas, intereses personales..."
          rows={5}
          className="mt-2"
        />
        <p className="text-sm text-gray-500 mt-2">
          {bio.length} / 500 caracteres
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-3 text-blue-900">
          ✅ Tu perfil académico está completo
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Malla curricular y semestre configurados</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Materias asignadas automáticamente</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Docentes vinculados cuando estén disponibles</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Datos académicos registrados</span>
          </li>
        </ul>
      </div>

      <div className="flex gap-4 pt-4">
        <Button onClick={onBack} variant="outline" size="lg" disabled={loading}>
          Volver
        </Button>
        <Button 
          onClick={onSubmit} 
          className="flex-1" 
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Creando perfil...
            </>
          ) : (
            <>
              Completar Perfil
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Exportar componentes finales
export const StudentStepsFinal = {
  Step8: StudentStep8_AcademicInterests,
  Step9: StudentStep9_TrazioGoal,
  Step10: StudentStep10_Confirmation,
}
