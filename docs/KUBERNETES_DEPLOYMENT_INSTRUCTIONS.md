# 🚀 Instrucciones de Despliegue en Kubernetes

## 📋 Archivo .env de Producción

El archivo `env.production.kubernetes` está listo para usar en tu despliegue de Kubernetes.

### 🔧 Variables Principales Configuradas:

- ✅ **DATABASE_URL**: MySQL configurada
- ✅ **SESSION_SECRET**: Clave segura para JWT
- ✅ **NEXT_PUBLIC_BASE_PATH**: `/botilyx` para producción
- ✅ **NEXT_PUBLIC_API_URL**: URL de producción
- ✅ **VAPID_KEYS**: Claves para notificaciones push
- ✅ **Configuraciones de seguridad y monitoreo**

## 🎯 Pasos para el Despliegue

### 1. **Crear el Secret en Kubernetes**
```bash
# Crear el secret desde el archivo .env
kubectl create secret generic botilyx-secrets \
  --from-env-file=env.production.kubernetes \
  --namespace=default
```

### 2. **Verificar el Secret**
```bash
# Verificar que el secret se creó correctamente
kubectl get secrets botilyx-secrets -o yaml
```

### 3. **Usar tu Script de Despliegue**
Ejecuta tu script de automatización de Kubernetes que ya tienes configurado.

### 4. **Configuración del Ingress**
Asegúrate de que tu ingress esté configurado para:
- **Host**: `web.formosa.gob.ar`
- **Path**: `/botilyx`
- **Backend**: Tu servicio de Botilyx

## 🔍 Verificaciones Post-Despliegue

### 1. **Verificar que el Pod esté corriendo**
```bash
kubectl get pods -l app=botilyx
```

### 2. **Verificar los logs**
```bash
kubectl logs -l app=botilyx
```

### 3. **Probar la aplicación**
- Acceder a: `http://web.formosa.gob.ar/botilyx/`
- Verificar que todas las rutas funcionen
- Probar login y funcionalidades principales

## 🛡️ Configuraciones de Seguridad

### Variables Sensibles:
- `SESSION_SECRET`: Clave para JWT (mantener secreta)
- `VAPID_PRIVATE_KEY`: Clave privada para push notifications
- `DATABASE_URL`: Credenciales de base de datos

### Recomendaciones:
1. **Rotar claves** periódicamente
2. **Monitorear logs** de acceso
3. **Configurar rate limiting** en el ingress
4. **Usar HTTPS** en producción

## 📊 Monitoreo y Logs

### Configuraciones incluidas:
- `LOG_LEVEL="info"`
- `LOG_FORMAT="json"`
- `HEALTH_CHECK_INTERVAL="30000"`
- `METRICS_ENABLED="true"`

## 🔧 Troubleshooting

### Si hay problemas de conexión a la base de datos:
1. Verificar que el pod puede acceder a `10.10.102.2:30002`
2. Revisar logs del pod: `kubectl logs -l app=botilyx`
3. Verificar que el secret esté montado correctamente

### Si hay problemas de basePath:
1. Verificar que `NEXT_PUBLIC_BASE_PATH="/botilyx"` esté configurado
2. Verificar que el ingress esté configurado para `/botilyx/*`
3. Revisar logs para errores de routing

## ✅ Checklist de Despliegue

- [ ] Secret creado con variables de entorno
- [ ] Imagen Docker construida y subida
- [ ] Deployment aplicado
- [ ] Service configurado
- [ ] Ingress configurado para `/botilyx`
- [ ] Pod corriendo sin errores
- [ ] Aplicación accesible en `http://web.formosa.gob.ar/botilyx/`
- [ ] Login funcionando
- [ ] Base de datos conectada
- [ ] APIs respondiendo correctamente

## 🎉 ¡Listo para Producción!

Una vez completado el checklist, tu aplicación estará funcionando correctamente en:
**`http://web.formosa.gob.ar/botilyx/`**
