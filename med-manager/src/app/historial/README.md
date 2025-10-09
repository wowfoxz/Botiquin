# Módulo de Historial - Sistema de Auditoría

## Descripción General

El módulo de Historial implementa un sistema completo de auditoría que registra automáticamente todas las acciones relevantes realizadas por los usuarios en el sistema. Proporciona trazabilidad completa de las operaciones para cumplimiento, seguridad y análisis.

## Características Principales

- **Registro Automático**: Todas las acciones se registran sin intervención manual
- **Filtros Avanzados**: Por usuario, tipo de acción, entidad, rango de fechas
- **Paginación**: Manejo eficiente de grandes volúmenes de datos
- **Exportación**: Capacidad de exportar datos a CSV
- **Seguridad**: Solo usuarios adultos pueden acceder al historial
- **Inmutabilidad**: Los registros no se pueden modificar ni eliminar

## Estructura de Base de Datos

### Tabla `Historial`

```sql
CREATE TABLE historial (
  id TEXT PRIMARY KEY,
  usuarioId TEXT NOT NULL,
  tipoAccion TEXT NOT NULL,
  entidadTipo TEXT NOT NULL,
  entidadId TEXT,
  datosPrevios TEXT,
  datosPosteriores TEXT,
  metadata TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuarioId) REFERENCES User(id)
);
```

### Índices

- `idx_hist_usuario`: En `usuarioId` para búsquedas por usuario
- `idx_hist_tipo_accion`: En `tipoAccion` para filtros por acción
- `idx_hist_entidad`: En `entidadTipo` y `entidadId` para búsquedas por entidad
- `idx_hist_fecha`: En `createdAt` para ordenamiento cronológico

## Tipos de Acción

### Autenticación
- `login`: Inicio de sesión exitoso
- `login_fallido`: Intento de login fallido
- `logout`: Cierre de sesión

### Operaciones CRUD
- `create`: Creación de registros
- `update`: Actualización de registros
- `delete`: Eliminación de registros
- `view`: Visualización de detalles

### Operaciones Especiales
- `search`: Búsquedas realizadas
- `export`: Exportación de datos
- `import`: Importación de datos
- `archive`: Archivar registros
- `unarchive`: Desarchivar registros

## Tipos de Entidad

- `usuario`: Usuarios del sistema
- `perfil`: Perfiles de menores sin cuenta
- `medicamento`: Medicamentos en el botiquín
- `toma`: Registros de tomas de medicamentos
- `lista_compra`: Listas de compras
- `tratamiento`: Tratamientos médicos
- `notificacion`: Notificaciones del sistema
- `grupo_familiar`: Grupos familiares
- `sesion`: Sesiones de usuario

## API Endpoints

### GET `/api/historial`

Obtiene el historial con filtros y paginación.

**Parámetros de Query:**
- `usuario_id`: Filtrar por usuario específico
- `tipo_accion`: Filtrar por tipo de acción
- `entidad_tipo`: Filtrar por tipo de entidad
- `fecha_desde`: Fecha de inicio del rango
- `fecha_hasta`: Fecha de fin del rango
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20, max: 100)

**Respuesta:**
```json
{
  "data": [
    {
      "id": "string",
      "usuario": {
        "id": "string",
        "name": "string",
        "email": "string"
      },
      "tipoAccion": "string",
      "entidadTipo": "string",
      "entidadId": "string",
      "datosPrevios": "object",
      "datosPosteriores": "object",
      "metadata": "object",
      "createdAt": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### POST `/api/historial`

Obtiene las opciones disponibles para los filtros.

**Respuesta:**
```json
{
  "usuarios": [
    {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  ],
  "tiposAccion": ["login", "create", "update", ...],
  "tiposEntidad": ["usuario", "medicamento", "toma", ...]
}
```

### GET `/api/historial/export`

Exporta el historial filtrado a CSV.

**Parámetros:** Igual que GET `/api/historial` (excepto paginación)

**Respuesta:** Archivo CSV con headers:
- Fecha y Hora
- Usuario
- Email Usuario
- Tipo de Acción
- Entidad
- ID Entidad
- Datos Previos
- Datos Posteriores
- Metadata

## Funciones de Auditoría

### `registrarAuditoria(datos)`

Registra una acción en el historial.

```typescript
await registrarAuditoria({
  usuarioId: "user123",
  tipoAccion: TipoAccion.CREATE,
  entidadTipo: TipoEntidad.MEDICAMENTO,
  entidadId: "med456",
  datosPrevios: null,
  datosPosteriores: { name: "Aspirina", quantity: 100 },
  metadata: { ip: "192.168.1.1", dispositivo: "desktop" }
});
```

### `registrarAccionCRUD(usuarioId, tipoAccion, entidadTipo, entidadId, datosPrevios?, datosPosteriores?, metadata?)`

Helper para operaciones CRUD estándar.

```typescript
await registrarAccionCRUD(
  userId,
  TipoAccion.UPDATE,
  TipoEntidad.MEDICAMENTO,
  medicamentoId,
  { quantity: 100 },
  { quantity: 80 }
);
```

### `registrarAccionAuth(usuarioId, tipoAccion, metadata?)`

Helper para acciones de autenticación.

```typescript
await registrarAccionAuth(userId, TipoAccion.LOGIN, {
  ip: "192.168.1.1",
  dispositivo: "mobile"
});
```

### `registrarBusqueda(usuarioId, termino, entidadTipo, resultados, metadata?)`

Helper para registrar búsquedas.

```typescript
await registrarBusqueda(
  userId,
  "aspirina",
  TipoEntidad.MEDICAMENTO,
  5
);
```

### `registrarVisualizacion(usuarioId, entidadTipo, entidadId, metadata?)`

Helper para registrar visualizaciones de detalles.

```typescript
await registrarVisualizacion(
  userId,
  TipoEntidad.MEDICAMENTO,
  medicamentoId
);
```

## Cómo Agregar Auditoría a Nuevos Endpoints

### 1. Importar las funciones necesarias

```typescript
import { 
  registrarAccionCRUD, 
  registrarBusqueda, 
  registrarVisualizacion,
  TipoAccion, 
  TipoEntidad,
  extraerMetadataRequest 
} from "@/lib/auditoria";
```

### 2. Para operaciones CRUD

```typescript
// Antes de la operación
const datosPrevios = await prisma.entidad.findUnique({
  where: { id: entidadId }
});

// Realizar la operación
const resultado = await prisma.entidad.create/update/delete({...});

// Después de la operación
await registrarAccionCRUD(
  userId,
  TipoAccion.CREATE, // o UPDATE, DELETE
  TipoEntidad.MI_ENTIDAD,
  resultado.id,
  datosPrevios,
  resultado
);
```

### 3. Para búsquedas

```typescript
const resultados = await buscarAlgo(termino);

await registrarBusqueda(
  userId,
  termino,
  TipoEntidad.MI_ENTIDAD,
  resultados.length
);
```

### 4. Para visualizaciones

```typescript
await registrarVisualizacion(
  userId,
  TipoEntidad.MI_ENTIDAD,
  entidadId
);
```

### 5. Para autenticación

```typescript
// Login exitoso
await registrarAccionAuth(userId, TipoAccion.LOGIN);

// Login fallido
await registrarAccionAuth(null, TipoAccion.LOGIN_FALLIDO, {
  email,
  motivo: "Contraseña incorrecta"
});

// Logout
await registrarAccionAuth(userId, TipoAccion.LOGOUT);
```

## Seguridad y Privacidad

### Restricciones de Acceso
- Solo usuarios con rol `ADULTO` pueden acceder al historial
- Los usuarios solo pueden ver el historial de su grupo familiar
- Los registros son inmutables (no se pueden modificar ni eliminar)

### Datos Sensibles
- Las contraseñas nunca se registran
- Los datos previos/posteriores solo incluyen información relevante
- La metadata se limita a información técnica (IP, dispositivo, etc.)

### Retención de Datos
- Los registros se mantienen indefinidamente para auditoría
- Considerar implementar políticas de retención según necesidades

## Consideraciones de Rendimiento

### Optimizaciones Implementadas
- Índices en campos de búsqueda frecuente
- Paginación para evitar cargar grandes volúmenes
- Consultas optimizadas con `include` selectivo

### Recomendaciones
- Monitorear el crecimiento de la tabla
- Considerar particionamiento por fecha si es necesario
- Implementar archivo de registros antiguos si es requerido

## Extensibilidad

### Agregar Nuevos Tipos de Acción
1. Agregar el nuevo tipo al enum `TipoAccion` en `src/lib/auditoria.ts`
2. Actualizar las traducciones en el frontend si es necesario
3. Implementar la lógica de registro donde corresponda

### Agregar Nuevos Tipos de Entidad
1. Agregar el nuevo tipo al enum `TipoEntidad` en `src/lib/auditoria.ts`
2. Actualizar las traducciones en el frontend
3. Integrar el registro en los endpoints correspondientes

### Personalizar Metadata
- Extender la interfaz `MetadataAuditoria` según necesidades
- Actualizar `extraerMetadataRequest` para capturar datos adicionales

## Troubleshooting

### Registros No Aparecen
- Verificar que el usuario tenga rol `ADULTO`
- Confirmar que el usuario pertenece a un grupo familiar
- Revisar que la función de auditoría se esté llamando correctamente

### Errores de Rendimiento
- Verificar que los índices estén creados correctamente
- Considerar reducir el límite de paginación
- Revisar las consultas de filtrado

### Datos Inconsistentes
- Verificar que las funciones de auditoría se llamen después de las operaciones exitosas
- Confirmar que los tipos de acción y entidad sean consistentes
- Revisar el manejo de errores en las funciones de registro
