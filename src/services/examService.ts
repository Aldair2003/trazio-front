import { apiClient } from '@/lib/axios'
import type { Exam, CreateExamDto } from '@/types'

export const examService = {
  // Obtener MI repositorio de exámenes (privado)
  getMyRepository: async (): Promise<Exam[]> => {
    const { data } = await apiClient.get<Exam[]>('/exams/my-repository')
    return data
  },

  // Ver el repositorio de exámenes de otro usuario (público)
  getUserRepository: async (userId: number): Promise<Exam[]> => {
    const { data } = await apiClient.get<Exam[]>(`/exams/user/${userId}/repository`)
    return data
  },

  // Obtener MIS exámenes de una materia específica
  getByCurriculumSubject: async (curriculumSubjectId: number): Promise<Exam[]> => {
    const { data } = await apiClient.get<Exam[]>(`/exams/curriculum-subject/${curriculumSubjectId}`)
    return data
  },

  // Obtener un examen por ID
  getById: async (id: number): Promise<Exam> => {
    const { data } = await apiClient.get<Exam>(`/exams/${id}`)
    return data
  },

  // Crear examen (automáticamente se asigna al usuario autenticado)
  create: async (examData: Omit<CreateExamDto, 'userId'>): Promise<Exam> => {
    const { data } = await apiClient.post<Exam>('/exams', examData)
    return data
  },

  // Actualizar MI examen
  update: async (id: number, examData: Partial<Omit<CreateExamDto, 'userId'>>): Promise<Exam> => {
    const { data } = await apiClient.patch<Exam>(`/exams/${id}`, examData)
    return data
  },

  // Subir archivos a MI examen
  uploadFiles: async (id: number, files: File[]): Promise<Exam> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    const { data } = await apiClient.post<Exam>(`/exams/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  // Eliminar un archivo de MI examen
  deleteFile: async (id: number, publicId: string): Promise<Exam> => {
    const { data} = await apiClient.delete<Exam>(`/exams/${id}/file/${publicId}`)
    return data
  },

  // Eliminar MI examen
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/exams/${id}`)
  },
}
