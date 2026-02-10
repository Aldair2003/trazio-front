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
import { examService } from '@/services/examService'
import { studentService, type StudentSubject } from '@/services/studentService'
import { uploadService } from '@/services/uploadService'
import { useAuthStore } from '@/stores/authStore'
import { 
  Loader2, 
  Calendar,
  FileText,
  Image,
  Video,
  X,
  Upload,
  BookOpen,
  GraduationCap
} from 'lucide-react'

const examSchema = z.object({
  curriculumSubjectId: z.string().min(1, 'Selecciona una materia'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().optional(),
})

type ExamFormData = z.infer<typeof examSchema>

interface UploadedFile {
  url: string
  publicId: string
  fileName: string
  fileType: 'image' | 'video' | 'document'
  uploadedAt: Date
}

export default function CreateExamDialog() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
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
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
  })

  const selectedSubjectId = watch('curriculumSubjectId')
  const selectedSubject = mySubjects?.find(
    s => String(s.curriculumSubjectId) === selectedSubjectId
  )

  const createExamMutation = useMutation({
    mutationFn: examService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['my-subjects'] })
      toast({
        title: '¡Examen registrado!',
        description: 'El examen ha sido documentado y publicado en el feed',
      })
      handleClose()
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo registrar el examen',
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

  const onSubmit = (data: ExamFormData) => {
    if (!user) return

    setIsLoading(true)
    createExamMutation.mutate({
      curriculumSubjectId: Number(data.curriculumSubjectId),
      title: data.title,
      date: data.date,
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
          <Calendar className="h-4 w-4" />
          Exámenes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        {/* Header con gradiente */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-t-lg" />
        
        <DialogHeader className="relative pt-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">
                Documentar Examen
              </DialogTitle>
              <p className="text-sm text-white/80 mt-0.5">
                Registra y comparte tu experiencia académica
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
              Título del Examen
            </Label>
            <Input
              id="title"
              placeholder="Ej: Parcial 1 - Estructuras de Datos"
              className="h-11"
              {...register('title')}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Fecha del Examen
            </Label>
            <Input
              id="date"
              type="date"
              className="h-11"
              {...register('date')}
              disabled={isLoading}
            />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe los temas del examen, tu experiencia, dificultades, etc."
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
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                      Imágenes, videos, PDFs y documentos
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
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Publicando...' : 'Documentar Examen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
