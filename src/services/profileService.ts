import { apiClient } from '@/lib/axios'

export const profileService = {
  // Obtener mi perfil completo
  getMyProfile: async () => {
    const response = await apiClient.get('/profile/me')
    return response.data
  },

  // Obtener perfil público de otro usuario
  getPublicProfile: async (userId: number) => {
    const response = await apiClient.get(`/profile/${userId}`)
    return response.data
  },

  // Actualizar perfil de estudiante
  updateStudentProfile: async (data: any) => {
    const response = await apiClient.put('/profile/student', data)
    return response.data
  },

  // Actualizar perfil de docente
  updateTeacherProfile: async (data: { institutionalEmail?: string; bio?: string }) => {
    const response = await apiClient.put('/profile/teacher', data)
    return response.data
  },

  // Actualizar foto de perfil
  updateProfileImage: async (imageUrl: string) => {
    const response = await apiClient.put('/profile/image', { imageUrl })
    return response.data
  },

  // Obtener historial académico
  getStudentHistory: async () => {
    const response = await apiClient.get('/profile/history')
    return response.data
  },
}
