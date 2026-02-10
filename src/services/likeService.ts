import { apiClient } from '@/lib/axios'
import type { Like } from '@/types'

export const likeService = {
  // Dar like a un post
  likePost: async (postId: number, userId: number): Promise<Like> => {
    const { data } = await apiClient.post<Like>('/likes', { postId, userId })
    return data
  },

  // Quitar like de un post
  unlikePost: async (postId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/likes/${postId}/${userId}`)
  },

  // Obtener likes de un post
  getLikesByPost: async (postId: number): Promise<Like[]> => {
    const { data } = await apiClient.get<Like[]>(`/likes/post/${postId}`)
    return data
  },

  // Contar likes de un post
  countLikes: async (postId: number): Promise<number> => {
    const { data } = await apiClient.get<number>(`/likes/post/${postId}/count`)
    return data
  },

  // Verificar si un usuario dio like a un post
  hasLiked: async (postId: number, userId: number): Promise<boolean> => {
    const { data } = await apiClient.get<boolean>(`/likes/post/${postId}/has-liked/${userId}`)
    return data
  },
}
