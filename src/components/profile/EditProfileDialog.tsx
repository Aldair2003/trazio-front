import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { profileService } from '@/services/profileService'
import { Loader2, Edit } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { UserRole } from '@/types'

interface EditProfileDialogProps {
  currentProfile?: any
  role: UserRole
}

export default function EditProfileDialog({ currentProfile, role }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  // Estado para estudiantes
  const [studentData, setStudentData] = useState({
    birthYear: '',
    bio: '',
  })

  // Estado para docentes
  const [teacherData, setTeacherData] = useState({
    institutionalEmail: '',
    bio: '',
  })

  useEffect(() => {
    if (currentProfile) {
      if (role === UserRole.STUDENT) {
        setStudentData({
          birthYear: currentProfile.birthYear?.toString() || '',
          bio: currentProfile.bio || '',
        })
      } else if (role === UserRole.TEACHER) {
        setTeacherData({
          institutionalEmail: currentProfile.institutionalEmail || '',
          bio: currentProfile.bio || '',
        })
      }
    }
  }, [currentProfile, role])

  const updateStudentMutation = useMutation({
    mutationFn: profileService.updateStudentProfile,
    onSuccess: () => {
      toast({
        title: 'Perfil actualizado',
        description: 'Tus cambios han sido guardados exitosamente',
      })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setOpen(false)
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      })
    },
    onSettled: () => setLoading(false),
  })

  const updateTeacherMutation = useMutation({
    mutationFn: profileService.updateTeacherProfile,
    onSuccess: () => {
      toast({
        title: 'Perfil actualizado',
        description: 'Tus cambios han sido guardados exitosamente',
      })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setOpen(false)
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      })
    },
    onSettled: () => setLoading(false),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (role === UserRole.STUDENT) {
      const updateData: any = {
        bio: studentData.bio || undefined,
      }

      if (studentData.birthYear) {
        updateData.birthYear = parseInt(studentData.birthYear)
      }

      updateStudentMutation.mutate(updateData)
    } else if (role === UserRole.TEACHER) {
      updateTeacherMutation.mutate({
        institutionalEmail: teacherData.institutionalEmail || undefined,
        bio: teacherData.bio || undefined,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Edit className="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            {role === UserRole.STUDENT
              ? 'Actualiza tu información personal y académica'
              : 'Actualiza tu información profesional'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {role === UserRole.STUDENT ? (
            <>
              <div>
                <Label htmlFor="birthYear">Año de Nacimiento</Label>
                <Input
                  id="birthYear"
                  type="number"
                  value={studentData.birthYear}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 4) {
                      setStudentData({ ...studentData, birthYear: value });
                    }
                  }}
                  min="1920"
                  max={new Date().getFullYear()}
                  placeholder="Ej: 2000"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={studentData.bio}
                  onChange={(e) => setStudentData({ ...studentData, bio: e.target.value })}
                  placeholder="Cuéntanos un poco sobre ti..."
                  rows={4}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="institutionalEmail">Correo Institucional</Label>
                <Input
                  id="institutionalEmail"
                  type="email"
                  value={teacherData.institutionalEmail}
                  onChange={(e) =>
                    setTeacherData({ ...teacherData, institutionalEmail: e.target.value })
                  }
                  placeholder="tu.nombre@universidad.edu.ec"
                />
              </div>

              <div>
                <Label htmlFor="bio">Biografía Profesional</Label>
                <Textarea
                  id="bio"
                  value={teacherData.bio}
                  onChange={(e) => setTeacherData({ ...teacherData, bio: e.target.value })}
                  placeholder="Cuéntanos sobre tu experiencia y especialización..."
                  rows={4}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
