import { apiClient } from '@/lib/axios'
import type { Highlight } from '@/types'

export interface CreateHighlightDto {
  postId: number
  comment?: string
}

export const highlightService = {
  // Destacar un post
  highlight: async (data: CreateHighlightDto): Promise<Highlight> => {
    const { data: result } = await apiClient.post<Highlight>('/highlights', data)
    return result
  },

  // Quitar destacado de un post
  removeHighlight: async (postId: number): Promise<void> => {
    await apiClient.delete(`/highlights/${postId}`)
  },

  // Obtener todos los highlights de un post
  getPostHighlights: async (postId: number): Promise<Highlight[]> => {
    const { data } = await apiClient.get<Highlight[]>(`/highlights/post/${postId}`)
    return data
  },

  // Contar highlights de un post
  countHighlights: async (postId: number): Promise<{ count: number }> => {
    const { data } = await apiClient.get<{ count: number }>(`/highlights/post/${postId}/count`)
    return data
  },

  // Verificar si el usuario actual ha destacado un post
  hasHighlighted: async (postId: number): Promise<{ hasHighlighted: boolean }> => {
    const { data } = await apiClient.get<{ hasHighlighted: boolean }>(
      `/highlights/post/${postId}/has-highlighted`
    )
    return data
  },

  // Obtener todos los posts destacados por un docente
  getTeacherHighlights: async (teacherId: number): Promise<Highlight[]> => {
    const { data } = await apiClient.get<Highlight[]>(`/highlights/teacher/${teacherId}`)
    return data
  },
}
