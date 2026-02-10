# TRAZIO - Frontend

**TRAZIO** es una plataforma académica colaborativa que documenta la trayectoria universitaria de los estudiantes para mejorar el aprendizaje y elevar el nivel formativo entre semestres.

## 🚀 Stack Tecnológico

### Core
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server

### Estado y Data Fetching
- **TanStack Query (React Query)** - Gestión de estado del servidor
- **Zustand** - Estado global del cliente
- **Axios** - Cliente HTTP

### UI y Estilos
- **TailwindCSS** - Framework CSS utility-first
- **ShadcnUI** - Componentes UI modernos basados en Radix UI
- **Lucide React** - Iconos

### Formularios y Validación
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas

### Navegación
- **React Router DOM v6** - Enrutamiento

## 📦 Instalación

### Prerrequisitos
- Node.js >= 18
- npm o yarn
- Backend de TRAZIO corriendo en `http://localhost:3000`

### Pasos

1. **Navegar a la carpeta del frontend:**
```bash
cd trazio-front
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
Crea un archivo `.env.local` en la raíz:
```env
VITE_API_URL=http://localhost:3000
VITE_JWT_STORAGE_KEY=trazio_token
```

4. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

5. **Acceder a la aplicación:**
Abre tu navegador en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
trazio-front/
├── src/
│   ├── components/
│   │   ├── ui/                    # Componentes ShadcnUI
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── ...
│   │   ├── layout/                # Layouts
│   │   │   ├── MainLayout.tsx     # Layout principal con navbar/sidebar
│   │   │   ├── AuthLayout.tsx     # Layout de autenticación
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── posts/                 # Componentes de publicaciones
│   │       ├── CreatePostDialog.tsx
│   │       ├── PostCard.tsx
│   │       └── CommentSection.tsx
│   ├── pages/                     # Páginas de la aplicación
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── FeedPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── SubjectDetailPage.tsx
│   ├── services/                  # Servicios API
│   │   ├── authService.ts
│   │   ├── postService.ts
│   │   ├── commentService.ts
│   │   ├── studentService.ts
│   │   ├── subjectService.ts
│   │   ├── examService.ts
│   │   ├── assignmentService.ts
│   │   ├── projectService.ts
│   │   └── hashtagService.ts
│   ├── stores/                    # Zustand stores
│   │   └── authStore.ts
│   ├── types/                     # TypeScript types
│   │   └── index.ts
│   ├── hooks/                     # Custom hooks
│   │   └── use-toast.ts
│   ├── lib/                       # Utilidades
│   │   ├── axios.ts               # Configuración de Axios
│   │   └── utils.ts               # Funciones helpers
│   ├── App.tsx                    # Componente raíz con routing
│   ├── main.tsx                   # Punto de entrada
│   └── index.css                  # Estilos globales
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 Funcionalidades

### ✅ Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- JWT guardado en localStorage
- Protección de rutas privadas
- Logout automático al expirar token

### ✅ Publicaciones (Posts)
- Crear publicaciones con texto
- Sistema automático de hashtags (#tag)
- Visualización de feed principal
- Búsqueda por contenido de texto
- Filtrado por hashtags
- Comentarios en publicaciones
- Eliminar publicaciones propias

### ✅ Perfiles de Usuario
- Ver perfil de cualquier estudiante
- Estadísticas (publicaciones, exámenes, tareas, proyectos)
- Tabs organizados por tipo de contenido
- Timeline de actividades académicas

### ✅ Búsqueda
- Búsqueda de publicaciones por texto
- Filtrado por hashtags
- Hashtags trending en sidebar

### ✅ Navegación
- Navbar sticky con búsqueda
- Sidebar con hashtags populares
- Rutas protegidas
- Loading states
- Manejo de errores

## 🔗 Endpoints del Backend

El frontend consume los siguientes endpoints del backend:

### Autenticación
- `POST /auth/login` - Iniciar sesión

### Estudiantes
- `GET /students` - Listar estudiantes
- `GET /students/:id` - Obtener perfil completo
- `POST /students` - Crear estudiante (registro)
- `PATCH /students/:id` - Actualizar perfil
- `DELETE /students/:id` - Eliminar cuenta

### Publicaciones
- `GET /posts` - Listar publicaciones (con filtros)
- `GET /posts/:id` - Obtener publicación
- `POST /posts` - Crear publicación
- `PATCH /posts/:id` - Actualizar publicación
- `DELETE /posts/:id` - Eliminar publicación

### Comentarios
- `GET /comments?postId=X` - Comentarios de una publicación
- `POST /comments` - Crear comentario
- `DELETE /comments/:id` - Eliminar comentario

### Hashtags
- `GET /hashtags` - Listar todos
- `GET /hashtags/popular?limit=X` - Hashtags más usados
- `GET /hashtags/name/:nombre` - Buscar por nombre

### Materias
- `GET /subjects` - Listar materias
- `GET /subjects/:id` - Obtener materia

### Exámenes, Tareas y Proyectos
- `GET /exams?subjectId=X&studentId=Y`
- `GET /assignments?subjectId=X&studentId=Y`
- `GET /projects?subjectId=X&studentId=Y`

## 🎨 Temas y Personalización

### Colores
El proyecto usa variables CSS para temas. Edita `src/index.css` para cambiar colores:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  /* ... más variables */
}
```

### Componentes ShadcnUI
Los componentes UI están en `src/components/ui/` y pueden personalizarse individualmente.

## 📱 Responsive Design

La aplicación es completamente responsive:
- **Mobile First**: Diseñada desde móvil hacia escritorio
- **Breakpoints**: sm, md, lg, xl, 2xl de TailwindCSS
- **Sidebar**: Oculto en móvil, visible en lg+
- **Grid adaptativo**: 1 columna en móvil, múltiples en desktop

## 🔐 Autenticación y Seguridad

### JWT Token
- El token se guarda en `localStorage`
- Se envía automáticamente en headers de Axios
- Interceptor para renovación/logout automático

### Rutas Protegidas
```tsx
<ProtectedRoute>
  <MainLayout />
</ProtectedRoute>
```

### Middleware de Axios
```typescript
// Request interceptor - Agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(JWT_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Manejar errores 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout automático
      localStorage.removeItem(JWT_STORAGE_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev         # Inicia servidor de desarrollo (port 5173)

# Build
npm run build       # Compila para producción

# Preview
npm run preview     # Preview del build de producción

# Lint
npm run lint        # Ejecuta ESLint
```

## 🧪 Testing (Opcional - a implementar)

Para agregar tests en el futuro:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## 📦 Dependencias Principales

```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.21.3",
  "@tanstack/react-query": "^5.17.19",
  "zustand": "^4.4.7",
  "axios": "^1.6.5",
  "react-hook-form": "^7.49.3",
  "zod": "^3.22.4",
  "tailwindcss": "^3.4.1",
  "lucide-react": "^0.309.0"
}
```

## 🐛 Troubleshooting

### El frontend no se conecta al backend
1. Verifica que el backend esté corriendo en `http://localhost:3000`
2. Revisa el archivo `.env.local`
3. Verifica CORS en el backend

### Error de TypeScript
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de TailwindCSS
Verifica que `tailwind.config.js` tenga el content correcto:
```js
content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}',
]
```

## 🌐 Despliegue

### Vercel (Recomendado)
1. Conecta el repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Netlify
```bash
npm run build
# Sube la carpeta dist/
```

### Variables de entorno en producción
```env
VITE_API_URL=https://api.trazio.com
VITE_JWT_STORAGE_KEY=trazio_token
```

## 👥 Contribución

Este es un proyecto universitario. Para contribuir:
1. Fork del repositorio
2. Crea una rama feature
3. Commit de cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Proyecto académico - Universidad [Tu Universidad]

## 📞 Contacto

Para preguntas o soporte:
- Email: [tu-email]
- GitHub: [tu-usuario]

---

**¡TRAZIO - Documentando el futuro académico!** 🎓
