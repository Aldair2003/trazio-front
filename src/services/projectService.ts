import { apiClient } from '@/lib/axios'
import type { Project, CreateProjectDto } from '@/types'

export const projectService = {
  // Obtener MI repositorio de proyectos (privado)
  getMyRepository: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects/my-repository')
    return data
  },

  // Ver el repositorio de proyectos de otro usuario (público)
  getUserRepository: async (userId: number): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>(`/projects/user/${userId}/repository`)
    return data
  },

  // Obtener MIS proyectos de una materia específica
  getByCurriculumSubject: async (curriculumSubjectId: number): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>(`/projects/curriculum-subject/${curriculumSubjectId}`)
    return data
  },

  // Obtener un proyecto por ID
  getById: async (id: number): Promise<Project> => {
    const { data } = await apiClient.get<Project>(`/projects/${id}`)
    return data
  },

  // Crear proyecto (automáticamente se asigna al usuario autenticado)
  create: async (projectData: Omit<CreateProjectDto, 'userId'>): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', projectData)
    return data
  },

  // Actualizar MI proyecto
  update: async (id: number, projectData: Partial<Omit<CreateProjectDto, 'userId'>>): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, projectData)
    return data
  },

  // Subir archivos a MI proyecto
  uploadFiles: async (id: number, files: File[]): Promise<Project> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    const { data } = await apiClient.post<Project>(`/projects/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  // Eliminar un archivo de MI proyecto
  deleteFile: async (id: number, publicId: string): Promise<Project> => {
    const { data } = await apiClient.delete<Project>(`/projects/${id}/file/${publicId}`)
    return data
  },

  // Eliminar MI proyecto
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`)
  },
}
