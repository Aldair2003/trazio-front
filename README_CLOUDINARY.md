# 📤 Guía de Uso: Subir Archivos con Cloudinary

## 🎯 Inicio Rápido

### 1. Importar el componente

```tsx
import { FileUploader } from './components/FileUploader';
import { UploadResponse } from './services/upload.service';
```

### 2. Usar en tu componente

```tsx
function MiComponente() {
  const handleUploadComplete = (result: UploadResponse) => {
    console.log('¡Archivo subido!', result.secureUrl);
    // Usa result.secureUrl para mostrar o guardar la URL
  };

  return (
    <FileUploader
      type="image"
      onUploadComplete={handleUploadComplete}
      onError={(error) => console.error(error)}
    />
  );
}
```

## 🎨 Props del componente FileUploader

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `type` | `'image' \| 'video' \| 'both'` | Tipo de archivo a subir | ✅ |
| `onUploadComplete` | `(result: UploadResponse) => void` | Callback cuando se completa la subida | ✅ |
| `onError` | `(error: string) => void` | Callback para manejar errores | ❌ |
| `className` | `string` | Clases CSS adicionales | ❌ |
| `multiple` | `boolean` | Permitir múltiples archivos | ❌ |

## 📋 Objeto UploadResponse

```typescript
{
  url: string;           // URL HTTP del archivo
  secureUrl: string;     // URL HTTPS del archivo (usa esta)
  publicId: string;      // ID para eliminar el archivo después
  format: string;        // Formato del archivo (jpg, mp4, etc.)
  width?: number;        // Ancho en píxeles (imágenes/videos)
  height?: number;       // Alto en píxeles (imágenes/videos)
  duration?: number;     // Duración en segundos (solo videos)
  bytes: number;         // Tamaño del archivo en bytes
}
```

## 💡 Ejemplos Prácticos

### Ejemplo 1: Subir imagen en un formulario de perfil

```tsx
import { useState } from 'react';
import { FileUploader } from './components/FileUploader';

function EditProfile() {
  const [profilePicture, setProfilePicture] = useState('');

  const handleImageUpload = (result) => {
    setProfilePicture(result.secureUrl);
    // Aquí guardarías en el backend
  };

  return (
    <div>
      <h2>Foto de perfil</h2>
      <FileUploader
        type="image"
        onUploadComplete={handleImageUpload}
      />
      {profilePicture && (
        <img 
          src={profilePicture} 
          alt="Profile" 
          className="w-32 h-32 rounded-full"
        />
      )}
    </div>
  );
}
```

### Ejemplo 2: Subir video para una publicación

```tsx
function CreatePost() {
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleVideoUpload = (result) => {
    setVideoUrl(result.secureUrl);
    setUploading(false);
  };

  return (
    <div>
      <h2>Añadir video</h2>
      <FileUploader
        type="video"
        onUploadComplete={handleVideoUpload}
        onError={(error) => {
          alert(error);
          setUploading(false);
        }}
      />
      {videoUrl && (
        <video src={videoUrl} controls className="w-full" />
      )}
    </div>
  );
}
```

### Ejemplo 3: Subir múltiples imágenes (galería)

```tsx
function Gallery() {
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (result) => {
    setImages([...images, result.secureUrl]);
  };

  return (
    <div>
      <h2>Galería de imágenes</h2>
      <FileUploader
        type="image"
        onUploadComplete={handleImageUpload}
      />
      <div className="grid grid-cols-3 gap-4 mt-4">
        {images.map((url, index) => (
          <img 
            key={index}
            src={url}
            alt={`Imagen ${index + 1}`}
            className="w-full h-40 object-cover rounded"
          />
        ))}
      </div>
    </div>
  );
}
```

### Ejemplo 4: Integración completa con formulario

```tsx
import { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import postsService from './services/posts.service';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const postData = {
      title,
      content,
      mediaUrl,
      mediaType,
    };

    await postsService.createPost(postData);
    alert('¡Publicación creada!');
  };

  const handleMediaUpload = (result) => {
    setMediaUrl(result.secureUrl);
    // Detectar si es imagen o video basado en el formato
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    setMediaType(
      imageFormats.includes(result.format) ? 'image' : 'video'
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label>Contenido</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={4}
        />
      </div>

      <div>
        <label>Imagen o Video (opcional)</label>
        <FileUploader
          type="both"
          onUploadComplete={handleMediaUpload}
          onError={(error) => alert(error)}
        />
      </div>

      {mediaUrl && (
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm mb-2">Vista previa:</p>
          {mediaType === 'image' ? (
            <img src={mediaUrl} alt="Preview" className="max-h-60" />
          ) : (
            <video src={mediaUrl} controls className="max-h-60" />
          )}
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Publicar
      </button>
    </form>
  );
}
```

## 🔧 Uso del Servicio Directamente

Si prefieres no usar el componente, puedes usar el servicio directamente:

```tsx
import uploadService from './services/upload.service';

async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    // Validar archivo
    const error = uploadService.validateImageFile(file);
    if (error) {
      alert(error);
      return;
    }

    // Subir con seguimiento de progreso
    const result = await uploadService.uploadImage(
      file,
      (progress) => console.log(`${progress}% completado`)
    );

    console.log('URL:', result.secureUrl);
  } catch (error) {
    console.error(error);
  }
}
```

## 🎭 Personalización del Estilo

El componente `FileUploader` acepta clases de Tailwind CSS:

```tsx
<FileUploader
  type="image"
  onUploadComplete={handleUpload}
  className="my-8"
/>
```

Para personalizar completamente, puedes copiar y modificar el componente.

## 🔐 Seguridad

- El componente requiere que el usuario esté autenticado
- El token JWT se envía automáticamente desde localStorage
- Los archivos se validan tanto en frontend como backend

## 📝 Notas Importantes

1. **URLs permanentes**: Las URLs generadas por Cloudinary son permanentes. Guárdalas en tu base de datos.
2. **Autenticación**: Asegúrate de que el usuario esté autenticado antes de mostrar el componente.
3. **Tamaños**: Imágenes máx. 10MB, Videos máx. 100MB.
4. **Formatos aceptados**:
   - Imágenes: JPG, JPEG, PNG, GIF, WEBP
   - Videos: MP4, MOV, AVI, WMV, FLV, WEBM

## 🚀 Demo

Para ver una demo completa, importa y usa `MediaUploadExample`:

```tsx
import { MediaUploadExample } from './components/MediaUploadExample';

function App() {
  return <MediaUploadExample />;
}
```

## 🆘 Solución de Problemas

### El archivo no se sube
- Verifica que estés autenticado
- Revisa la consola del navegador para ver errores
- Confirma que el backend esté corriendo en `http://localhost:3000`

### "Error al subir la imagen"
- Verifica el formato del archivo
- Confirma que el tamaño no exceda el límite
- Revisa tu conexión a internet

### El preview no se muestra
- Solo funciona con imágenes
- Los videos no muestran preview antes de subir
