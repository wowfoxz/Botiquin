# Almacenamiento de Imágenes en Botilyx

## 📋 Resumen Ejecutivo

Las imágenes de medicamentos y tratamientos se guardan en la carpeta `public/` del proyecto:

- **Producción (Kubernetes)**: Se guardan en el volumen persistente montado en `/app/public/` (que apunta a `/mnt/dev-web-botilyx/` en el host)
- **Desarrollo (Local)**: Se guardan en la carpeta `public/` del proyecto local

---

## 🗂️ Tipos de Imágenes

| Tipo | Almacenamiento | Desarrollo | Producción |
|------|---------------|------------|------------|
| **Medicamentos** | Archivos | `public/medications/` | `/app/public/medications/` (montado desde `/mnt/dev-web-botilyx/medications/`) |
| **Tratamientos** (recetas/instrucciones) | Archivos | `public/treatment-images/` | `/app/public/treatment-images/` (montado desde `/mnt/dev-web-botilyx/treatment-images/`) |
| **Fotos de Perfil** | Base64 en BD | Base64 en BD | Base64 en BD |

---

## 🔧 Configuración Técnica

### Producción (Kubernetes)

El volumen `/mnt/dev-web-botilyx/` (host) se monta en `/app/public/` (contenedor) a través de la configuración en `k8s/04-deployment-botilyx.yaml`:

```yaml
volumeMounts:
  - name: botilyx-uploads
    mountPath: /app/public/medications
    subPath: medications
  - name: botilyx-uploads
    mountPath: /app/public/treatment-images
    subPath: treatment-images
```

**El código escribe en `/app/public/` que está montado al volumen persistente. No requiere configuración adicional.**

### Desarrollo (Local)

Las imágenes se guardan en la carpeta `public/` del proyecto:
- `public/medications/`
- `public/treatment-images/`

**No requiere configuración adicional.** Las carpetas se crean automáticamente si no existen.

---

## 📂 Estructura de Directorios

```
/mnt/dev-web-botilyx/
├── medications/
│   ├── medication-1759843096119-3hlan2va4vq.jpeg
│   ├── medication-1759957773932-keicotyp71l.jpeg
│   └── ...
└── treatment-images/
    ├── treatment-receta-1760395531352-f67zfl6u92w.jpg
    ├── treatment-instrucciones-1760395534720-gux3ibgu9y5.jpg
    └── ...
```

---

## 💻 Código Responsable

### 1. Imágenes de Medicamentos

**Archivo**: `src/app/actions.ts` → función `processUploadedImage`

```typescript
const isProduction = process.env.NODE_ENV === 'production';
const uploadsBasePath = isProduction
  ? path.join(process.cwd(), "public")  // Kubernetes: volumen montado en /app/public/
  : path.join(process.cwd(), "public");  // Desarrollo: carpeta local

const uploadDir = path.join(uploadsBasePath, "medications");
```

**En ambos entornos se usa `public/`, pero en Kubernetes está montado al volumen persistente.**

### 2. Imágenes de Tratamientos

**Archivo**: `src/app/api/tratamientos/upload-image/route.ts`

```typescript
const isProduction = process.env.NODE_ENV === 'production';
const uploadsBasePath = isProduction
  ? join(process.cwd(), "public")  // Kubernetes: volumen montado en /app/public/
  : join(process.cwd(), "public");  // Desarrollo: carpeta local

const uploadDir = join(uploadsBasePath, "treatment-images");
```

**En ambos entornos se usa `public/`, pero en Kubernetes está montado al volumen persistente.**

---

## ✅ Verificación

### En Desarrollo

Las imágenes se guardan en `public/medications/` y `public/treatment-images/` de tu proyecto.

Puedes verificar navegando a esas carpetas en el explorador de archivos.

### En Producción

Verifica los logs del pod:

```bash
kubectl logs -n aplicaciones <nombre-del-pod> | grep "Guardando"
```

Deberías ver:

```
📁 Guardando imágenes en: /app/public/treatment-images
📁 Guardando imagen de medicamento en: /app/public/medications
```

También puedes verificar directamente en el pod:

```bash
kubectl exec -it <nombre-del-pod> -n aplicaciones -- ls -la /app/public/medications/
kubectl exec -it <nombre-del-pod> -n aplicaciones -- ls -la /app/public/treatment-images/
```

O verificar en el servidor físico (los archivos se sincronizan automáticamente):

```bash
ls -la /mnt/dev-web-botilyx/medications/
ls -la /mnt/dev-web-botilyx/treatment-images/
```

---

## 🎯 Ventajas de esta Configuración

✅ **Código unificado**: La misma ruta `public/` funciona en desarrollo y producción
✅ **Persistencia en producción**: Las imágenes no se pierden al reconstruir el contenedor (volumen persistente)
✅ **Transparente**: El código no necesita saber dónde está montado el volumen
✅ **Fácil desarrollo**: No requiere configuración especial, solo `public/` local

---

## 🔍 Resolución de Problemas

### Las imágenes no se ven en la interfaz (Desarrollo)

1. Verifica que las carpetas existan:
   ```
   public/medications/
   public/treatment-images/
   ```

2. Verifica que las URLs en la BD sean correctas (deben incluir el `basePath`):
   ```sql
   SELECT imageUrl FROM Medication LIMIT 5;
   SELECT imageUrl FROM TreatmentImage LIMIT 5;
   ```

3. Asegúrate de que el servidor de desarrollo esté sirviendo la carpeta `public/`:
   ```powershell
   .\start-dev.ps1
   ```

### Las imágenes no se ven en la interfaz (Producción)

1. Verifica que los archivos existan en el servidor:
   ```bash
   ls -la /mnt/dev-web-botilyx/medications/
   ls -la /mnt/dev-web-botilyx/treatment-images/
   ```

2. Verifica los permisos:
   ```bash
   ls -la /mnt/dev-web-botilyx/
   # Debería mostrar: drwxrwxr-x nextjs nodejs
   ```

3. Verifica que el volumen esté montado correctamente en el pod:
   ```bash
   kubectl exec -n aplicaciones <nombre-del-pod> -- ls -la /mnt/dev-web-botilyx/
   ```

---

## 📚 Documentación Relacionada

- [Deployment en Kubernetes](./README-DESPLIEGUE.md)

