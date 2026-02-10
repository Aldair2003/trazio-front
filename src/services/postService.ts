import { apiClient } from '@/lib/axios'
import type { Post, CreatePostDto, UpdatePostDto, PostFilters, PostType } from '@/types'

export const postService = {
  // Obtener todas las publicaciones con filtros opcionales
  getAll: async (filters?: PostFilters): Promise<Post[]> => {
    const { data } = await apiClient.get<Post[]>('/posts', { params: filters })
    return data
  },

  // Obtener una publicación por ID
  getById: async (id: number): Promise<Post> => {
    const { data } = await apiClient.get<Post>(`/posts/${id}`)
    return data
  },

  // Crear publicación
  create: async (postData: CreatePostDto): Promise<Post> => {
    const { data } = await apiClient.post<Post>('/posts', postData)
    return data
  },

  // Actualizar publicación
  update: async (id: number, postData: UpdatePostDto): Promise<Post> => {
    const { data } = await apiClient.patch<Post>(`/posts/${id}`, postData)
    return data
  },

  // Eliminar publicación
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/posts/${id}`)
  },

  // Buscar publicaciones por texto
  search: async (searchTerm: string): Promise<Post[]> => {
    return postService.getAll({ search: searchTerm })
  },

  // Filtrar por hashtag
  getByHashtag: async (hashtag: string): Promise<Post[]> => {
    return postService.getAll({ hashtag })
  },

  // Obtener publicaciones de un estudiante
  getByStudent: async (userId: number): Promise<Post[]> => {
    return postService.getAll({ userId })
  },

  // Obtener publicaciones por tipo
  getByType: async (type: PostType): Promise<Post[]> => {
    return postService.getAll({ type })
  },

  // Obtener recursos (publicaciones tipo resource)
  getResources: async (curriculumSubjectId?: number): Promise<Post[]> => {
    return postService.getAll({ type: 'resource' as PostType, curriculumSubjectId })
  },

  // Obtener feed filtrado por materia
  getBySubject: async (curriculumSubjectId: number): Promise<Post[]> => {
    return postService.getAll({ curriculumSubjectId })
  },

  // Obtener publicaciones de un usuario específico (alias de getByStudent)
  getUserPosts: async (userId: number): Promise<Post[]> => {
    return postService.getAll({ userId })
  },
}
