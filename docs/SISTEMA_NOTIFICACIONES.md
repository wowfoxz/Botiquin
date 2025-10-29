# 🔔 Sistema de Notificaciones Automáticas

## Descripción General

El sistema de notificaciones automáticas de Botilyx envía recordatorios y alertas a los usuarios mediante **Push Notifications** (notificaciones del navegador).

## Componentes del Sistema

### 1. API de Procesamiento (`/api/notifications/process`)

**Ubicación:** `src/app/api/notifications/process/route.ts`

Esta API se encarga de:
- ✅ Detectar medicamentos vencidos o por vencer
- ✅ Detectar medicamentos con stock bajo
- ✅ Generar recordatorios de tomas de tratamientos activos
- ✅ Enviar notificaciones push a los usuarios

**Frecuencia de ejecución:** Cada 5 minutos

### 2. Hook de Procesamiento

**Ubicación:** `src/hooks/useNotificationProcessor.ts`

Hook que ejecuta la API de notificaciones cada 5 minutos mientras la aplicación esté abierta en el navegador.

### 3. Componente de Integración

**Ubicación:** `src/components/notification-processor.tsx`

Componente que envuelve el hook y lo ejecuta automáticamente. Solo se activa en **producción** para evitar spam durante desarrollo.

---

## Tipos de Notificaciones

### 1️⃣ Medicamentos Vencidos

**Criterio:** Se detectan medicamentos cuya fecha de vencimiento:
- Ya pasó (vencidos)
- Está dentro del rango configurado por el usuario (`daysBeforeExpiration`)

**Mensaje:**
- `⚠️ El medicamento "[Nombre]" ya venció el [Fecha]`
- `⏰ El medicamento "[Nombre]" vence en [X] días`

**Configuración:** 
- `NotificationSettings.daysBeforeExpiration` (por defecto: 30 días)

---

### 2️⃣ Stock Bajo

**Criterio:** Se detectan medicamentos cuya cantidad actual:
- Es menor o igual al umbral configurado
- Es mayor a 0 (no está agotado)

**Mensaje:**
- `📦 Stock bajo: "[Nombre]" - Quedan [X] [unidad]`

**Configuración:**
- `NotificationSettings.lowStockThreshold` (por defecto: 10 unidades)

---

### 3️⃣ Recordatorios de Tomas

**Criterio:**
- Tratamiento activo (`isActive = true`)
- Fecha actual dentro del rango del tratamiento
- Hora actual dentro de los **5 minutos previos** a la toma programada
- El medicamento **no fue tomado** en un rango de ±30 minutos alrededor de la hora programada

**Mensaje:**
- `💊 Recordatorio: Es hora de que [Paciente] tome [Dosis] de [Medicamento]`

**Frecuencia:**
- Se calcula dinámicamente basándose en `TreatmentMedication.frequencyHours`
- Si el tratamiento especifica `startAtSpecificTime`, se usa `specificStartTime` como referencia

**Re-envío:**
- Si no se registró una toma (mediante el botón "Usar"), el recordatorio se envía nuevamente cada 5 minutos hasta que:
  - Se registre la toma
  - El tratamiento finalice
  - Se desactive el tratamiento

---

## Configuración de Usuarios

Los usuarios pueden configurar sus preferencias en:
**`/configuracion/notificaciones`**

### Opciones disponibles:

| Opción | Descripción | Por defecto |
|--------|-------------|-------------|
| **Notificaciones Push** | Activar/desactivar notificaciones del navegador | ❌ Desactivado |
| **Recordatorios por Email** | Enviar recordatorios por correo | ❌ Desactivado |
| **Sonido de Notificaciones** | Reproducir sonido al recibir notificaciones | ❌ Desactivado |

---

## Arquitectura Técnica

### Flujo de Ejecución

```
┌─────────────────────────────────────────┐
│  Layout (src/app/layout.tsx)            │
│  ├─ NotificationProcessor (client)      │
│     └─ useNotificationProcessor()       │
│        └─ setInterval(5min)             │
│           └─ POST /api/notifications/   │
│              process                    │
└─────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│  API: /api/notifications/process        │
│  ├─ processMedicationExpirations()      │
│  ├─ processLowStock()                   │
│  └─ processTreatmentReminders()         │
│     └─ calculateNextDose()              │
│        checkIfDoseTaken()               │
│        sendPushNotification()           │
└─────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│  Service Worker (public/sw.js)          │
│  └─ registration.showNotification()     │
│     └─ notificationclick handler        │
└─────────────────────────────────────────┘
```

### Dependencias

- **`web-push`**: Librería para enviar notificaciones push desde el servidor
- **Service Worker**: Registrado en `/sw.js` para manejar notificaciones

---

## Deployment

### Kubernetes CronJob (Opcional)

Para mayor confiabilidad, se puede crear un CronJob de Kubernetes que ejecute la API cada 5 minutos:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: botilyx-notifications
  namespace: aplicaciones
spec:
  schedule: "*/5 * * * *"  # Cada 5 minutos
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: notifications-processor
            image: curlimages/curl:latest
            args:
            - sh
            - -c
            - |
              curl -X POST https://web.formosa.gob.ar/botilyx/api/notifications/process \
                -H "Content-Type: application/json"
          restartPolicy: OnFailure
```

### Variables de Entorno Necesarias

```bash
# VAPID Keys para Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BO63iDbR-YNn2So-X3dvBuFMRTLn0RMeWLz1BEfd-LhqgNBIra7rKqY9RuYdeNtZWOZs5SOWm12KXMewuw-hM9k
VAPID_PRIVATE_KEY=oKM3Kkf-JsBTlQI1_tGY02Cj03FvAdnfIQAHTFPaVBE

# Base de datos
DATABASE_URL=mysql://user:password@host:port/database
```

---

## Testing Manual

### 1. Verificar Procesamiento

```bash
curl -X POST https://web.formosa.gob.ar/botilyx/api/notifications/process \
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Notificaciones procesadas exitosamente",
  "timestamp": "2025-01-30T12:00:00.000Z"
}
```

### 2. Ver Logs del Procesador

En el navegador (consola del desarrollador):
```
🔔 Procesando notificaciones automáticas...
✅ Notificaciones procesadas: { success: true, ... }
```

---

## Solución de Problemas

### ❌ "No hay suscripciones push"

**Problema:** El usuario no activó las notificaciones push.

**Solución:** Ir a `/configuracion/notificaciones` y activar "Notificaciones Push".

---

### ❌ "Error 410 - Gone"

**Problema:** La suscripción push expiró.

**Solución:** El sistema elimina automáticamente las suscripciones expiradas. El usuario debe activar nuevamente las notificaciones.

---

### ❌ "Notificaciones no se envían en desarrollo"

**Problema:** El `NotificationProcessor` solo se ejecuta en producción.

**Solución:** Para testing en desarrollo, llamar manualmente a la API:
```bash
curl -X POST http://localhost:3000/api/notifications/process
```

---

## Próximas Mejoras

- [ ] Implementar notificaciones por email
- [ ] Implementar sonido personalizado para notificaciones
- [ ] Dashboard de notificaciones enviadas
- [ ] Estadísticas de adherencia a tratamientos
- [ ] Configuración granular por tipo de notificación

