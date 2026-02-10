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
  X,
  Upload,
  BookOpen,
  GraduationCap,
  Plus
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
        <Button className="w-full sm:w-auto bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Examen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden p-0">
        {/* Header mejorado */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 px-6 pt-6 pb-8">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl border border-blue-200 dark:border-blue-800">
                <Calendar className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                  Documentar Examen
                </DialogTitle>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Registra tu experiencia y ayuda a tu comunidad
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Contenido del formulario */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Selección de Materia */}
            <div className="space-y-2.5">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Materia
              </Label>
              <Select
                value={selectedSubjectId}
                onValueChange={(value) => setValue('curriculumSubjectId', value)}
                disabled={isLoading || loadingSubjects}
              >
                <SelectTrigger className="h-12 border-2 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder={loadingSubjects ? "Cargando materias..." : "Selecciona una materia"} />
                </SelectTrigger>
                <SelectContent>
                  {mySubjects?.map((subject: StudentSubject) => (
                    <SelectItem 
                      key={subject.curriculumSubjectId} 
                      value={String(subject.curriculumSubjectId)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full gap-3">
                        <span className="font-medium">{subject.curriculumSubject.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Sem {subject.curriculumSubject.semester}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSubject?.teacher && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 px-3 py-2.5 rounded-lg border border-blue-100 dark:border-blue-900">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Docente: {selectedSubject.teacher.name}</span>
                </div>
              )}
              {errors.curriculumSubjectId && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.curriculumSubjectId.message}
                </p>
              )}
            </div>

            {/* Título */}
            <div className="space-y-2.5">
              <Label htmlFor="title" className="text-sm font-semibold">
                Título del Examen
              </Label>
              <Input
                id="title"
                placeholder="Ej: Parcial 1 - Estructuras de Datos"
                className="h-12 border-2 hover:border-blue-300 transition-colors"
                {...register('title')}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Fecha */}
            <div className="space-y-2.5">
              <Label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-blue-600" />
                Fecha del Examen
              </Label>
              <Input
                id="date"
                type="date"
                className="h-12 border-2 hover:border-blue-300 transition-colors"
                {...register('date')}
                disabled={isLoading}
              />
              {errors.date && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2.5">
              <Label htmlFor="description" className="text-sm font-semibold">
                Descripción <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe los temas del examen, tu experiencia, dificultades, etc."
                className="min-h-[100px] resize-none border-2 hover:border-blue-300 transition-colors"
                {...register('description')}
                disabled={isLoading}
              />
            </div>

            {/* Archivos Adjuntos */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Upload className="h-4 w-4 text-blue-600" />
                Archivos Adjuntos <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Subir archivos"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 dark:border-blue-900 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-blue-600">Subiendo archivos...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-blue-100 dark:bg-blue-950 rounded-2xl">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Arrastra archivos o haz clic aquí</p>
                      <p className="text-xs text-muted-foreground">
                        Imágenes, videos, PDFs y documentos
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de archivos subidos */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? 'archivo' : 'archivos'} adjuntado{uploadedFiles.length === 1 ? '' : 's'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedFiles.map((file) => (
                      <div 
                        key={file.publicId}
                        className="relative group rounded-xl border border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 overflow-hidden"
                      >
                        <div className="aspect-video w-full relative bg-gray-100 dark:bg-gray-900">
                          {file.fileType === 'image' ? (
                            <img
                              src={file.url}
                              alt={file.fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImagen%3C/text%3E%3C/svg%3E'
                              }}
                            />
                          ) : file.fileType === 'video' ? (
                            <video
                              src={file.url}
                              className="w-full h-full object-cover rounded"
                              controls
                              preload="metadata"
                            >
                              Tu navegador no soporta video
                            </video>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4">
                              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mb-2">
                                <FileText className="h-8 w-8 text-blue-600" />
                              </div>
                              <p className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 truncate max-w-full px-2">
                                {file.fileName}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="text-sm font-medium truncate">{file.fileName}</p>
                            <p className="text-xs text-muted-foreground capitalize">{file.fileType}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 flex-shrink-0"
                            onClick={() => removeFile(file.publicId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 h-11"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isUploading} 
                className="flex-1 h-11 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Publicando...' : 'Documentar Examen'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
