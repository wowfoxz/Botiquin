# 📋 INSTRUCCIONES POST-DESPLIEGUE - v0.0.9

## ⚠️ **IMPORTANTE: EJECUTAR DESPUÉS DEL DESPLIEGUE**

### 🔴 **1. Actualizar esquema de base de datos (OBLIGATORIO)**

Los errores 500 en operaciones con auditoría se deben a que las columnas `TEXT` son insuficientes. Esto se corrige con:

```bash
# EN EL SERVIDOR KUBERNETES
microk8s kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  npx prisma db push
```

#### **¿Por qué es necesario?**
- Actualiza columnas `TEXT` → `LONGTEXT` en:
  - `Historial.datosPrevios`
  - `Historial.datosPosteriores`
  - `Historial.metadata`
  - `User.foto`

#### **¿Borra datos?**
NO. `prisma db push` solo modifica la estructura, no borra datos existentes.

#### **Resultado esperado:**
```
The database is already in sync with the Prisma schema.
```
O:
```
✔ Generated Prisma Client (v6.16.1) to ./node_modules/@prisma/client in 215ms
```

#### **Errores que soluciona:**
- ❌ `POST /botilyx/medications/archived 500`
- ❌ `POST /botilyx/medications/new/manual 500`
- ❌ `POST /botilyx/api/tratamientos/upload-image 500`

---

### 🖼️ **2. Verificar permisos de volumen persistente (RECOMENDADO)**

```bash
# EN EL SERVIDOR KUBERNETES (HOST)
sudo chown -R 1001:1001 /mnt/dev-web-botilyx/
sudo chmod -R 775 /mnt/dev-web-botilyx/
```

#### **Verificar permisos:**
```bash
ls -la /mnt/dev-web-botilyx/
```

**Resultado esperado:**
```
drwxrwxr-x  4 1001 microk8s 4096 ... .
drwxrwxr-x  2 1001 microk8s 4096 ... medications
drwxrwxr-x  2 1001 microk8s 4096 ... treatment-images
```

#### **Errores que soluciona:**
- ❌ `EACCES: permission denied` al subir imágenes
- ❌ `400 Bad Request` en Next.js Image Optimizer

---

### 🔄 **3. Limpiar caché de navegador (SI HAY PROBLEMAS DE REDIRECCIÓN)**

#### **Problema reportado:**
> "al guardar se redirige a `/botilyx/botilyx/configuracion/grupo-familiar`"

#### **Causa:**
Probablemente caché del navegador o Service Worker desactualizado.

#### **Solución:**
1. **En el navegador:**
   - Presionar `Ctrl + Shift + Delete` (Windows/Linux)
   - Presionar `Cmd + Shift + Delete` (Mac)
   - Seleccionar "Caché" y "Cookies"
   - Limpiar

2. **Forzar recarga:**
   - Presionar `Ctrl + Shift + R` (Windows/Linux)
   - Presionar `Cmd + Shift + R` (Mac)

3. **Desregistrar Service Worker:**
   - Abrir DevTools → Application → Service Workers
   - Click en "Unregister"
   - Recargar página

#### **Verificación:**
Después de limpiar, editar un usuario y verificar que la URL sea:
- ✅ `https://web.formosa.gob.ar/botilyx/configuracion/grupo-familiar`

Y NO:
- ❌ `https://web.formosa.gob.ar/botilyx/botilyx/configuracion/grupo-familiar`

---

## 📊 **4. Verificación de funcionamiento**

### ✅ **Pruebas recomendadas:**

1. **Seguridad (CRÍTICO):**
   ```
   - Crear Usuario A
   - Crear medicamento con Usuario A
   - Cerrar sesión
   - Crear Usuario B
   - Verificar que Usuario B NO vea medicamento de Usuario A ✅
   ```

2. **Validación de unidad:**
   ```
   - Agregar medicamento
   - Unidad: "comprimidos recubiertos" (23 caracteres)
   - Debe permitir guardar ✅
   ```

3. **Notificaciones:**
   ```
   - Configuración → Notificaciones
   - Click en "Enviar prueba"
   - Verificar que el ícono cargue correctamente ✅
   - NO debe mostrar: "GET /icons/favicon.png 404"
   - DEBE mostrar: "GET /botilyx/icons/favicon.png 200"
   ```

4. **Operaciones con auditoría:**
   ```
   - Eliminar medicamento archivado
   - Agregar nuevo medicamento
   - Subir imagen de tratamiento
   - DEBE retornar 200 (no 500) ✅
   ```

---

## 🐛 **5. Si persisten problemas**

### **Error 500 en operaciones:**
```bash
# Verificar que se ejecutó prisma db push
microk8s kubectl logs -n aplicaciones deployment/dev-web-botilyx --tail=100
```

### **Imágenes no cargan:**
```bash
# Verificar permisos en el host
ls -la /mnt/dev-web-botilyx/medications/
ls -la /mnt/dev-web-botilyx/treatment-images/
```

### **Duplicación de basePath persiste:**
```bash
# Reiniciar deployment
microk8s kubectl rollout restart -n aplicaciones deployment/dev-web-botilyx
microk8s kubectl rollout status -n aplicaciones deployment/dev-web-botilyx
```

---

## 📝 **RESUMEN DE CAMBIOS v0.0.9**

### 🔴 **CRÍTICO - Seguridad:**
- [FIX] Filtrado por `userId` en medicamentos (botiquín y archivados)
- [FIX] Prevención de fuga de datos entre usuarios

### 🟡 **IMPORTANTE:**
- [FIX] Límite de unidad aumentado de 20 a 50 caracteres
- [FIX] Favicon 404 en notificaciones (agregar basePath)

### 🔵 **MEJORAS:**
- [UPDATE] Documentación de post-despliegue
- [UPDATE] Instrucciones de verificación

---

## ⚠️ **NOTA SOBRE ERRORES 500**

Los errores 500 NO fueron corregidos en el código porque son causados por la estructura de la base de datos, no por bugs en el código. La solución es ejecutar `prisma db push` después del despliegue.

**NO** intentar corregir esto modificando el código. El esquema Prisma ya está correcto con `@db.LongText`.

---

## 🎯 **CHECKLIST POST-DESPLIEGUE**

- [ ] Ejecutar `prisma db push` en Kubernetes
- [ ] Verificar permisos en `/mnt/dev-web-botilyx/`
- [ ] Probar con 2 usuarios diferentes
- [ ] Verificar unidad > 20 caracteres
- [ ] Probar notificación test
- [ ] Verificar operaciones POST (sin 500)
- [ ] Limpiar caché de navegador (si es necesario)

---

## 📞 **SOPORTE**

Si algún problema persiste después de seguir estas instrucciones, proporcionar:
1. Logs del pod: `microk8s kubectl logs -n aplicaciones deployment/dev-web-botilyx --tail=100`
2. Permisos del volumen: `ls -la /mnt/dev-web-botilyx/`
3. Resultado de `prisma db push`
4. Navegador y versión utilizada

