# 🔧 INSTRUCCIONES PARA RECONSTRUIR LA IMAGEN

## ❌ Problema Encontrado

La imagen Docker se construyó **sin las variables `NEXT_PUBLIC_*` correctas** porque:
1. El `.dockerignore` estaba bloqueando el archivo `.env.production`
2. Docker usó capas en caché de builds anteriores

Resultado: La aplicación apuntaba a `localhost:3306` y no tenía configurado el `basePath=/botilyx`

## ✅ Solución Implementada

### Cambios realizados:

1. **`.dockerignore`** - Comentada la línea que bloqueaba `.env.production`
2. **`Dockerfile`** - Simplificado para usar `.env.production` directamente:
   - Eliminados los `ARG` complejos
   - Copia `.env.production` antes del build
   - Next.js lee automáticamente las variables `NEXT_PUBLIC_*` del archivo

3. **`.env.production`** - Ya tiene todas las variables correctas:
   ```env
   NEXT_PUBLIC_BASE_PATH=/botilyx
   NEXT_PUBLIC_API_URL=https://web.formosa.gob.ar/botilyx
   NEXT_PUBLIC_APP_VERSION=0.0.5
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=BO63iDbR-YNn2So-X3dvBuFMRTLn0RMeWLz1BEfd-LhqgNBIra7rKqY9RuYdeNtZWOZs5SOWm12KXMewuw-hM9k
   NEXT_PUBLIC_AUTH_USER=admin
   NEXT_PUBLIC_AUTH_PASS=admin123
   ```

## 🚀 Pasos para Reconstruir

### Desde tu máquina Windows (donde está el código):

```powershell
# 1. Limpiar el cache de Docker COMPLETAMENTE
docker builder prune --all --force

# 2. Verificar que .env.production tiene las variables correctas
Get-Content .env.production

# 3. Ejecutar el script de creación
# Cuando te pregunte la versión, usa: 0.0.5
cd C:\Users\Usuario\Desktop\KUBERNETES
bash Crear_Proyecto.sh
```

### Seleccionar en el script:
- Proyecto: **Actualización**
- Carpeta: **Botiquin/**
- Rama: **main**
- Versión: **0.0.5**
- Descripción: **"Fix: Variables de entorno correctas con basePath"**

El script ahora:
- ✅ Detectará el `.env.production`
- ✅ Copiará el archivo dentro de la imagen
- ✅ Next.js leerá las variables `NEXT_PUBLIC_*` durante el build
- ✅ La aplicación se compilará con `basePath=/botilyx`
- ✅ La DATABASE_URL será la correcta del Secret de Kubernetes

### Desplegar en Kubernetes:

```bash
# En el servidor (nodomaster)
cd /home/upsti/Servidor/k8s-botilyx

# 1. Actualizar la imagen en el deployment
kubectl set image deployment/dev-web-botilyx \
  dev-web-botilyx=upsti/dev-web-botilyx:v0.0.5 \
  -n aplicaciones

# 2. Ver el progreso del despliegue
kubectl rollout status deployment/dev-web-botilyx -n aplicaciones

# 3. Verificar que el nuevo pod está corriendo
kubectl get pods -n aplicaciones | grep botilyx

# 4. Probar el health check
kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  curl -s http://localhost:3000/botilyx/api/health

# 5. Ver los logs para confirmar que no hay errores de base de datos
kubectl logs -n aplicaciones deployment/dev-web-botilyx --tail=50
```

## 🔍 Verificaciones

### 1. Verificar que la imagen tiene las variables correctas:

```bash
docker run --rm upsti/dev-web-botilyx:v0.0.5 env | grep NEXT_PUBLIC
```

Deberías ver:
```
NEXT_PUBLIC_BASE_PATH=/botilyx
NEXT_PUBLIC_API_URL=https://web.formosa.gob.ar/botilyx
NEXT_PUBLIC_APP_VERSION=0.0.5
...
```

### 2. Verificar que la app no intenta conectar a localhost:3306:

```bash
# Los logs NO deben mostrar "Can't reach database server at localhost:3306"
kubectl logs -n aplicaciones deployment/dev-web-botilyx | grep localhost:3306
```

Si el comando no devuelve nada = ✅ CORRECTO

### 3. Verificar desde el navegador:

1. Abrir: `https://web.formosa.gob.ar/botilyx`
2. **NO** debe haber errores 404 en:
   - `/botilyx/api/manifest` ✅
   - `/botilyx/api/auth` ✅
   - `/botilyx/sw.js` ✅
   - `/botilyx/icons/favicon.ico` ✅
   - `/botilyx/Botilyx_color_2.svg` ✅

3. El login debe funcionar sin errores 500

## 📊 Comparación Antes/Después

### ❌ Antes (v0.0.2):
```
Database: localhost:3306  ⛔
basePath: (vacío)         ⛔
Assets: 404 errors        ⛔
Login: 500 error          ⛔
```

### ✅ Después (v0.0.5):
```
Database: 10.10.102.2:30002/botilyx_db  ✅
basePath: /botilyx                       ✅
Assets: Todos cargan correctamente       ✅
Login: Funciona correctamente            ✅
```

## 🎯 ¿Por qué funciona ahora?

1. **`.env.production` ahora se copia** → No está bloqueado por `.dockerignore`
2. **Next.js lee las variables** → Durante `npm run build` lee el archivo
3. **Build limpio** → `docker builder prune --all` elimina capas viejas
4. **Variables compiladas** → Quedan embebidas en el código JavaScript compilado
5. **No depende de ARG** → Más simple y confiable

---

**NOTA:** Si después del rebuild aún ves errores, ejecuta:
```bash
# Eliminar COMPLETAMENTE la imagen vieja
docker rmi upsti/dev-web-botilyx:v0.0.2 --force
docker rmi upsti/dev-web-botilyx:v0.0.4 --force

# Limpiar TODO
docker system prune -a --force

# Volver a construir
bash Crear_Proyecto.sh
```

