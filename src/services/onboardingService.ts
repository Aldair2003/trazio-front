import { apiClient } from '@/lib/axios'
import type {
  CompleteStudentProfileDto,
  CompleteTeacherProfileDto,
  CompleteStudentProfileV2Dto,
  CompleteTeacherProfileV2Dto,
  Teacher,
  TeacherSubject,
} from '@/types'

export const onboardingService = {
  // Completar perfil de estudiante
  completeStudentProfile: async (data: CompleteStudentProfileDto) => {
    const response = await apiClient.post('/onboarding/student', data)
    return response.data
  },

  // Completar perfil de docente
  completeTeacherProfile: async (data: CompleteTeacherProfileDto) => {
    const response = await apiClient.post('/onboarding/teacher', data)
    return response.data
  },

  // Obtener todos los docentes
  getAllTeachers: async (): Promise<Teacher[]> => {
    const response = await apiClient.get<Teacher[]>('/onboarding/teachers')
    return response.data
  },

  // Obtener materias de un docente
  getTeacherSubjects: async (teacherId: number): Promise<TeacherSubject[]> => {
    const response = await apiClient.get<TeacherSubject[]>(
      `/onboarding/teachers/${teacherId}/subjects`
    )
    return response.data
  },

  // Obtener perfil completo de un docente
  getTeacherProfile: async (teacherId: number) => {
    const response = await apiClient.get(`/onboarding/teachers/${teacherId}`)
    return response.data
  },

  // ========== V2 ENDPOINTS (CON MALLAS CURRICULARES) ==========

  // Completar perfil de estudiante V2 (con malla curricular)
  completeStudentProfileV2: async (data: CompleteStudentProfileV2Dto) => {
    try {
      console.log('Datos enviados al backend:', data)
      const response = await apiClient.post('/onboarding/v2/student', data)
      return response.data
    } catch (error: any) {
      console.error('Error en completeStudentProfileV2:', error.response?.data || error)
      
      // Extraer mensaje de error del backend
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          'Error desconocido al completar el perfil'
      
      throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage)
    }
  },

  // Completar perfil de docente V2 (con malla curricular)
  completeTeacherProfileV2: async (data: CompleteTeacherProfileV2Dto) => {
    const response = await apiClient.post('/onboarding/v2/teacher', data)
    return response.data
  },
}
