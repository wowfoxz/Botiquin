# Guía de Despliegue - Botilyx

## Configuración de Producción

### Variables de Entorno Requeridas

Crea un archivo `.env.production` con las siguientes variables:

```bash
# Base path para el despliegue (configurar según la ruta del dominio)
# Ejemplos:
# Para dominio raíz: NEXT_PUBLIC_BASE_PATH=
# Para subdirectorio: NEXT_PUBLIC_BASE_PATH=/botilyx
NEXT_PUBLIC_BASE_PATH=

# Configuración de la base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/botilyx_prod"

# Configuración de sesiones
SESSION_SECRET="your-super-secret-session-key-for-production"

# Configuración de notificaciones push (VAPID)
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
NOTIFICATION_PROCESSOR_SECRET="your-notification-processor-secret"

# Configuración de IA (Gemini)
GEMINI_API_KEY="your-gemini-api-key"

# Configuración de email (opcional)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Configuración de Redis (opcional, para sesiones)
REDIS_URL=""

# Variables de entorno para Kubernetes
KUBERNETES_NAMESPACE="botilyx"
KUBERNETES_SERVICE_NAME="botilyx-service"

# Configuración de HTTPS
FORCE_HTTPS=true

# Configuración de logs
LOG_LEVEL="info"
NODE_ENV="production"
```

### Configuración del BasePath

El proyecto está configurado para usar automáticamente el `basePath` desde la variable de entorno `NEXT_PUBLIC_BASE_PATH`:

- **Dominio raíz**: Deja `NEXT_PUBLIC_BASE_PATH` vacío
- **Subdirectorio**: Configura `NEXT_PUBLIC_BASE_PATH=/ruta-del-subdirectorio`

### Despliegue en Kubernetes

1. **Crear namespace**:
```bash
kubectl create namespace botilyx
```

2. **Configurar secrets**:
```bash
kubectl create secret generic botilyx-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=SESSION_SECRET="..." \
  --from-literal=GEMINI_API_KEY="..." \
  --from-literal=VAPID_PUBLIC_KEY="..." \
  --from-literal=VAPID_PRIVATE_KEY="..." \
  --namespace=botilyx
```

3. **Configurar configmap**:
```bash
kubectl create configmap botilyx-config \
  --from-literal=NEXT_PUBLIC_BASE_PATH="/botilyx" \
  --from-literal=NODE_ENV="production" \
  --from-literal=LOG_LEVEL="info" \
  --namespace=botilyx
```

4. **Desplegar aplicación**:
```bash
kubectl apply -f k8s/
```

### Configuración de HTTPS

Para habilitar HTTPS en producción:

1. Configurar certificados SSL/TLS en el ingress
2. Configurar `FORCE_HTTPS=true` en las variables de entorno
3. Configurar redirects HTTP a HTTPS en el servidor web

### Build de Producción

```bash
# Instalar dependencias
npm install

# Generar build de producción
npm run build

# Iniciar servidor de producción
npm start
```

### Verificación Post-Despliegue

1. Verificar que la aplicación carga correctamente
2. Probar funcionalidades principales
3. Verificar que las notificaciones push funcionan
4. Comprobar que las rutas con basePath funcionan correctamente

### Monitoreo

- Configurar logs centralizados
- Monitorear métricas de rendimiento
- Configurar alertas para errores críticos
- Monitorear uso de recursos (CPU, memoria, disco)
