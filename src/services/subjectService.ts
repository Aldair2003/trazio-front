import { apiClient } from '@/lib/axios'
import type { Subject, CreateSubjectDto } from '@/types'

export const subjectService = {
  // Obtener todas las materias
  getAll: async (): Promise<Subject[]> => {
    const { data } = await apiClient.get<Subject[]>('/subjects')
    return data
  },

  // Obtener una materia por ID
  getById: async (id: number): Promise<Subject> => {
    const { data } = await apiClient.get<Subject>(`/subjects/${id}`)
    return data
  },

  // Crear materia
  create: async (subjectData: CreateSubjectDto): Promise<Subject> => {
    const { data } = await apiClient.post<Subject>('/subjects', subjectData)
    return data
  },

  // Actualizar materia
  update: async (id: number, subjectData: Partial<CreateSubjectDto>): Promise<Subject> => {
    const { data } = await apiClient.patch<Subject>(`/subjects/${id}`, subjectData)
    return data
  },

  // Eliminar materia
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/subjects/${id}`)
  },
}
