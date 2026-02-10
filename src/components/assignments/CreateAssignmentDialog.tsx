import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { assignmentService } from '@/services/assignmentService'
import { studentService, type StudentSubject } from '@/services/studentService'
import { uploadService } from '@/services/uploadService'
import { useAuthStore } from '@/stores/authStore'
import { 
  Loader2, 
  ClipboardList,
  FileText,
  Image,
  Video,
  X,
  Upload,
  BookOpen,
  GraduationCap,
  Link as LinkIcon
} from 'lucide-react'

const assignmentSchema = z.object({
  curriculumSubjectId: z.string().min(1, 'Selecciona una materia'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  dueDate: z.string().min(1, 'La fecha de entrega es requerida'),
  description: z.string().optional(),
  githubLink: z.string().url('URL inválida').optional().or(z.literal('')),
})

type AssignmentFormData = z.infer<typeof assignmentSchema>

interface LocalUploadedFile {
  url: string
  publicId: string
  fileName: string
  fileType: 'image' | 'video' | 'document'
  uploadedAt: Date
}

export default function CreateAssignmentDialog() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<LocalUploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Obtener las materias del estudiante
  const { data: mySubjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: () => studentService.getMySubjects(),
    enabled: open && user?.role === 'student',
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
  })

  const selectedSubjectId = watch('curriculumSubjectId')
  const selectedSubject = mySubjects?.find(
    s => String(s.curriculumSubjectId) === selectedSubjectId
  )

  const createAssignmentMutation = useMutation({
    mutationFn: assignmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['my-subjects'] })
      toast({
        title: '¡Tarea registrada!',
        description: 'La tarea ha sido documentada y publicada en el feed',
      })
      handleClose()
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo registrar la tarea',
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const handleClose = () => {
    reset()
    setUploadedFiles([])
    setOpen(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        const uploadedFile = await uploadService.uploadFile(file)

        setUploadedFiles(prev => [...prev, {
          url: uploadedFile.url,
          publicId: uploadedFile.publicId,
          fileName: uploadedFile.name,
          fileType: uploadedFile.type,
          uploadedAt: new Date(),
        }])
      }

      toast({
        title: 'Archivos subidos',
        description: `${files.length} archivo(s) subido(s) correctamente`,
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error al subir archivo',
        description: 'No se pudo subir el archivo. Intenta de nuevo.',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeFile = (publicId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.publicId !== publicId))
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const onSubmit = (data: AssignmentFormData) => {
    if (!user) return

    setIsLoading(true)
    createAssignmentMutation.mutate({
      curriculumSubjectId: Number(data.curriculumSubjectId),
      title: data.title,
      dueDate: data.dueDate,
      description: data.description || '',
      attachments: uploadedFiles.map(f => ({
        ...f,
        uploadedAt: f.uploadedAt.toISOString(),
      })),
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose()
      else setOpen(true)
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Tareas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        {/* Header con gradiente verde */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-t-lg" />
        
        <DialogHeader className="relative pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">
                Documentar Tarea
              </DialogTitle>
              <p className="text-sm text-white/80 mt-0.5">
                Registra y comparte tu trabajo académico
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
          {/* Selección de Materia */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Materia
            </Label>
            <Select
              value={selectedSubjectId}
              onValueChange={(value) => setValue('curriculumSubjectId', value)}
              disabled={isLoading || loadingSubjects}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder={loadingSubjects ? "Cargando materias..." : "Selecciona una materia"} />
              </SelectTrigger>
              <SelectContent>
                {mySubjects?.map((subject: StudentSubject) => (
                  <SelectItem 
                    key={subject.curriculumSubjectId} 
                    value={String(subject.curriculumSubjectId)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{subject.curriculumSubject.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Sem {subject.curriculumSubject.semester}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSubject?.teacher && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Docente: {selectedSubject.teacher.name}</span>
              </div>
            )}
            {errors.curriculumSubjectId && (
              <p className="text-sm text-destructive">{errors.curriculumSubjectId.message}</p>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título de la Tarea
            </Label>
            <Input
              id="title"
              placeholder="Ej: Tarea 3 - Árbol Binario de Búsqueda"
              className="h-11"
              {...register('title')}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Fecha de Entrega */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2 text-sm font-medium">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Fecha de Entrega
            </Label>
            <Input
              id="dueDate"
              type="date"
              className="h-11"
              {...register('dueDate')}
              disabled={isLoading}
            />
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>

          {/* Link de GitHub */}
          <div className="space-y-2">
            <Label htmlFor="githubLink" className="flex items-center gap-2 text-sm font-medium">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              Link de GitHub <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="githubLink"
              placeholder="https://github.com/tu-usuario/tu-repo"
              className="h-11"
              {...register('githubLink')}
              disabled={isLoading}
            />
            {errors.githubLink && (
              <p className="text-sm text-destructive">{errors.githubLink.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe la tarea, tu proceso de desarrollo, dificultades, aprendizajes..."
              className="min-h-[100px] resize-none"
              {...register('description')}
              disabled={isLoading}
            />
          </div>

          {/* Archivos Adjuntos */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Upload className="h-4 w-4 text-muted-foreground" />
              Archivos Adjuntos <span className="text-muted-foreground">(opcional)</span>
            </Label>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <p className="text-sm text-muted-foreground">Subiendo archivos...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-muted rounded-full">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Haz clic para subir archivos</p>
                    <p className="text-xs text-muted-foreground">
                      Código, capturas, PDFs y documentos
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de archivos subidos */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div 
                    key={file.publicId}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg group"
                  >
                    <div className="p-2 bg-background rounded-lg">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{file.fileType}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(file.publicId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isUploading} 
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Publicando...' : 'Documentar Tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
