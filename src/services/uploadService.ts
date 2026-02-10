import { apiClient } from '@/lib/axios'

export interface UploadResponse {
  url: string
  secureUrl: string
  publicId: string
  format?: string
  width?: number
  height?: number
  duration?: number
  bytes?: number
  originalFilename?: string
}

export type FileType = 'image' | 'video' | 'document'

// Tipo simplificado para uso en componentes
export interface UploadedFile {
  url: string
  publicId: string
  name: string
  type: FileType
}

export const uploadService = {
  // Subir una imagen
  uploadImage: async (file: File): Promise<UploadedFile> => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await apiClient.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      url: data.secureUrl || data.url,
      publicId: data.publicId,
      name: data.originalFilename || file.name,
      type: 'image',
    }
  },

  // Subir un video
  uploadVideo: async (file: File): Promise<UploadedFile> => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await apiClient.post<UploadResponse>('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      url: data.secureUrl || data.url,
      publicId: data.publicId,
      name: data.originalFilename || file.name,
      type: 'video',
    }
  },

  // Subir un documento
  uploadDocument: async (file: File): Promise<UploadedFile> => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await apiClient.post<UploadResponse>('/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      url: data.secureUrl || data.url,
      publicId: data.publicId,
      name: data.originalFilename || file.name,
      type: 'document',
    }
  },

  // Subir archivo detectando el tipo automáticamente
  uploadFile: async (file: File): Promise<UploadedFile> => {
    const mimeType = file.type

    if (mimeType.startsWith('image/')) {
      return uploadService.uploadImage(file)
    } else if (mimeType.startsWith('video/')) {
      return uploadService.uploadVideo(file)
    } else {
      return uploadService.uploadDocument(file)
    }
  },

  // Eliminar archivo
  deleteFile: async (publicId: string): Promise<void> => {
    await apiClient.delete('/upload/file', {
      data: { publicId },
    })
  },

  // Detectar el tipo de archivo
  getFileType: (file: File): FileType => {
    const mimeType = file.type
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    return 'document'
  },

  // Obtener extensión del archivo
  getFileExtension: (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  },
}
