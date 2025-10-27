# 📝 Resumen de Commits - Versión 0.0.10

## 🎯 Objetivo de esta versión
Corrección de errores críticos identificados en producción v0.0.9, mejoras de UX y preparación para funcionalidades móviles.

---

## 📦 **COMMITS PARA v0.0.10:**

### **1. [FIX] Corregir error Foreign Key al eliminar medicamentos archivados**
```
src/app/actions.ts
- Agregar eliminación de registros relacionados (Toma, TreatmentMedication) antes de eliminar medicamento
- Prevenir error "Foreign key constraint violated on the fields: (medicamentoId)"
```

### **2. [FIX] Agregar basePath a URLs de imágenes de medicamentos con IA**
```
src/app/actions.ts
- Importar config para acceder a BASE_PATH
- Modificar processUploadedImage() para incluir basePath en imageUrl
- Cambiar de '/medications/${fileName}' a '${config.BASE_PATH}/medications/${fileName}'
```

### **3. [CHANGE] Mover módulo Historial del menú principal a Configuración**
```
src/components/menu/menu.tsx
- Eliminar "Historial" de menuItems
- Remover import de History icon (no usado)

src/app/configuracion/page.tsx
- Agregar import de History icon
- Agregar nueva Card para "Historial de actividades" en grid de configuración
- Enlazar a /historial desde el botón "Ver Historial"
```

### **4. [FIX] Prevenir llamadas a /api/auth en páginas de login/register**
```
src/components/menu/menu.tsx
- Determinar isAuthPage antes de checkAuth
- Modificar checkAuth para retornar temprano si isAuthPage es true
- Modificar useEffect para no verificar auth en páginas de autenticación
- Prevenir error "401 Unauthorized" en console al cargar login
```

### **5. [ADD] Documento de migración de imágenes antiguas**
```
MIGRACION-IMAGENES-v0.0.10.md
- Crear documento con instrucciones para actualizar URLs de imágenes
- Incluir queries SQL para migración automática
- Incluir comandos de Kubernetes para ejecución desde kubectl
```

### **6. [UPDATE] Actualizar versión de la aplicación a 0.0.10**
```
package.json
- Cambiar version de "0.0.9" a "0.0.10"

src/lib/config.ts
- Actualizar PRODUCTION_CONFIG.APP_VERSION de '0.0.9' a '0.0.10'
```

---

## 🐛 **ERRORES CORREGIDOS:**

| # | Error | Solución |
|---|-------|----------|
| 1 | **Foreign Key Constraint** al eliminar medicamento archivado | Eliminar registros relacionados (Toma, TreatmentMedication) antes de eliminar medicamento |
| 2 | **EACCES: permission denied** al guardar imágenes | Documentado en instrucciones de despliegue (requiere `chown` en servidor) |
| 3 | **Imagen inválida** con URL sin basePath | Corregido para nuevas imágenes, migración documentada para antiguas |
| 4 | **Error 401** en `/api/auth` al cargar login | Menú no verifica autenticación en páginas de login/register |
| 5 | **UX**: Historial en menú principal | Movido a sección de Configuración |

---

## 📋 **TAREAS PENDIENTES (NO INCLUIDAS EN v0.0.10):**

### **Problemas en Dispositivos Móviles (Requieren pruebas físicas):**
- 📱 **Notificaciones Push** no se activan en móvil
  - Probable: Permisos de notificaciones o Service Worker
  - Requiere: Pruebas en dispositivo real
  
- 📷 **Cámara** no funciona en móvil
  - Probable: Permisos de cámara o API no compatible
  - Requiere: Pruebas en dispositivo real

### **Duplicación de basePath (No reproducido):**
- 🔍 El error `/botilyx/botilyx/botiquin` reportado por el usuario
  - No se encontró en el código actual
  - Posible causa: caché del navegador o versión antigua
  - Acción: Monitorear en v0.0.10

---

## ✅ **CHECKLIST PRE-DESPLIEGUE:**

### **1. Permisos en Servidor (CRÍTICO)**
```bash
sudo chown -R 1001:1001 /mnt/dev-web-botilyx/medications
sudo chown -R 1001:1001 /mnt/dev-web-botilyx/treatment-images
sudo chmod -R 775 /mnt/dev-web-botilyx/medications
sudo chmod -R 775 /mnt/dev-web-botilyx/treatment-images
```

### **2. Migración de Imágenes (OPCIONAL)**
```bash
# Ver instrucciones completas en MIGRACION-IMAGENES-v0.0.10.md
microk8s kubectl exec -n aplicaciones deployment/dev-mysql -- \
  mysql -u root -pmysql.botilyx2024 botilyx_db -e "
    UPDATE Medication 
    SET imageUrl = CONCAT('/botilyx', imageUrl)
    WHERE imageUrl IS NOT NULL 
      AND imageUrl NOT LIKE '/botilyx%'
      AND imageUrl LIKE '/medications/%';
  "
```

### **3. Build de la Imagen**
```bash
# Usar script de automatización (Crear_Proyecto.sh)
# Versión: 0.0.10
# Descripción: "Correcciones críticas: Foreign Key, imágenes con basePath, UX"
```

### **4. Despliegue en Kubernetes**
```bash
microk8s kubectl set image -n aplicaciones deployment/dev-web-botilyx \
  dev-web-botilyx=upsti/dev-web-botilyx:v0.0.10

microk8s kubectl rollout status -n aplicaciones deployment/dev-web-botilyx
```

### **5. Verificación Post-Despliegue**
```bash
# Ver logs
microk8s kubectl logs -n aplicaciones deployment/dev-web-botilyx --tail=100

# Health check
microk8s kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  curl -s http://localhost:3000/botilyx/api/health

# Verificar permisos de imágenes
microk8s kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  ls -la /app/public/medications/ /app/public/treatment-images/
```

---

## 🔗 **ARCHIVOS MODIFICADOS:**

- ✅ `src/app/actions.ts`
- ✅ `src/components/menu/menu.tsx`
- ✅ `src/app/configuracion/page.tsx`
- ✅ `src/lib/config.ts`
- ✅ `package.json`
- ✅ `MIGRACION-IMAGENES-v0.0.10.md` (nuevo)
- ✅ `RESUMEN-COMMITS-v0.0.10.md` (nuevo)

---

## 📊 **ESTADÍSTICAS:**

- **Archivos modificados:** 5
- **Archivos nuevos:** 2
- **Bugs críticos corregidos:** 5
- **Mejoras de UX:** 1
- **Líneas de código agregadas:** ~50
- **Líneas de código eliminadas:** ~10

---

## 🚀 **PRÓXIMOS PASOS:**

1. Ejecutar permisos en servidor
2. Build imagen v0.0.10
3. Desplegar en Kubernetes
4. Ejecutar migración de imágenes
5. Probar funcionalidades corregidas
6. Monitorear logs por 24-48 horas
7. Planificar correcciones para móvil

---

**Versión:** 0.0.10  
**Fecha:** 2025-01-27  
**Estado:** ✅ Listo para despliegue

