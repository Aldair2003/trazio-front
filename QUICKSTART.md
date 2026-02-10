# 🚀 TRAZIO Frontend - Inicio Rápido

## ⚡ Configuración en 3 pasos

### 1️⃣ Instalar dependencias
```bash
cd trazio-front
npm install
```

### 2️⃣ Configurar variables de entorno
Crea el archivo `.env.local` en la raíz de `trazio-front`:
```env
VITE_API_URL=http://localhost:3000
VITE_JWT_STORAGE_KEY=trazio_token
```

### 3️⃣ Iniciar el servidor de desarrollo
```bash
npm run dev
```

¡Listo! Abre tu navegador en `http://localhost:5173`

---

## 📋 Checklist antes de iniciar

- [ ] Node.js >= 18 instalado
- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Base de datos PostgreSQL (NeonDB) activa
- [ ] Variables de entorno configuradas

---

## 🎯 Primeros pasos en la aplicación

### 1. Crear una cuenta
1. Ve a `http://localhost:5173/register`
2. Completa el formulario
3. Serás redirigido al home automáticamente

### 2. Crear tu primera publicación
1. En el home, verás el formulario "Crear Publicación"
2. Escribe algo académico, por ejemplo:
   ```
   Tips para el examen de Programación:
   - Repasar estructuras de datos
   - Practicar algoritmos de ordenamiento
   #programacion #examen #tips
   ```
3. Los hashtags se detectan automáticamente
4. Click en "Publicar"

### 3. Explorar funcionalidades
- 📝 **Feed**: Ver todas las publicaciones
- 🔍 **Búsqueda**: Usa la barra de búsqueda en el navbar
- #️⃣ **Hashtags**: Click en un hashtag para filtrar
- 👤 **Perfil**: Click en tu avatar para ver tu perfil
- 💬 **Comentarios**: Click en "comentarios" en cualquier publicación

---

## 🎨 Estructura de carpetas importantes

```
trazio-front/
├── src/
│   ├── pages/           # Páginas principales
│   ├── components/      # Componentes reutilizables
│   ├── services/        # Llamadas a la API
│   ├── stores/          # Estado global (Zustand)
│   ├── types/           # Tipos de TypeScript
│   └── lib/             # Utilidades
```

---

## 🐛 Problemas comunes

### ❌ "Cannot connect to backend"
**Solución:** Verifica que el backend esté corriendo:
```bash
cd ../proyecto-final
npm run start:dev
```

### ❌ "401 Unauthorized"
**Solución:** Cierra sesión y vuelve a iniciar sesión. El token puede haber expirado.

### ❌ Puerto 5173 ocupado
**Solución:** Vite te preguntará si quieres usar otro puerto. Acepta o libera el puerto.

---

## 📚 Tecnologías principales

- ⚛️ **React 18** + **TypeScript**
- ⚡ **Vite** - Build tool
- 🎨 **TailwindCSS** - Estilos
- 🔄 **TanStack Query** - Data fetching
- 🗂️ **Zustand** - Estado global
- 🛣️ **React Router** - Navegación

---

## 🎓 Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Home con feed principal |
| `/login` | Iniciar sesión |
| `/register` | Crear cuenta |
| `/feed` | Feed con filtros |
| `/feed?search=texto` | Búsqueda por texto |
| `/feed?hashtag=nombre` | Filtrar por hashtag |
| `/profile/:userId` | Perfil de usuario |
| `/subjects/:subjectId` | Detalle de materia |

---

## 💡 Tips de desarrollo

### Hot Reload
Vite tiene hot reload automático. Guarda y verás los cambios al instante.

### React Query DevTools
Abre la app y verás en la esquina inferior las DevTools de React Query. Útil para debug.

### Formato de código
```bash
npm run lint        # Ver errores
npm run format      # Formatear código (si lo agregas)
```

### TypeScript
Los tipos están en `src/types/index.ts`. Si agregas nuevas entidades, actualízalos ahí.

---

## 🎉 ¡Todo listo!

Ahora tienes el frontend completo de TRAZIO funcionando. Explora, crea publicaciones, interactúa con otros estudiantes (si hay más usuarios registrados).

Para más información detallada, consulta el [README.md](./README.md) completo.

---

**¿Preguntas?** Revisa la documentación o contacta al equipo de desarrollo.
