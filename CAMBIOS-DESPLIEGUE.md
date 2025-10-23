# 📋 Resumen de Cambios para Despliegue en Kubernetes

## 🎯 Objetivo
Preparar el proyecto Botilyx para ser desplegado en Kubernetes con persistencia de datos para imágenes y correcta configuración de basePath.

---

## ✅ Cambios Realizados

### 1. **Dockerfile Actualizado**
**Archivo:** `Dockerfile`

**Cambios:**
- ✅ Agregados `ARG` para aceptar build-args:
  - `NEXT_PUBLIC_BASE_PATH`
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_AUTH_USER`
  - `NEXT_PUBLIC_AUTH_PASS`
  - `NEXT_PUBLIC_APP_VERSION`
- ✅ Variables de entorno configuradas correctamente en build stage

**Impacto:**
- Ahora el script `Crear_Proyecto.sh` puede pasar variables en build time
- La imagen se construye con el basePath correcto (`/botilyx`)

---

### 2. **Archivo .dockerignore Creado**
**Archivo:** `.dockerignore` (NUEVO)

**Incluye:**
- Dependencias (`node_modules/`)
- Archivos de build (`.next/`, `out/`)
- Variables de entorno (`.env*`)
- Base de datos local (`*.db`)
- Documentación y scripts de desarrollo
- Imágenes de desarrollo (se usan las del volumen persistente)

**Impacto:**
- Imagen Docker más pequeña y rápida
- No se copian archivos innecesarios
- Mayor seguridad (no se copian secrets)

---

### 3. **Base de Datos SQLite Eliminada**
**Archivo eliminado:** `prisma/dev.db`

**Razón:**
- Ya no se usa SQLite
- Ahora todo apunta a MySQL en Kubernetes

---

### 4. **Archivos YAML para Kubernetes**
**Carpeta:** `k8s/` (NUEVA)

**Archivos creados:**

#### `00-namespace.yaml`
- Define el namespace `aplicaciones`

#### `01-pv-botilyx.yaml`
- PersistentVolume de 10Gi
- Montado en `/mnt/dev-web-botilyx` en el host

#### `02-pvc-botilyx.yaml`
- PersistentVolumeClaim que solicita el PV
- Usado por el deployment

#### `03-secret-botilyx.yaml` ⚠️ SENSIBLE
- Contiene TODAS las variables de entorno:
  - DATABASE_URL
  - GOOGLE_API_KEY
  - VAPID keys
  - SESSION_SECRET
  - NEXT_PUBLIC_* variables
- **⚠️ NO subir a Git** (ya está en `.gitignore`)

#### `04-deployment-botilyx.yaml`
- Deployment principal de la aplicación
- **Configuración destacada:**
  ```yaml
  volumeMounts:
    - name: botilyx-uploads
      mountPath: /app/public/medications
      subPath: medications
    - name: botilyx-uploads
      mountPath: /app/public/treatment-images
      subPath: treatment-images
  ```
- Health checks configurados
- Recursos limitados (256Mi-512Mi RAM, 100m-500m CPU)

#### `05-service-botilyx.yaml`
- Expone el deployment en puerto 80
- Tipo: LoadBalancer
- Session affinity configurada

#### `06-ingress-botilyx.yaml`
- Ruta: `/web-botilyx`
- Host: `dev.formosa.gob.ar`
- Rewrite configurado para basePath
- Timeouts aumentados para subida de imágenes (10MB, 10min)

#### `07-hpa-botilyx.yaml`
- Horizontal Pod Autoscaler
- Min: 1 replica, Max: 3 replicas
- Escala basado en CPU (80%) y Memoria (85%)

---

### 5. **Documentación de Despliegue**
**Archivo:** `k8s/README-DESPLIEGUE.md` (NUEVO)

**Contenido:**
- ✅ Guía paso a paso para despliegue
- ✅ Cómo crear la imagen con `Crear_Proyecto.sh`
- ✅ Cómo aplicar los archivos YAML
- ✅ Verificación del despliegue
- ✅ Troubleshooting común
- ✅ Comandos de actualización y rollback
- ✅ Monitoreo y logs

---

### 6. **Actualización de .gitignore**
**Archivo:** `.gitignore`

**Agregado:**
- `k8s/03-secret-botilyx.yaml` para proteger secrets

---

## 🔧 Cómo Usar

### Paso 1: Crear la Imagen Docker

**Con tu script `Crear_Proyecto.sh`:**

```bash
cd ~/KUBERNETES
bash Crear_Proyecto.sh
```

**Respuestas sugeridas:**
- Tipo: `2) Actualización`
- Proyecto: seleccionar carpeta de Botilyx
- Rama: `main`
- Imagen: `dev-web-botilyx`
- Versión: `0.1.0` (incrementar en cada actualización)
- **Base path:** `/botilyx` ⚠️ IMPORTANTE

---

### Paso 2: Desplegar en Kubernetes

**Aplicar todos los archivos YAML:**

```bash
cd ~/Servidor/proyectos/botilyx/Botiquin/k8s
microk8s kubectl apply -f .
```

**O aplicar en orden:**

```bash
microk8s kubectl apply -f 00-namespace.yaml
microk8s kubectl apply -f 01-pv-botilyx.yaml
microk8s kubectl apply -f 02-pvc-botilyx.yaml
microk8s kubectl apply -f 03-secret-botilyx.yaml
microk8s kubectl apply -f 04-deployment-botilyx.yaml
microk8s kubectl apply -f 05-service-botilyx.yaml
microk8s kubectl apply -f 06-ingress-botilyx.yaml
microk8s kubectl apply -f 07-hpa-botilyx.yaml
```

---

### Paso 3: Verificar

```bash
# Ver todos los recursos
microk8s kubectl get all -n aplicaciones | grep botilyx

# Ver logs
microk8s kubectl logs -f -n aplicaciones deployment/dev-web-botilyx

# Verificar health
curl http://dev.formosa.gob.ar/web-botilyx/api/health
```

---

## 🎯 URLs de Acceso

**Desarrollo:**
- Principal: `http://dev.formosa.gob.ar/web-botilyx/`
- Login: `http://dev.formosa.gob.ar/web-botilyx/login`
- Botiquín: `http://dev.formosa.gob.ar/web-botilyx/botiquin`
- Health: `http://dev.formosa.gob.ar/web-botilyx/api/health`

**Producción** (cuando se despliegue):
- Principal: `http://web.formosa.gob.ar/botilyx/`
- Login: `http://web.formosa.gob.ar/botilyx/login`

---

## 📦 Persistencia de Datos

### Imágenes Persistentes
Las imágenes subidas por los usuarios se guardan en:

**En el contenedor:**
- `/app/public/medications/`
- `/app/public/treatment-images/`

**En el host (persistente):**
- `/mnt/dev-web-botilyx/medications/`
- `/mnt/dev-web-botilyx/treatment-images/`

**Ventajas:**
- ✅ Las imágenes NO se pierden al reiniciar el pod
- ✅ Las imágenes NO se pierden al actualizar la aplicación
- ✅ Se pueden hacer backups fácilmente

### Base de Datos
- **MySQL externo:** `10.10.102.2:30002`
- **Base de datos:** `botilyx_db`
- **Persistencia:** Manejada por el deployment de MySQL

---

## 🔄 Actualización de la Aplicación

### Crear nueva versión

```bash
# 1. Incrementar versión en package.json
# 2. Crear nueva imagen
bash ~/KUBERNETES/Crear_Proyecto.sh
# Versión: 0.1.1 (ejemplo)

# 3. Actualizar deployment
microk8s kubectl set image deployment/dev-web-botilyx \
  dev-web-botilyx=upsti/dev-web-botilyx:v0.1.1 \
  -n aplicaciones

# 4. Verificar
microk8s kubectl rollout status deployment/dev-web-botilyx -n aplicaciones
```

### Rollback si hay problemas

```bash
microk8s kubectl rollout undo deployment/dev-web-botilyx -n aplicaciones
```

---

## ⚠️ Notas Importantes

1. **Secret contiene información sensible**
   - NO subir `k8s/03-secret-botilyx.yaml` a Git
   - Ya está protegido en `.gitignore`

2. **Permisos del directorio de persistencia**
   ```bash
   sudo mkdir -p /mnt/dev-web-botilyx/{medications,treatment-images}
   sudo chown -R 1001:1001 /mnt/dev-web-botilyx
   sudo chmod -R 755 /mnt/dev-web-botilyx
   ```

3. **Base path es crítico**
   - Asegurarse de pasar `/botilyx` al crear la imagen
   - Sin esto, las rutas no funcionarán correctamente

4. **Health check**
   - El pod tiene health checks configurados
   - Si falla 3 veces, Kubernetes reiniciará automáticamente

---

## 🐛 Problemas Comunes

### Pod no inicia
```bash
microk8s kubectl describe pod -n aplicaciones -l k8s-app=dev-web-botilyx
microk8s kubectl logs -n aplicaciones -l k8s-app=dev-web-botilyx
```

### Imágenes no se guardan
```bash
# Verificar montaje
microk8s kubectl exec -it -n aplicaciones deployment/dev-web-botilyx -- ls -la /app/public/medications/

# Verificar permisos
ls -la /mnt/dev-web-botilyx/
```

### No se puede acceder
```bash
# Verificar ingress
microk8s kubectl get ingress -n aplicaciones dev-web-botilyx
microk8s kubectl describe ingress -n aplicaciones dev-web-botilyx
```

---

## 📚 Documentación Adicional

- `k8s/README-DESPLIEGUE.md` - Guía completa de despliegue
- `docs/DEPLOYMENT.md` - Documentación general
- `docs/DEPLOYMENT_BASEPATH.md` - Configuración de basePath
- `README.md` - Documentación del proyecto

---

## ✅ Checklist Final

Antes de desplegar, verificar:

- [ ] MySQL está funcionando en `10.10.102.2:30002`
- [ ] Base de datos `botilyx_db` existe y está sincronizada
- [ ] Imagen Docker creada con la versión correcta
- [ ] Directorio `/mnt/dev-web-botilyx` creado con permisos `1001:1001`
- [ ] Archivo `03-secret-botilyx.yaml` tiene las variables correctas
- [ ] Namespace `aplicaciones` existe en Kubernetes
- [ ] Todos los archivos YAML están aplicados
- [ ] Pod está en estado `Running`
- [ ] Health check responde `200 OK`
- [ ] Aplicación accesible desde el navegador

---

## 🎉 ¡Listo para Desplegar!

Con estos cambios, Botilyx está completamente preparado para:
- ✅ Ser desplegado en Kubernetes
- ✅ Persistir imágenes de medicamentos y tratamientos
- ✅ Funcionar con basePath `/botilyx`
- ✅ Escalar automáticamente según la carga
- ✅ Conectarse a MySQL externo
- ✅ Usar la API de Google Gemini

**Siguiente paso:** Ejecutar `Crear_Proyecto.sh` y luego aplicar los YAMLs. 🚀

