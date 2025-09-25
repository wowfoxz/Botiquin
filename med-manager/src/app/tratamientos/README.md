# Módulo de Gestión de Tratamientos Médicos

Este módulo permite la gestión completa de tratamientos médicos, incluyendo creación, seguimiento, notificaciones y mantenimiento de historial.

## Características

### Gestión de Tratamientos

- Creación de nuevos tratamientos médicos
- Edición de tratamientos existentes
- Eliminación de tratamientos
- Finalización de tratamientos activos
- Listado de tratamientos activos
- Historial de tratamientos finalizados

### Gestión de Medicamentos

- Verificación automática de stock disponible
- Alertas de stock insuficiente
- Cálculo automático de dosis necesarias

### Sistema de Notificaciones

- Notificaciones push en smartphones
- Alarmas sonoras en dispositivos
- Correos electrónicos de recordatorio
- Notificaciones de escritorio
- Configuración personalizada de preferencias

### Seguimiento y Control

- Autocompletado de pacientes recurrentes
- Verificación de compatibilidad entre medicamentos
- Registro histórico completo de tratamientos

## Estructura del Código

```
src/
├── app/
│   └── tratamientos/
│       └── page.tsx          # Página principal del módulo
├── components/               # Componentes UI reutilizables
├── lib/
│   ├── constants/            # Constantes del sistema
│   │   └── tratamientos.ts   # Constantes específicas de tratamientos
│   └── utils/                # Funciones auxiliares
│       └── tratamientos.ts   # Utilidades de tratamientos
└── types/                    # Definiciones de tipos
    └── tratamientos.ts       # Tipos específicos del módulo
```

## Tipos de Datos

### Tratamiento

```typescript
type Tratamiento = {
  id: string;
  nombre: string;
  medicamentoId: string;
  frecuenciaHoras: number;
  duracionDias: number;
  paciente: string;
  fechaInicio: Date;
  fechaFin: Date;
  activo: boolean;
  dosis: string;
};
```

### Medicamento

```typescript
type Medicamento = {
  id: string;
  nombre: string;
  stock: number;
  dosis: string;
};
```

### Notificación

```typescript
type Notificacion = {
  id: string;
  tratamientoId: string;
  fechaProgramada: Date;
  enviada: boolean;
  tipo: "push" | "sonora" | "email" | "navegador";
};
```

## Constantes

### Tiempos de Notificación

- PUSH: 30 minutos antes
- EMAIL: 1 hora antes
- NAVEGADOR: 15 minutos antes
- SONORA: 5 minutos antes

## Utilidades

### Funciones Principales

- `generarNotificacionesParaTratamiento()`: Genera notificaciones según preferencias
- `verificarStockSuficiente()`: Verifica disponibilidad de medicamentos
- `calcularDosisNecesarias()`: Calcula cantidad de dosis requeridas
- `mostrarNotificacion()`: Muestra notificaciones al usuario

## Integración

El módulo utiliza:

- Componentes UI de Shadcn
- Sistema de temas de Tailwind CSS
- Notificaciones con Sonner
- Tipos TypeScript para validación
- Constantes para mantenibilidad
