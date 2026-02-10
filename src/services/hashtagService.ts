import { apiClient } from '@/lib/axios'
import type { Hashtag } from '@/types'

export const hashtagService = {
  // Obtener todos los hashtags
  getAll: async (): Promise<Hashtag[]> => {
    const { data } = await apiClient.get<Hashtag[]>('/hashtags')
    return data
  },

  // Obtener un hashtag por ID
  getById: async (id: number): Promise<Hashtag> => {
    const { data } = await apiClient.get<Hashtag>(`/hashtags/${id}`)
    return data
  },

  // Obtener hashtags populares
  getPopular: async (limit: number = 10): Promise<Hashtag[]> => {
    const { data } = await apiClient.get<Hashtag[]>('/hashtags/popular', {
      params: { limit },
    })
    return data
  },

  // Buscar hashtag por nombre
  getByName: async (name: string): Promise<Hashtag> => {
    const { data } = await apiClient.get<Hashtag>(`/hashtags/name/${name}`)
    return data
  },
}
