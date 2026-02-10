import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { examService } from '@/services/examService'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  Calendar, 
  BookOpen, 
  Trash2, 
  ExternalLink,
  FileText,
  Download
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CreateExamDialog from '@/components/exams/CreateExamDialog'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { FileAttachment, Exam } from '@/types'

export default function ExamsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Ahora obtenemos solo MIS exámenes (repositorio personal)
  const { data: exams, isLoading } = useQuery({
    queryKey: ['my-exams'],
    queryFn: () => examService.getMyRepository(),
  })

  // Mutación para eliminar examen
  const deleteMutation = useMutation({
    mutationFn: (id: number) => examService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-exams'] })
      toast({
        title: 'Examen eliminado',
        description: 'El examen ha sido eliminado exitosamente',
      })
      setShowDetails(false)
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el examen',
      })
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este examen?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDownload = async (url: string, fileName?: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName || 'archivo'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      window.open(url, '_blank')
    }
  }

  const openExamDetails = (exam: Exam) => {
    setSelectedExam(exam)
    setShowDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mis Exámenes</h1>
            <p className="text-muted-foreground">Tu repositorio personal de exámenes</p>
          </div>
        </div>
        <CreateExamDialog />
      </div>

      {/* Exams List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : exams && exams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam: Exam) => (
            <Card
              key={exam.id}
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 p-4">
                <CardTitle className="text-blue-900 dark:text-blue-100 text-lg mb-2 line-clamp-2">
                  {exam.title || 'Sin título'}
                </CardTitle>
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                  <BookOpen className="h-4 w-4" />
                  <span className="line-clamp-1">
                    {exam.curriculumSubject?.name || exam.subject?.name || 'Sin materia'}
                  </span>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {/* Descripción */}
                {exam.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {exam.description}
                  </p>
                )}

                {/* Fecha del examen */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Fecha: {formatDate(exam.date)}</span>
                </div>

                {/* Archivos adjuntos */}
                {exam.attachments && exam.attachments.length > 0 && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2 border-t">
                    <FileText className="h-4 w-4" />
                    <span>{exam.attachments.length} archivo{exam.attachments.length > 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openExamDetails(exam)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver más
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(exam.id)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No hay exámenes registrados aún
            </p>
            <CreateExamDialog />
          </CardContent>
        </Card>
      )}

      {/* Modal de detalles del examen */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedExam && (
            <>
              <DialogHeader>
                    <DialogTitle className="text-2xl mb-2">
                      {selectedExam.title || 'Sin título'}
                    </DialogTitle>
                    <DialogDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {selectedExam.curriculumSubject?.name || selectedExam.subject?.name || 'Sin materia'}
                        </span>
                      </div>
                    </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Descripción completa */}
                {selectedExam.description && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Descripción
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedExam.description}
                    </p>
                  </div>
                )}

                {/* Fecha del examen */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Fecha del Examen
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedExam.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                </div>

                {/* Archivos adjuntos */}
                {selectedExam.attachments && selectedExam.attachments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Archivos Adjuntos ({selectedExam.attachments.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedExam.attachments.map((attachment: FileAttachment, index: number) => (
                        <div
                          key={index}
                          className="relative group bg-gray-50 dark:bg-gray-900 rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            {attachment.fileType === 'image' ? (
                              <img
                                src={attachment.url}
                                alt={attachment.fileName}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => window.open(attachment.url, '_blank')}
                                onError={(e) => {
                                  const parent = e.currentTarget.parentElement
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="flex flex-col items-center justify-center p-4">
                                        <svg class="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p class="text-sm text-gray-500">Imagen no disponible</p>
                                      </div>
                                    `
                                  }
                                }}
                              />
                            ) : attachment.fileType === 'video' ? (
                              <div className="relative w-full h-full group">
                                <video
                                  src={attachment.url}
                                  className="w-full h-full object-cover"
                                  preload="metadata"
                                  controls
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-4 h-full">
                                <FileText className="h-12 w-12 text-blue-600 mb-2" />
                                <p className="text-xs text-center text-gray-600 dark:text-gray-400 font-medium px-2">{attachment.fileName}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3 bg-white dark:bg-gray-800">
                            <p className="text-sm font-medium truncate mb-2">
                              {attachment.fileName || `Archivo ${index + 1}`}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {attachment.fileType}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                onClick={() => handleDownload(attachment.url, attachment.fileName)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Descargar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón de eliminar al final */}
                <div className="pt-4 border-t flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedExam.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
