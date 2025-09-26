# MedManager - Sistema de Gestión de Medicamentos y Tratamientos

MedManager es una aplicación completa para la gestión personalizada de medicamentos, tratamientos y notificaciones médicas. Permite a los usuarios llevar un control detallado de sus medicamentos, crear tratamientos personalizados y recibir notificaciones sobre vencimientos y dosis.

## Características Principales

### 🏥 Gestión de Tratamientos

- Creación y seguimiento de tratamientos médicos personalizados
- Asociación de tratamientos con medicamentos específicos
- Seguimiento de duración, frecuencia y dosis
- Historial de tratamientos finalizados

### 💊 Gestión de Medicamentos

- Registro detallado de medicamentos con información completa
- Control de existencias y unidades
- Seguimiento de fechas de vencimiento
- Archivado de medicamentos no utilizados

### 🔔 Sistema de Notificaciones

- Alertas automáticas sobre vencimiento de medicamentos
- Notificaciones de stock bajo
- Recordatorios personalizados de dosis
- Preferencias de notificación configurables

### 🔐 Sistema de Autenticación Completo

- Registro e inicio de sesión de usuarios
- Protección de datos por usuario
- Sesiones seguras con JWT
- Middleware de protección de APIs

### 🤖 Inteligencia Artificial Integrada

- Análisis de imágenes de medicamentos con Google Gemini
- Extracción automática de información de medicamentos
- Procesamiento inteligente de datos médicos

## Tecnologías Utilizadas

### Frontend

- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS** - Framework de estilos utility-first
- **Shadcn/ui** - Componentes UI accesibles y personalizables
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Backend

- **API Routes de Next.js** - APIs serverless integradas
- **Prisma ORM** - ORM para gestión de base de datos
- **SQLite** - Base de datos local para desarrollo
- **jose** - Librería para manejo de JWT

### Inteligencia Artificial

- **Google Generative AI (Gemini)** - Procesamiento de imágenes y análisis

### Autenticación y Seguridad

- **bcryptjs** - Encriptación de contraseñas
- **jose** - Manejo de sesiones JWT
- **Middleware de protección** - Seguridad en rutas y APIs

## Estructura del Proyecto

```
src/
├── app/                    # Páginas y layouts de Next.js
│   ├── api/               # APIs serverless
│   ├── botiquin/          # Página principal de medicamentos
│   ├── configuracion/     # Página de configuración
│   ├── login/             # Página de inicio de sesión
│   ├── register/          # Página de registro
│   ├── tratamientos/      # Página de gestión de tratamientos
│   └── ...
├── components/            # Componentes reutilizables
├── hooks/                 # Hooks personalizados
├── lib/                   # Librerías y utilidades
├── types/                 # Tipos TypeScript
└── ...
```

## Sistema de Autenticación

### Flujo de Autenticación

1. **Registro**: Los usuarios se registran con email y contraseña
2. **Login**: Autenticación con credenciales y generación de sesión JWT
3. **Protección de Rutas**: Middleware que verifica sesiones activas
4. **Datos por Usuario**: Todos los datos se filtran por usuario autenticado
5. **Logout**: Cierre de sesión seguro con eliminación de cookies

### Componentes de Seguridad

- **Middleware**: Protección de todas las rutas de API sensibles
- **Session Manager**: Manejo de sesiones JWT con encriptación
- **Protección de Rutas**: Verificación de autenticación en frontend y backend
- **Expiración de Sesiones**: Sesiones automáticas que expiran en 24 horas

## Base de Datos

### Modelos Principales

- **User**: Usuarios registrados con tratamientos, medicamentos y notificaciones
- **Medication**: Medicamentos con información detallada y control de existencias
- **Treatment**: Tratamientos médicos personalizados con cronograma
- **Notification**: Notificaciones generadas automáticamente
- **NotificationSettings**: Configuración personalizada de notificaciones

### Relaciones

- Un usuario puede tener múltiples medicamentos
- Un medicamento puede estar en múltiples tratamientos
- Un tratamiento genera múltiples notificaciones
- Cada usuario tiene configuración única de notificaciones

## APIs Disponibles

### Tratamientos

- `GET /api/tratamientos` - Obtener tratamientos (filtrados por usuario)
- `POST /api/tratamientos` - Crear nuevo tratamiento
- `PUT /api/tratamientos/:id` - Actualizar tratamiento
- `DELETE /api/tratamientos/:id` - Eliminar tratamiento

### Medicamentos

- `GET /api/medicinas` - Obtener medicamentos (filtrados por usuario)
- `POST /api/medicinas` - Crear nuevo medicamento
- `PUT /api/medicinas/:id` - Actualizar medicamento
- `DELETE /api/medicinas/:id` - Eliminar medicamento

### Notificaciones

- `GET /api/notificaciones` - Obtener notificaciones (filtradas por usuario)
- `POST /api/notificaciones` - Crear nueva notificación

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/logout` - Cerrar sesión

## Desarrollo

### Requisitos Previos

- Node.js 18 o superior
- npm, yarn o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <repositorio-url>
cd med-manager

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# Inicializar base de datos
npx prisma migrate dev
npx prisma generate

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de Entorno Requeridas

```env
# Secreto para sesiones JWT
SESSION_SECRET=tu_secreto_seguro_aqui

# API Key de Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY=tu_api_key_aqui

# URL de la base de datos (para desarrollo)
DATABASE_URL="file:./dev.db"
```

### Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm run start

# Linting
npm run lint

# Migraciones de base de datos
npx prisma migrate dev
npx prisma migrate deploy

# Generar cliente de Prisma
npx prisma generate

# Ver datos en Prisma Studio
npx prisma studio
```

## Despliegue

La aplicación puede desplegarse en cualquier plataforma que soporte Next.js, incluyendo:

- Vercel (recomendado)
- Netlify
- Servidores Node.js tradicionales

### Consideraciones para Producción

- Configurar `SESSION_SECRET` con una clave segura
- Usar base de datos de producción (PostgreSQL recomendado)
- Configurar dominio y SSL
- Implementar monitoreo y logging

## Contribución

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/NuevaFeature`)
3. Commit cambios (`git commit -m 'Agregar nueva feature'`)
4. Push a la rama (`git push origin feature/NuevaFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Soporte

Para reportar bugs o solicitar features, por favor abre un issue en el repositorio.

## Desarrolladores

- Implementación completa del sistema de autenticación
- Integración de inteligencia artificial con Google Gemini
- Sistema de notificaciones automatizado
- Gestión avanzada de tratamientos médicos
- Interfaz de usuario responsive y accesible

## Características Técnicas Avanzadas

### Sistema de Hooks Personalizados

- `useAuth`: Manejo centralizado de autenticación
- `useTratamientos`: Gestión completa de tratamientos con filtrado por usuario
- `useMedicinas`: Control de medicamentos del usuario
- `useNotificaciones`: Sistema de notificaciones personalizado

### Componentes Reutilizables

- Componentes UI con Shadcn/ui
- Formularios con validación Zod
- Diálogos y modales accesibles
- Tablas y listas con paginación

### Optimización de Rendimiento

- Carga diferida de componentes
- Optimización de imágenes
- Caché de datos con React Query
- Minimización de rerenders

### Accesibilidad

- Componentes totalmente accesibles
- Navegación por teclado
- Etiquetas ARIA apropiadas
- Contraste de colores adecuado
