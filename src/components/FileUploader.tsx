import React, { useState, useRef } from 'react';
import { Upload, X, Image, Video, Loader2, CheckCircle2 } from 'lucide-react';
import uploadService, { UploadResponse } from '../services/upload.service';

interface FileUploaderProps {
  type: 'image' | 'video' | 'both';
  onUploadComplete: (result: UploadResponse) => void;
  onError?: (error: string) => void;
  className?: string;
  multiple?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  type,
  onUploadComplete,
  onError,
  className = '',
  multiple = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Determinar el tipo de archivo
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    // Validar tipo
    if (type === 'image' && !isImage) {
      const error = 'Por favor selecciona una imagen';
      onError?.(error);
      return;
    }

    if (type === 'video' && !isVideo) {
      const error = 'Por favor selecciona un video';
      onError?.(error);
      return;
    }

    // Validar archivo
    const validationError = isImage
      ? uploadService.validateImageFile(file)
      : uploadService.validateVideoFile(file);

    if (validationError) {
      onError?.(validationError);
      return;
    }

    setFileName(file.name);

    // Mostrar preview
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Subir archivo
    setUploading(true);
    setProgress(0);

    try {
      const result = isImage
        ? await uploadService.uploadImage(file, setProgress)
        : await uploadService.uploadVideo(file, setProgress);

      onUploadComplete(result);
      
      // Limpiar después de un tiempo
      setTimeout(() => {
        setPreview(null);
        setFileName('');
        setProgress(0);
      }, 2000);
    } catch (error: any) {
      onError?.(error.message);
      setPreview(null);
      setFileName('');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setPreview(null);
    setFileName('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAcceptTypes = () => {
    if (type === 'image') return 'image/*';
    if (type === 'video') return 'video/*';
    return 'image/*,video/*';
  };

  const getIcon = () => {
    if (type === 'image') return <Image className="w-8 h-8" />;
    if (type === 'video') return <Video className="w-8 h-8" />;
    return <Upload className="w-8 h-8" />;
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        onChange={handleFileSelect}
        className="hidden"
        multiple={multiple}
        disabled={uploading}
      />

      {!preview && !uploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            {getIcon()}
            <p className="text-sm text-gray-600">
              {type === 'image' && 'Haz clic para subir una imagen'}
              {type === 'video' && 'Haz clic para subir un video'}
              {type === 'both' && 'Haz clic para subir una imagen o video'}
            </p>
            <p className="text-xs text-gray-400">
              {type === 'image' && 'JPG, PNG, GIF, WEBP (máx. 10MB)'}
              {type === 'video' && 'MP4, MOV, AVI, WEBM (máx. 100MB)'}
              {type === 'both' && 'Imágenes (10MB) o Videos (100MB)'}
            </p>
          </div>
        </div>
      )}

      {preview && (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full rounded-lg max-h-96 object-cover" />
          {!uploading && (
            <button
              onClick={clearFile}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {uploading && (
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm font-medium">{fileName}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}%</p>
        </div>
      )}

      {!uploading && progress === 100 && (
        <div className="bg-green-50 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-700">¡Archivo subido exitosamente!</span>
        </div>
      )}
    </div>
  );
};
