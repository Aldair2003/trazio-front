import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { UploadResponse } from '../services/upload.service';
import { Lightbulb, BookOpen } from 'lucide-react';

/**
 * Componente de ejemplo que muestra cómo usar FileUploader
 * Puedes usar este componente como referencia o integrarlo en tus formularios
 */
export const MediaUploadExample: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadResponse[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleImageUpload = (result: UploadResponse) => {
    console.log('Imagen subida:', result);
    setUploadedImages([...uploadedImages, result]);
    setErrorMessage('');
  };

  const handleVideoUpload = (result: UploadResponse) => {
    console.log('Video subido:', result);
    setUploadedVideos([...uploadedVideos, result]);
    setErrorMessage('');
  };

  const handleError = (error: string) => {
    console.error('Error:', error);
    setErrorMessage(error);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Subir Archivos a Cloudinary</h1>
        <p className="text-gray-600">
          Sube imágenes y videos de forma fácil y rápida
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Subir Imágenes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Subir Imagen</h2>
          <FileUploader
            type="image"
            onUploadComplete={handleImageUpload}
            onError={handleError}
          />
          
          {uploadedImages.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Imágenes subidas:</h3>
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.secureUrl}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-32 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded flex items-center justify-center">
                      <a
                        href={img.secureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white opacity-0 group-hover:opacity-100 text-sm"
                      >
                        Ver imagen
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subir Videos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Subir Video</h2>
          <FileUploader
            type="video"
            onUploadComplete={handleVideoUpload}
            onError={handleError}
          />
          
          {uploadedVideos.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Videos subidos:</h3>
              <div className="space-y-2">
                {uploadedVideos.map((video, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <video
                      src={video.secureUrl}
                      controls
                      className="w-full rounded"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Duración: {video.duration?.toFixed(1)}s | Formato: {video.format}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información de URLs */}
      {(uploadedImages.length > 0 || uploadedVideos.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Información de las URLs
          </h3>
          <p className="text-sm text-gray-700">
            Las URLs generadas son permanentes y están alojadas en Cloudinary.
            Puedes usar estas URLs en tus publicaciones, perfiles o cualquier parte de tu aplicación.
          </p>
          {uploadedImages.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-mono bg-white p-2 rounded break-all">
                {uploadedImages[uploadedImages.length - 1].secureUrl}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Guía de uso */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Cómo usar en tu código:
        </h3>
        <div className="space-y-2 text-sm">
          <div className="bg-white p-3 rounded font-mono text-xs overflow-x-auto">
            {`import { FileUploader } from './components/FileUploader';

<FileUploader
  type="image"  // o "video" o "both"
  onUploadComplete={(result) => {
    console.log('URL:', result.secureUrl);
    // Guarda result.secureUrl en tu estado o base de datos
  }}
  onError={(error) => {
    console.error(error);
  }}
/>`}
          </div>
        </div>
      </div>
    </div>
  );
};
