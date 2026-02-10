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
import { projectService } from '@/services/projectService'
import { studentService } from '@/services/studentService'
import { uploadService, UploadedFile } from '@/services/uploadService'
import { useAuthStore } from '@/stores/authStore'
import { 
  Loader2, 
  Plus, 
  FolderOpen, 
  Upload, 
  X, 
  Video, 
  FileText,
  Github,
  Globe,
  Code,
  BookOpen
} from 'lucide-react'

const projectSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  curriculumSubjectId: z.string().min(1, 'Selecciona una materia'),
  dueDate: z.string().min(1, 'La fecha de entrega es requerida'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  technologies: z.string().optional(),
  repositoryUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  demoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function CreateProjectDialog() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Obtener las materias del estudiante desde el onboarding
  const { data: mySubjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: () => studentService.getMySubjects(),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  const selectedSubjectId = watch('curriculumSubjectId')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        let uploadedFile: UploadedFile

        if (file.type.startsWith('image/')) {
          uploadedFile = await uploadService.uploadImage(file)
        } else if (file.type.startsWith('video/')) {
          uploadedFile = await uploadService.uploadVideo(file)
        } else {
          uploadedFile = await uploadService.uploadDocument(file)
        }

        setUploadedFiles(prev => [...prev, uploadedFile])
      }

      toast({
        title: 'Archivo(s) subido(s)',
        description: 'Los archivos se han subido correctamente',
      })
    } catch (error) {
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

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileTypeBadge = (type: string) => {
    const colors = {
      image: 'bg-green-100 text-green-700',
      video: 'bg-purple-100 text-purple-700',
      document: 'bg-blue-100 text-blue-700',
    }
    return colors[type as keyof typeof colors] || colors.document
  }

  const createProjectMutation = useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['student'] })
      toast({
        title: '¡Proyecto registrado!',
        description: 'El proyecto ha sido registrado exitosamente',
      })
      reset()
      setUploadedFiles([])
      setOpen(false)
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo registrar el proyecto',
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const onSubmit = (data: ProjectFormData) => {
    if (!user) return

    setIsLoading(true)
    
    // Convertir tecnologías a array
    const technologiesArray = data.technologies
      ? data.technologies.split(',').map(t => t.trim()).filter(Boolean)
      : []

    createProjectMutation.mutate({
      title: data.title,
      curriculumSubjectId: Number(data.curriculumSubjectId),
      dueDate: data.dueDate,
      description: data.description,
      technologies: technologiesArray,
      repositoryUrl: data.repositoryUrl || undefined,
      demoUrl: data.demoUrl || undefined,
      attachments: uploadedFiles.map(f => ({
        url: f.url,
        publicId: f.publicId,
        fileName: f.name,
        fileType: f.type,
        uploadedAt: new Date().toISOString(),
      })),
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      reset()
      setUploadedFiles([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden p-0">
        {/* Header mejorado */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 px-6 pt-6 pb-8">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl border border-purple-200 dark:border-purple-800">
                <FolderOpen className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                  Documentar Proyecto
                </DialogTitle>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Registra tus proyectos y construye tu portafolio
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Contenido del formulario */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Título del Proyecto */}
            <div className="space-y-2.5">
              <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold">
                <Code className="h-4 w-4 text-purple-600" />
                Título del Proyecto
              </Label>
              <Input
                id="title"
                placeholder="Ej: Sistema de Gestión de Inventario"
                {...register('title')}
                disabled={isLoading}
                className="h-12 border-2 hover:border-purple-300 transition-colors"
              />
              {errors.title && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Materia */}
            <div className="space-y-2.5">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-purple-600" />
                Materia
              </Label>
              <Select
                value={selectedSubjectId}
                onValueChange={(value) => setValue('curriculumSubjectId', value)}
                disabled={isLoading || loadingSubjects}
              >
                <SelectTrigger className="h-12 border-2 hover:border-purple-300 transition-colors">
                  <SelectValue placeholder={loadingSubjects ? 'Cargando...' : 'Selecciona una materia'} />
                </SelectTrigger>
                <SelectContent>
                  {mySubjects?.map((subject: any) => (
                    <SelectItem key={subject.curriculumSubjectId} value={String(subject.curriculumSubjectId)} className="cursor-pointer">
                      <div className="flex items-center justify-between w-full gap-3">
                        <span className="font-medium">{subject.curriculumSubject?.name || subject.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Sem {subject.curriculumSubject?.semester}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.curriculumSubjectId && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.curriculumSubjectId.message}
                </p>
              )}
            </div>

            {/* Fecha de Entrega */}
            <div className="space-y-2.5">
              <Label htmlFor="dueDate" className="text-sm font-semibold">Fecha de Entrega</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
                disabled={isLoading}
                className="h-12 border-2 hover:border-purple-300 transition-colors"
              />
              {errors.dueDate && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2.5">
              <Label htmlFor="description" className="text-sm font-semibold">Descripción del Proyecto</Label>
              <Textarea
                id="description"
                placeholder="Describe tu proyecto: objetivos, funcionalidades principales, tecnologías utilizadas..."
                className="min-h-[100px] resize-none border-2 hover:border-purple-300 transition-colors"
                {...register('description')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Tecnologías */}
            <div className="space-y-2.5">
              <Label htmlFor="technologies" className="flex items-center gap-2 text-sm font-semibold">
                <Code className="h-4 w-4 text-purple-600" />
                Tecnologías Utilizadas
              </Label>
              <Input
                id="technologies"
                placeholder="React, Node.js, PostgreSQL, TypeScript (separadas por coma)"
                {...register('technologies')}
                disabled={isLoading}
                className="h-12 border-2 hover:border-purple-300 transition-colors"
              />
              <p className="text-xs text-muted-foreground">Separa las tecnologías con comas</p>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label htmlFor="repositoryUrl" className="flex items-center gap-2 text-sm font-semibold">
                  <Github className="h-4 w-4 text-purple-600" />
                  Repositorio
                </Label>
                <Input
                  id="repositoryUrl"
                  placeholder="https://github.com/..."
                  {...register('repositoryUrl')}
                  disabled={isLoading}
                  className="h-12 border-2 hover:border-purple-300 transition-colors"
                />
                {errors.repositoryUrl && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.repositoryUrl.message}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="demoUrl" className="flex items-center gap-2 text-sm font-semibold">
                  <Globe className="h-4 w-4 text-purple-600" />
                  Demo/Live URL
                </Label>
                <Input
                  id="demoUrl"
                  placeholder="https://mi-proyecto.vercel.app"
                  {...register('demoUrl')}
                  disabled={isLoading}
                  className="h-12 border-2 hover:border-purple-300 transition-colors"
                />
                {errors.demoUrl && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.demoUrl.message}
                  </p>
                )}
              </div>
            </div>

            {/* Subida de archivos */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <Upload className="h-4 w-4 text-purple-600" />
                Archivos del Proyecto <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-200 dark:border-purple-900 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  aria-label="Subir archivos"
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                    <p className="text-sm font-medium text-purple-600">Subiendo archivos...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-purple-100 dark:bg-purple-950 rounded-2xl">
                      <Upload className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Arrastra archivos o haz clic aquí</p>
                      <p className="text-xs text-muted-foreground">
                        Capturas, videos, PDFs y documentación
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de archivos subidos con previsualización */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3 mt-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {uploadedFiles.length} {uploadedFiles.length === 1 ? 'archivo' : 'archivos'} adjuntado{uploadedFiles.length === 1 ? '' : 's'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="relative group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-100 dark:border-purple-900 overflow-hidden hover:shadow-md transition-all"
                      >
                        {/* Previsualización del archivo */}
                        <div className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                          {file.type === 'image' ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImagen%3C/text%3E%3C/svg%3E'
                              }}
                            />
                          ) : file.type === 'video' ? (
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
                                <FileText className="h-8 w-8 text-purple-600" />
                              </div>
                              <p className="text-xs text-center font-medium text-gray-600 dark:text-gray-400">
                                Documento
                              </p>
                            </div>
                          )}
                          
                          {/* Overlay con ícono de play para videos */}
                          {file.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <div className="p-3 bg-white/90 dark:bg-gray-900/90 rounded-full">
                                <Video className="h-6 w-6 text-purple-600" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Información del archivo */}
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate mb-1">{file.name}</p>
                              <Badge variant="secondary" className={`text-xs ${getFileTypeBadge(file.type)}`}>
                                {file.type}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 flex-shrink-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
                className="flex-1 h-11"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isUploading} 
                className="flex-1 h-11 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Publicando...' : 'Documentar Proyecto'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
