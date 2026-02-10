# 🔧 Comandos Importantes para TRAZIO Frontend

## 📦 Instalación Inicial

### Opción 1: npm (Recomendado)
```bash
cd trazio-front
npm install
```

### Opción 2: yarn
```bash
cd trazio-front
yarn install
```

### Opción 3: pnpm (Más rápido)
```bash
cd trazio-front
pnpm install
```

---

## 🚀 Desarrollo

### Iniciar servidor de desarrollo
```bash
npm run dev
```
- Puerto por defecto: `http://localhost:5173`
- Hot reload automático
- React Query DevTools activo

### Iniciar en otro puerto
```bash
npm run dev -- --port 3001
```

---

## 🏗️ Build y Producción

### Crear build de producción
```bash
npm run build
```
- Genera carpeta `dist/`
- Archivos optimizados y minificados
- TypeScript compilado

### Preview del build
```bash
npm run preview
```
- Sirve la carpeta `dist/`
- Simula producción localmente

---

## 🧹 Linting y Formato

### Ejecutar linter
```bash
npm run lint
```
- Revisa errores de ESLint
- Reglas para React, TypeScript

### Arreglar errores automáticamente
```bash
npm run lint -- --fix
```

---

## 🧪 Testing (Si se implementa)

### Instalar Vitest (opcional)
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Ejecutar tests
```bash
npm test
```

### Tests en modo watch
```bash
npm test -- --watch
```

---

## 📦 Gestión de Dependencias

### Ver dependencias instaladas
```bash
npm list --depth=0
```

### Actualizar dependencias
```bash
npm update
```

### Verificar dependencias desactualizadas
```bash
npm outdated
```

### Instalar una nueva dependencia
```bash
npm install nombre-paquete
```

### Instalar dependencia de desarrollo
```bash
npm install -D nombre-paquete
```

---

## 🐛 Debugging

### Ver qué puerto está usando
```bash
lsof -i :5173
# o en Windows PowerShell:
netstat -ano | findstr :5173
```

### Limpiar cache de npm
```bash
npm cache clean --force
```

### Reinstalar todo desde cero
```bash
rm -rf node_modules package-lock.json
npm install
```

### Ver logs detallados
```bash
npm run dev --verbose
```

---

## 🔍 Verificar Configuración

### Ver versión de Node.js
```bash
node --version
# Debe ser >= 18
```

### Ver versión de npm
```bash
npm --version
```

### Verificar TypeScript
```bash
npx tsc --version
```

### Verificar que el backend esté corriendo
```bash
curl http://localhost:3000/students
# o en Windows PowerShell:
Invoke-WebRequest http://localhost:3000/students
```

---

## 🌐 Variables de Entorno

### Crear archivo .env.local
```bash
# En Unix/Mac
cat > .env.local << EOF
VITE_API_URL=http://localhost:3000
VITE_JWT_STORAGE_KEY=trazio_token
EOF

# En Windows PowerShell
@"
VITE_API_URL=http://localhost:3000
VITE_JWT_STORAGE_KEY=trazio_token
"@ | Out-File -FilePath .env.local -Encoding UTF8
```

### Ver variables de entorno cargadas
```bash
npm run dev
# Las variables con VITE_ estarán disponibles en import.meta.env
```

---

## 📊 Análisis del Bundle

### Analizar tamaño del build
```bash
npm run build -- --mode analyze
```

### Ver tamaño de dependencias
```bash
npx vite-bundle-visualizer
```

---

## 🔄 Git (Control de versiones)

### Inicializar Git (si no está inicializado)
```bash
git init
git add .
git commit -m "feat: frontend inicial de TRAZIO"
```

### Crear nueva rama
```bash
git checkout -b feature/nueva-funcionalidad
```

### Ver cambios
```bash
git status
git diff
```

---

## 🚨 Troubleshooting Rápido

### Problema: Puerto 5173 ocupado
```bash
# Encontrar proceso
lsof -ti:5173

# Matar proceso (Mac/Linux)
lsof -ti:5173 | xargs kill -9

# En Windows
netstat -ano | findstr :5173
taskkill /PID [número] /F
```

### Problema: Error de módulos
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: TypeScript errors
```bash
npx tsc --noEmit
```

### Problema: Cannot find module '@/*'
Verifica `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Y `vite.config.ts`:
```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

---

## 📱 Testing en Dispositivos

### Acceder desde otro dispositivo en la red local
1. Encuentra tu IP:
```bash
# Mac/Linux
ipconfig getifaddr en0

# Windows
ipconfig
```

2. Inicia el servidor con host:
```bash
npm run dev -- --host
```

3. Accede desde otro dispositivo:
```
http://TU_IP:5173
```

---

## 🎯 Flujo de Trabajo Recomendado

### Primera vez
```bash
# 1. Instalar
cd trazio-front
npm install

# 2. Configurar .env.local
# (Crear archivo manualmente)

# 3. Iniciar backend
cd ../proyecto-final
npm run start:dev

# 4. En otra terminal, iniciar frontend
cd ../trazio-front
npm run dev

# 5. Abrir navegador
# http://localhost:5173
```

### Desarrollo diario
```bash
# Terminal 1: Backend
cd proyecto-final
npm run start:dev

# Terminal 2: Frontend
cd trazio-front
npm run dev
```

---

## 🔐 Comandos de Seguridad

### Auditar dependencias
```bash
npm audit
```

### Arreglar vulnerabilidades automáticamente
```bash
npm audit fix
```

### Arreglar con force (cuidado)
```bash
npm audit fix --force
```

---

## 📦 Deployment

### Build para producción
```bash
npm run build
```

### Subir a Vercel
```bash
npm install -g vercel
vercel
```

### Subir a Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## 🎨 Tailwind CSS

### Regenerar configuración
```bash
npx tailwindcss init -p
```

### Ver clases disponibles
```bash
npx tailwindcss --help
```

---

## 📚 Documentación Rápida

### Ver dependencias principales
```bash
npm list react react-dom react-router-dom @tanstack/react-query
```

### Abrir documentación en browser
- React Query: https://tanstack.com/query/latest
- ShadcnUI: https://ui.shadcn.com/
- TailwindCSS: https://tailwindcss.com/docs

---

## ⚡ Comandos Personalizados (Puedes agregar)

### En package.json, sección "scripts":

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist node_modules"
  }
}
```

Luego puedes usar:
```bash
npm run format
npm run type-check
npm run clean
```

---

**💡 Tip:** Guarda este archivo como referencia rápida durante el desarrollo.
