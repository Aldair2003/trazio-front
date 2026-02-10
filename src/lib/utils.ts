import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  if (!date) return 'Fecha no disponible'
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return 'Fecha inválida'
  
  return parsed.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
  }

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval)
    if (interval >= 1) {
      return `Hace ${interval} ${name}${interval > 1 ? (name === 'mes' ? 'es' : 's') : ''}`
    }
  }

  return 'Hace un momento'
}

export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u00C0-\u024F]+/g
  const matches = text.match(hashtagRegex)
  return matches ? matches.map((tag) => tag.slice(1)) : []
}
