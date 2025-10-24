# Cambios Versión 0.0.5 - Fix Definitivo de BasePath y Variables de Entorno

## 🎯 Problema Resuelto

**La aplicación se construía SIN las variables `NEXT_PUBLIC_*` correctas**, causando:
- ❌ Conexión a `localhost:3306` en lugar de la base de datos correcta
- ❌ Errores 404 en todos los assets (`/api/manifest`, `/sw.js`, `/icons/*`)
- ❌ Error 500 en login
- ❌ Service Worker fallando
- ❌ Manifest no encontrado

**Causa raíz:** El archivo `.env.production` estaba bloqueado por `.dockerignore`, por lo que Next.js nunca lo leía durante el build de Docker.

---

## 📝 Cambios Realizados

### [FIX] `.dockerignore`
- Comentada la línea que bloqueaba `.env.production`
- Ahora el archivo SE COPIA durante el Docker build
- Next.js puede leer las variables `NEXT_PUBLIC_*` en build time

### [UPDATE] `Dockerfile`
- **Simplificado drasticamente** - Ya no depende de `--build-arg` complejos
- Copia `.env.production` **ANTES** de `npm run build`
- Next.js lee automáticamente las variables del archivo
- Eliminados todos los `ARG NEXT_PUBLIC_*`
- Health check ahora hardcodeado a `/botilyx/api/health`

### [UPDATE] `.env.production`
- Actualizada versión a `0.0.5`
- Confirmadas todas las variables `NEXT_PUBLIC_*`:
  ```env
  NEXT_PUBLIC_BASE_PATH=/botilyx
  NEXT_PUBLIC_API_URL=https://web.formosa.gob.ar/botilyx
  NEXT_PUBLIC_APP_VERSION=0.0.5
  NEXT_PUBLIC_VAPID_PUBLIC_KEY=BO63iDbR-YNn2So-X3dvBuFMRTLn0RMeWLz1BEfd-LhqgNBIra7rKqY9RuYdeNtZWOZs5SOWm12KXMewuw-hM9k
  NEXT_PUBLIC_AUTH_USER=admin
  NEXT_PUBLIC_AUTH_PASS=admin123
  ```

### [CREATE] `REBUILD-INSTRUCTIONS.md`
- Documento completo con instrucciones paso a paso
- Explicación del problema y la solución
- Comandos exactos para reconstruir y desplegar
- Verificaciones post-despliegue

---

## 🔄 Flujo de Build Actualizado

### ❌ Antes (v0.0.2 - v0.0.4):
```
1. Docker build
2. .dockerignore bloquea .env.production ⛔
3. Next.js no encuentra las variables
4. Build con valores vacíos/default
5. App apunta a localhost:3306
```

### ✅ Ahora (v0.0.5):
```
1. Docker build
2. .dockerignore permite .env.production ✅
3. Dockerfile copia .env.production
4. Next.js lee variables en build time
5. npm run build con variables correctas
6. App compilada con basePath=/botilyx
7. Runtime usa DATABASE_URL del Secret de K8s
```

---

## 🚀 Para Desplegar

### 1. Limpiar cache y reconstruir:
```powershell
cd C:\Users\Usuario\Desktop\KUBERNETES
docker builder prune --all --force
bash Crear_Proyecto.sh
```

Seleccionar:
- Versión: **0.0.5**
- Descripción: **"Fix: Variables de entorno correctas con basePath"**

### 2. Actualizar en Kubernetes:
```bash
kubectl set image deployment/dev-web-botilyx \
  dev-web-botilyx=upsti/dev-web-botilyx:v0.0.5 \
  -n aplicaciones

kubectl rollout status deployment/dev-web-botilyx -n aplicaciones
```

### 3. Verificar:
```bash
# No debe haber errores de localhost:3306
kubectl logs -n aplicaciones deployment/dev-web-botilyx --tail=50

# Health check debe funcionar
kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  curl -s http://localhost:3000/botilyx/api/health
```

---

## ✅ Resultado Esperado

Después del despliegue de **v0.0.5**:

- ✅ Base de datos: `10.10.102.2:30002/botilyx_db`
- ✅ BasePath: `/botilyx` en todas las rutas
- ✅ Assets cargan correctamente
- ✅ Manifest: `https://web.formosa.gob.ar/botilyx/api/manifest`
- ✅ Service Worker: `https://web.formosa.gob.ar/botilyx/sw.js`
- ✅ API calls: `https://web.formosa.gob.ar/botilyx/api/*`
- ✅ Login funciona sin error 500
- ✅ Iconos cargan desde `/botilyx/icons/*`

---

## 📊 Archivos Modificados

```
modified:   .dockerignore
modified:   Dockerfile
modified:   .env.production
new file:   REBUILD-INSTRUCTIONS.md
new file:   CAMBIOS-V0.0.5.md
```

---

## 💡 Lección Aprendida

**Problema:** Docker es MUY agresivo con el caché. Si un archivo crítico como `.env.production` no se copia correctamente la primera vez, las capas cacheadas persistirán incluso después de corregir los archivos fuente.

**Solución:** 
1. Asegurarse de que `.dockerignore` NO bloquea archivos necesarios
2. Siempre usar `docker builder prune --all --force` antes de builds críticos
3. Copiar `.env.production` ANTES del `COPY . .` para mejor control
4. Incrementar versión para forzar actualización en Kubernetes

---

## 🎯 Texto para el Commit

```
[FIX] Corregido build de Docker para incluir variables NEXT_PUBLIC_* correctas
[UPDATE] Dockerfile simplificado para leer .env.production directamente
[FIX] .dockerignore ahora permite copiar .env.production
[UPDATE] .env.production versión 0.0.5
[CREATE] Instrucciones de rebuild en REBUILD-INSTRUCTIONS.md
```

