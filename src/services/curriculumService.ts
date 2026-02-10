import { apiClient } from '@/lib/axios'
import type { Curriculum, CurriculumSubject } from '@/types'

export const curriculumService = {
  // Obtener todas las mallas curriculares
  getAllCurriculums: async (): Promise<Curriculum[]> => {
    const response = await apiClient.get<Curriculum[]>('/curriculum')
    return response.data
  },

  // Obtener una malla por ID
  getCurriculumById: async (id: number) => {
    const response = await apiClient.get(`/curriculum/${id}`)
    return response.data
  },

  // Obtener lista de semestres de una malla
  getSemestersByCurriculum: async (curriculumId: number): Promise<number[]> => {
    const response = await apiClient.get<number[]>(`/curriculum/${curriculumId}/semesters`)
    return response.data
  },

  // Obtener todas las materias de una malla
  getAllSubjectsByCurriculum: async (curriculumId: number): Promise<CurriculumSubject[]> => {
    const response = await apiClient.get<CurriculumSubject[]>(`/curriculum/${curriculumId}/subjects`)
    return response.data
  },

  // Obtener materias de un semestre específico
  getSubjectsBySemester: async (
    curriculumId: number,
    semester: number
  ): Promise<CurriculumSubject[]> => {
    const response = await apiClient.get<CurriculumSubject[]>(
      `/curriculum/${curriculumId}/semester/${semester}/subjects`
    )
    return response.data
  },
}
