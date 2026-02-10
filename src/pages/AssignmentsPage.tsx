import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentService } from '@/services/assignmentService'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  ClipboardList, 
  BookOpen, 
  Calendar,
  Trash2, 
  ExternalLink,
  FileText,
  Download
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CreateAssignmentDialog from '@/components/assignments/CreateAssignmentDialog'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { FileAttachment, Assignment } from '@/types'

export default function AssignmentsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Ahora obtenemos solo MIS tareas (repositorio personal)
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => assignmentService.getMyRepository(),
  })

  // Mutación para eliminar tarea
  const deleteMutation = useMutation({
    mutationFn: (id: number) => assignmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] })
      toast({
        title: 'Tarea eliminada',
        description: 'La tarea ha sido eliminada exitosamente',
      })
      setShowDetails(false)
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar la tarea',
      })
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
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

  const openAssignmentDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setShowDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mis Tareas</h1>
            <p className="text-muted-foreground">Tu repositorio personal de tareas y pendientes</p>
          </div>
        </div>
        <CreateAssignmentDialog />
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : assignments && assignments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment: Assignment) => (
            <Card
              key={assignment.id}
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300 overflow-hidden"
            >
              {/* Header con gradiente */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4">
                <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                  {assignment.title || 'Sin título'}
                </CardTitle>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <BookOpen className="h-4 w-4" />
                  <span className="line-clamp-1">
                    {assignment.curriculumSubject?.name || assignment.subject?.name || 'Sin materia'}
                  </span>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {/* Descripción */}
                {assignment.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {assignment.description}
                  </p>
                )}

                {/* Fecha de entrega */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>Entrega: {formatDate(assignment.dueDate)}</span>
                </div>

                {/* Archivos adjuntos */}
                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2 border-t">
                    <FileText className="h-4 w-4" />
                    <span>{assignment.attachments.length} archivo{assignment.attachments.length > 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openAssignmentDetails(assignment)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver más
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(assignment.id)
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
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No hay tareas registradas aún
            </p>
            <CreateAssignmentDialog />
          </CardContent>
        </Card>
      )}

      {/* Modal de detalles de la tarea */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedAssignment && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">
                      {selectedAssignment.title || 'Sin título'}
                    </DialogTitle>
                    <DialogDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {selectedAssignment.curriculumSubject?.name || selectedAssignment.subject?.name || 'Sin materia'}
                        </span>
                      </div>
                    </DialogDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selectedAssignment.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Descripción completa */}
                {selectedAssignment.description && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      Descripción
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedAssignment.description}
                    </p>
                  </div>
                )}

                {/* Fecha de entrega */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    Fecha de Entrega
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedAssignment.dueDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                </div>

                {/* Archivos adjuntos */}
                {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      Archivos Adjuntos ({selectedAssignment.attachments.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedAssignment.attachments.map((attachment: FileAttachment, index: number) => (
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
                                <FileText className="h-12 w-12 text-green-600 mb-2" />
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
