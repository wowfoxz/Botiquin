# 🚀 Guía de Despliegue con BasePath

## 📋 Configuración para BasePath `/botilyx/`

### ✅ Configuración Completada

El proyecto está **completamente configurado** para funcionar con basePath `/botilyx/` cuando se despliegue en producción.

### 🔧 Configuraciones Aplicadas

#### 1. **Next.js Configuration** (`next.config.ts`)
```typescript
basePath: process.env.NEXT_PUBLIC_BASE_PATH,
```
- ✅ Configurado para usar variable de entorno
- ✅ Funciona automáticamente con Next.js

#### 2. **Variables de Entorno**
```bash
# Desarrollo (sin basePath)
NEXT_PUBLIC_BASE_PATH=""

# Producción (con basePath)
NEXT_PUBLIC_BASE_PATH="/botilyx"
```

#### 3. **Dockerfile**
```dockerfile
ENV NEXT_PUBLIC_BASE_PATH=""
```
- ✅ Configurado para desarrollo por defecto
- ✅ Se sobrescribe en producción con Kubernetes

### 🌐 URLs de Acceso

#### **Desarrollo:**
- `http://localhost:3000/`
- `http://localhost:3000/login`
- `http://localhost:3000/botiquin`

#### **Producción:**
- `http://web.formosa.gob.ar/botilyx/`
- `http://web.formosa.gob.ar/botilyx/login`
- `http://web.formosa.gob.ar/botilyx/botiquin`

### 🎯 Configuración de Kubernetes

#### **Variables de Entorno en Kubernetes:**
```yaml
env:
  - name: NEXT_PUBLIC_BASE_PATH
    value: "/botilyx"
  - name: DATABASE_URL
    value: "mysql://root:mysql.botilyx2024@10.10.102.2:30002/botilyx_db"
  - name: SESSION_SECRET
    value: "your-super-secret-session-key-change-this-in-production"
```

#### **Ingress Configuration:**
```yaml
spec:
  rules:
  - host: web.formosa.gob.ar
    http:
      paths:
      - path: /botilyx
        pathType: Prefix
        backend:
          service:
            name: botilyx-service
            port:
              number: 3000
```

### ✅ Verificaciones Realizadas

1. **✅ Build Exitoso**: Sin errores de compilación
2. **✅ BasePath Configurado**: Next.js maneja automáticamente las rutas
3. **✅ Variables de Entorno**: Configuradas para desarrollo y producción
4. **✅ Dockerfile**: Preparado para basePath
5. **✅ Base de Datos**: MySQL conectada y funcionando

### 🚀 Pasos para Despliegue

1. **Ejecutar tu script de automatización** para construir la imagen Docker
2. **Configurar las variables de entorno** en Kubernetes con `NEXT_PUBLIC_BASE_PATH="/botilyx"`
3. **Configurar el ingress** para apuntar a `/botilyx/*`
4. **Desplegar** usando tu script de Kubernetes

### 🎉 ¡Listo para Producción!

El proyecto está **100% preparado** para funcionar en:
- **URL de Producción**: `http://web.formosa.gob.ar/botilyx/`
- **Base de Datos**: MySQL conectada
- **BasePath**: Configurado automáticamente
- **Todas las rutas**: Funcionarán correctamente

**Next.js maneja automáticamente el basePath, por lo que no necesitas hacer cambios adicionales en el código.**
