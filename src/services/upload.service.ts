import axios from 'axios';

const API_URL = 'http://localhost:3000';

export interface UploadResponse {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
}

class UploadService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    };
  }

  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload/image`, formData, {
        ...this.getAuthHeader(),
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al subir la imagen');
    }
  }

  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload/video`, formData, {
        ...this.getAuthHeader(),
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al subir el video');
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/upload/file`, {
        ...this.getAuthHeader(),
        data: { publicId },
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar el archivo');
    }
  }

  // Validaciones
  validateImageFile(file: File): string | null {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)';
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'La imagen es demasiado grande. Máximo 10MB';
    }

    return null;
  }

  validateVideoFile(file: File): string | null {
    const validTypes = [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/webm',
    ];
    if (!validTypes.includes(file.type)) {
      return 'Solo se permiten archivos de video (MP4, MOV, AVI, WMV, FLV, WEBM)';
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return 'El video es demasiado grande. Máximo 100MB';
    }

    return null;
  }
}

export default new UploadService();
