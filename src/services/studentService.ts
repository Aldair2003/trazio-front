import { apiClient } from '@/lib/axios'
import type { User, Student } from '@/types'

export interface StudentSubject {
  id: number
  curriculumSubjectId: number
  semester: number
  isActive: boolean
  isDragged: boolean
  curriculumSubject: {
    id: number
    name: string
    code: string
    semester: number
    credits: number
    curriculum: {
      id: number
      name: string
    }
  }
  teacher?: {
    id: number
    name: string
    profileImage?: string
  }
}

export const studentService = {
  // Obtener todos los estudiantes
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users')
    return data
  },

  // Obtener un estudiante por ID
  getById: async (id: number): Promise<Student> => {
    const { data } = await apiClient.get<Student>(`/users/${id}`)
    return data
  },

  // Obtener las materias del estudiante actual
  getMySubjects: async (): Promise<StudentSubject[]> => {
    const { data } = await apiClient.get<StudentSubject[]>('/student-subjects/my-subjects')
    return data
  },

  // Crear estudiante
  create: async (studentData: { name: string; email: string; password: string }): Promise<User> => {
    const { data } = await apiClient.post<User>('/users/register', studentData)
    return data
  },

  // Actualizar estudiante
  update: async (id: number, studentData: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}`, studentData)
    return data
  },

  // Eliminar estudiante
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}
