import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/services/profileService'
import { useToast } from '@/hooks/use-toast'
import { Camera, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

interface ProfileImageUploadProps {
  currentImage?: string
}

const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME' // TODO: Configurar en variables de entorno
const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET' // TODO: Configurar en variables de entorno

export default function ProfileImageUpload({ currentImage: _currentImage }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user, setUser } = useAuthStore()

  const updateImageMutation = useMutation({
    mutationFn: profileService.updateProfileImage,
    onSuccess: (data) => {
      toast({
        title: 'Foto actualizada',
        description: 'Tu foto de perfil ha sido actualizada exitosamente',
      })
      
      // Actualizar el usuario en el store
      if (user) {
        setUser({ ...user, profileImage: data.profileImage })
      }
      
      // Invalidar todas las queries de perfil para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setUploading(false)
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar la foto',
        variant: 'destructive',
      })
      setUploading(false)
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Solo se permiten imágenes',
        variant: 'destructive',
      })
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'La imagen no debe superar los 5MB',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await response.json()
      updateImageMutation.mutate(data.secure_url)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Error',
        description: 'No se pudo subir la imagen',
        variant: 'destructive',
      })
      setUploading(false)
    }
  }

  return (
    <div className="relative">
      <input
        type="file"
        id="profile-image-upload"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <label
        htmlFor="profile-image-upload"
        className="absolute -bottom-1 -right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </label>
    </div>
  )
}
