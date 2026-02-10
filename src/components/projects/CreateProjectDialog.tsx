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
  Image, 
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

  const getFileIcon = (type: string) => {
    if (type === 'image') return <Image className="h-4 w-4" />
    if (type === 'video') return <Video className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
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
        <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white text-xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <FolderOpen className="h-6 w-6" />
              </div>
              Registrar Nuevo Proyecto
            </DialogTitle>
            <p className="text-purple-100 mt-2">
              Registra tus proyectos para llevar control de tu portafolio
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Título del Proyecto */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium">
              <Code className="h-4 w-4 text-purple-600" />
              Título del Proyecto
            </Label>
            <Input
              id="title"
              placeholder="Ej: Sistema de Gestión de Inventario"
              {...register('title')}
              disabled={isLoading}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Materia y Estado en fila */}
          {/* Materia */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-purple-600" />
              Materia
            </Label>
            <Select
              value={selectedSubjectId}
              onValueChange={(value) => setValue('curriculumSubjectId', value)}
              disabled={isLoading || loadingSubjects}
            >
              <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue placeholder={loadingSubjects ? 'Cargando...' : 'Selecciona una materia'} />
              </SelectTrigger>
              <SelectContent>
                {mySubjects?.map((subject: any) => (
                  <SelectItem key={subject.curriculumSubjectId} value={String(subject.curriculumSubjectId)}>
                    {subject.curriculumSubject?.name || subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.curriculumSubjectId && (
              <p className="text-sm text-destructive">{errors.curriculumSubjectId.message}</p>
            )}
          </div>

          {/* Fecha de Entrega */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium">Fecha de Entrega</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
              disabled={isLoading}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Descripción del Proyecto</Label>
            <Textarea
              id="description"
              placeholder="Describe tu proyecto: objetivos, funcionalidades principales, tecnologías utilizadas..."
              className="min-h-[100px] border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Tecnologías */}
          <div className="space-y-2">
            <Label htmlFor="technologies" className="flex items-center gap-2 text-sm font-medium">
              <Code className="h-4 w-4 text-purple-600" />
              Tecnologías Utilizadas
            </Label>
            <Input
              id="technologies"
              placeholder="React, Node.js, PostgreSQL, TypeScript (separadas por coma)"
              {...register('technologies')}
              disabled={isLoading}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
            <p className="text-xs text-muted-foreground">Separa las tecnologías con comas</p>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repositoryUrl" className="flex items-center gap-2 text-sm font-medium">
                <Github className="h-4 w-4" />
                Repositorio
              </Label>
              <Input
                id="repositoryUrl"
                placeholder="https://github.com/..."
                {...register('repositoryUrl')}
                disabled={isLoading}
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
              {errors.repositoryUrl && (
                <p className="text-sm text-destructive">{errors.repositoryUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="demoUrl" className="flex items-center gap-2 text-sm font-medium">
                <Globe className="h-4 w-4" />
                Demo/Live URL
              </Label>
              <Input
                id="demoUrl"
                placeholder="https://mi-proyecto.vercel.app"
                {...register('demoUrl')}
                disabled={isLoading}
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
              {errors.demoUrl && (
                <p className="text-sm text-destructive">{errors.demoUrl.message}</p>
              )}
            </div>
          </div>

          {/* Subida de archivos */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Upload className="h-4 w-4 text-purple-600" />
              Archivos del Proyecto
            </Label>
            <p className="text-xs text-muted-foreground">
              Sube capturas, videos de demostración, documentación o cualquier archivo relevante
            </p>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Subiendo archivos...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload className="h-8 w-8" />
                  <span>Click para subir archivos</span>
                  <span className="text-xs">Imágenes, videos, PDFs, documentos</span>
                </div>
              )}
            </div>

            {/* Lista de archivos subidos */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                        <Badge variant="secondary" className={`text-xs ${getFileTypeBadge(file.type)}`}>
                          {file.type}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
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
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isUploading} 
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Proyecto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
