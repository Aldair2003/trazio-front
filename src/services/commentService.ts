import { apiClient } from '@/lib/axios'
import type { Comment, CreateCommentDto, CommentFilters } from '@/types'

export const commentService = {
  // Obtener todos los comentarios con filtros
  getAll: async (filters?: CommentFilters): Promise<Comment[]> => {
    const { data } = await apiClient.get<Comment[]>('/comments', { params: filters })
    return data
  },

  // Obtener un comentario por ID
  getById: async (id: number): Promise<Comment> => {
    const { data } = await apiClient.get<Comment>(`/comments/${id}`)
    return data
  },

  // Crear comentario
  create: async (commentData: CreateCommentDto): Promise<Comment> => {
    const { data } = await apiClient.post<Comment>('/comments', commentData)
    return data
  },

  // Actualizar comentario
  update: async (id: number, commentData: { content: string }): Promise<Comment> => {
    const { data } = await apiClient.patch<Comment>(`/comments/${id}`, commentData)
    return data
  },

  // Eliminar comentario
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/comments/${id}`)
  },

  // Obtener comentarios de una publicación
  getByPost: async (postId: number): Promise<Comment[]> => {
    return commentService.getAll({ postId })
  },
}
