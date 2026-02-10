import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { postService } from '@/services/postService'
import { uploadService, FileType } from '@/services/uploadService'
import { useAuthStore } from '@/stores/authStore'
import { Loader2, Plus, Image as ImageIcon, Video, FileText, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { extractHashtags } from '@/lib/utils'

const postSchema = z.object({
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
})

type PostFormData = z.infer<typeof postSchema>

interface SelectedFile {
  file: File
  preview: string
  type: FileType
}

export default function CreatePostDialog() {
  const { toast } = useToast()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  })

  const content = watch('content')
  const hashtags = content ? extractHashtags(content) : []

  const createPostMutation = useMutation({
    mutationFn: postService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: '¡Publicación creada!',
        description: 'Tu publicación ha sido compartida exitosamente',
      })
      reset()
      setSelectedFile(null)
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear la publicación',
      })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileType = uploadService.getFileType(file)
      
      // Validar tamaño según tipo
      const maxSize = fileType === 'video' ? 100 : fileType === 'document' ? 50 : 10
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Archivo muy grande',
          description: `El archivo no debe superar ${maxSize}MB`,
        })
        return
      }

      // Crear preview
      if (fileType === 'image') {
        const reader = new FileReader()
        reader.onloadend = () => {
          setSelectedFile({
            file,
            preview: reader.result as string,
            type: fileType,
          })
        }
        reader.readAsDataURL(file)
      } else if (fileType === 'video') {
        const videoUrl = URL.createObjectURL(file)
        setSelectedFile({
          file,
          preview: videoUrl,
          type: fileType,
        })
      } else {
        setSelectedFile({
          file,
          preview: '',
          type: fileType,
        })
      }
    }
  }

  const handleRemoveFile = () => {
    if (selectedFile?.type === 'video' && selectedFile.preview) {
      URL.revokeObjectURL(selectedFile.preview)
    }
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: PostFormData) => {
    if (!user) return

    setIsLoading(true)

    try {
      let filePath: string | undefined = undefined
      let fileType: FileType | undefined = undefined
      let fileName: string | undefined = undefined

      // Subir archivo si existe
      if (selectedFile) {
        const { data: uploadResult, fileType: type } = await uploadService.uploadFile(selectedFile.file)
        filePath = uploadResult.secureUrl || uploadResult.url
        fileType = type
        fileName = selectedFile.file.name
      }

      // Crear publicación
      createPostMutation.mutate({
        userId: Number(user.id),
        content: data.content,
        hashtags: hashtags,
        filePath,
        fileType,
        fileName,
      })
    } catch (error: any) {
      setIsLoading(false)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo subir el archivo',
      })
    }
  }

  const getFileIcon = () => {
    if (!selectedFile) return null
    switch (selectedFile.type) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-blue-500" />
      case 'video':
        return <Video className="h-8 w-8 text-purple-500" />
      case 'document':
        return <FileText className="h-8 w-8 text-orange-500" />
    }
  }

  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header con gradiente sutil */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-gray-100">
        <h3 className="flex items-center gap-2 font-semibold text-gray-800">
          <div className="p-1.5 bg-blue-500 rounded-md">
            <Plus className="h-3.5 w-3.5 text-white" />
          </div>
          Crear Publicación
        </h3>
      </div>
      
      <CardContent className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Textarea mejorado */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700">
              ¿Qué quieres compartir?
            </Label>
            <Textarea
              id="content"
              placeholder="Comparte tus experiencias, consejos o reflexiones académicas... Usa #hashtags para categorizar"
              className="min-h-[100px] resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-colors"
              {...register('content')}
              disabled={isLoading}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
              {hashtags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* File Upload - Diseño mejorado */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Archivo multimedia (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-1 border-dashed border-2 hover:border-blue-400 hover:bg-blue-50/50 transition-colors h-12"
              >
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                  <Video className="h-4 w-4 text-purple-500" />
                  <FileText className="h-4 w-4 text-orange-500" />
                </div>
                <span className="ml-3 font-medium">{selectedFile ? 'Cambiar archivo' : 'Agregar archivo'}</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Imágenes (max 10MB), Videos (max 100MB), Documentos PDF/Word/Excel/PowerPoint (max 50MB)
            </p>

            {/* Preview del archivo seleccionado */}
            {selectedFile && (
              <div className="relative border-2 border-gray-100 rounded-lg p-4 bg-gray-50/50">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-7 w-7"
                  onClick={handleRemoveFile}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>

                {selectedFile.type === 'image' && (
                  <img
                    src={selectedFile.preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                )}

                {selectedFile.type === 'video' && (
                  <video
                    src={selectedFile.preview}
                    controls
                    className="w-full h-48 rounded-md"
                  />
                )}

                {selectedFile.type === 'document' && (
                  <div className="flex items-center gap-3 py-4">
                    {getFileIcon()}
                    <div>
                      <p className="font-medium text-sm">{selectedFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botón de publicar mejorado */}
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Publicando...' : 'Publicar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
