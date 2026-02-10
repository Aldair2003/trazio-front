import { apiClient } from '@/lib/axios'
import type { Assignment, CreateAssignmentDto } from '@/types'

export const assignmentService = {
  // Obtener MI repositorio de tareas (privado)
  getMyRepository: async (): Promise<Assignment[]> => {
    const { data } = await apiClient.get<Assignment[]>('/assignments/my-repository')
    return data
  },

  // Ver el repositorio de tareas de otro usuario (público)
  getUserRepository: async (userId: number): Promise<Assignment[]> => {
    const { data } = await apiClient.get<Assignment[]>(`/assignments/user/${userId}/repository`)
    return data
  },

  // Obtener MIS tareas de una materia específica
  getByCurriculumSubject: async (curriculumSubjectId: number): Promise<Assignment[]> => {
    const { data } = await apiClient.get<Assignment[]>(`/assignments/curriculum-subject/${curriculumSubjectId}`)
    return data
  },

  // Obtener una tarea por ID
  getById: async (id: number): Promise<Assignment> => {
    const { data } = await apiClient.get<Assignment>(`/assignments/${id}`)
    return data
  },

  // Crear tarea (automáticamente se asigna al usuario autenticado)
  create: async (assignmentData: Omit<CreateAssignmentDto, 'userId'>): Promise<Assignment> => {
    const { data } = await apiClient.post<Assignment>('/assignments', assignmentData)
    return data
  },

  // Actualizar MI tarea
  update: async (id: number, assignmentData: Partial<Omit<CreateAssignmentDto, 'userId'>>): Promise<Assignment> => {
    const { data } = await apiClient.patch<Assignment>(`/assignments/${id}`, assignmentData)
    return data
  },

  // Subir archivos a MI tarea
  uploadFiles: async (id: number, files: File[]): Promise<Assignment> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    const { data } = await apiClient.post<Assignment>(`/assignments/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  // Eliminar un archivo de MI tarea
  deleteFile: async (id: number, publicId: string): Promise<Assignment> => {
    const { data } = await apiClient.delete<Assignment>(`/assignments/${id}/file/${publicId}`)
    return data
  },

  // Eliminar MI tarea
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/assignments/${id}`)
  },
}
