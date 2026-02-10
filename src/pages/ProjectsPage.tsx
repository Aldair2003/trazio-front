import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '@/services/projectService'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  FolderOpen, 
  BookOpen, 
  Calendar, 
  Github, 
  Globe, 
  Code, 
  Trash2, 
  ExternalLink,
  FileText,
  Download,
  Users
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import CreateProjectDialog from '@/components/projects/CreateProjectDialog'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { FileAttachment, Project } from '@/types'

export default function ProjectsPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Ahora obtenemos solo MIS proyectos (repositorio personal)
  const { data: projects, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectService.getMyRepository(),
  })

  // Mutación para eliminar proyecto
  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] })
      toast({
        title: 'Proyecto eliminado',
        description: 'El proyecto ha sido eliminado exitosamente',
      })
      setShowDetails(false)
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el proyecto',
      })
    },
  })

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
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

  const openProjectDetails = (project: Project) => {
    setSelectedProject(project)
    setShowDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mis Proyectos</h1>
            <p className="text-muted-foreground">Tu repositorio personal de proyectos académicos</p>
          </div>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4">
                <CardTitle className="text-purple-900 dark:text-purple-100 text-lg mb-2 line-clamp-2">
                  {project.title || 'Sin título'}
                </CardTitle>
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-sm">
                  <BookOpen className="h-4 w-4" />
                  <span className="line-clamp-1">
                    {project.curriculumSubject?.name || project.subject?.name || 'Sin materia'}
                  </span>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {/* Descripción */}
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description}
                  </p>
                )}

                {/* Fecha de entrega */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>Entrega: {formatDate(project.dueDate)}</span>
                </div>

                {/* Tecnologías */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 3).map((tech: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Enlaces */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {project.repositoryUrl && (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs transition-colors"
                    >
                      <Github className="h-3 w-3" />
                      Repo
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                    >
                      <Globe className="h-3 w-3" />
                      Demo
                    </a>
                  )}
                </div>

                {/* Archivos adjuntos */}
                {project.attachments && project.attachments.length > 0 && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2 border-t">
                    <FileText className="h-4 w-4" />
                    <span>{project.attachments.length} archivo{project.attachments.length > 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openProjectDetails(project)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver más
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(project.id)
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
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No hay proyectos registrados aún
            </p>
            <CreateProjectDialog />
          </CardContent>
        </Card>
      )}

      {/* Modal de detalles del proyecto */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                    <DialogTitle className="text-2xl mb-2">
                      {selectedProject.title || 'Sin título'}
                    </DialogTitle>
                    <DialogDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {selectedProject.curriculumSubject?.name || selectedProject.subject?.name || 'Sin materia'}
                        </span>
                      </div>
                    </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Descripción completa */}
                {selectedProject.description && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      Descripción
                    </h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedProject.description}
                    </p>
                  </div>
                )}

                {/* Fecha de entrega */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    Fecha de Entrega
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedProject.dueDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                </div>

                {/* Tecnologías */}
                {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4 text-purple-600" />
                      Tecnologías Utilizadas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enlaces */}
                <div>
                  <h3 className="font-semibold mb-2">Enlaces del Proyecto</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedProject.repositoryUrl && (
                      <a
                        href={selectedProject.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        Ver Repositorio
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {selectedProject.demoUrl && (
                      <a
                        href={selectedProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Ver Demo en Vivo
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Colaboradores */}
                {selectedProject.collaborators && selectedProject.collaborators.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      Colaboradores
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.collaborators.length} colaborador{selectedProject.collaborators.length > 1 ? 'es' : ''}
                    </p>
                  </div>
                )}

                {/* Archivos adjuntos */}
                {selectedProject.attachments && selectedProject.attachments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      Archivos Adjuntos ({selectedProject.attachments.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProject.attachments.map((attachment: FileAttachment, index: number) => (
                        <div
                          key={index}
                          className="relative group bg-gray-50 dark:bg-gray-900 rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {/* Previsualización grande */}
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
                                <FileText className="h-12 w-12 text-purple-600 mb-2" />
                                <p className="text-xs text-center text-gray-600 dark:text-gray-400 font-medium px-2">{attachment.fileName}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Información y botón de descarga */}
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
                    onClick={() => handleDelete(selectedProject.id)}
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
