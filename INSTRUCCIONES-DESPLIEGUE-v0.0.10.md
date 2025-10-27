# 🚀 Instrucciones de Despliegue v0.0.10

## ✅ **ESTADO DEL PROYECTO**

- ✅ **Build local exitoso**: Next.js compila correctamente
- ✅ **Permisos de volúmenes**: Configurados correctamente (1001:microk8s, 775)
- ✅ **Correcciones aplicadas**: 5 bugs críticos resueltos
- ✅ **Versión actualizada**: package.json y config.ts en v0.0.10
- ⏳ **Migración de imágenes**: Pendiente (opcional)

---

## 📋 **PASOS PARA DESPLIEGUE**

### **PASO 1: Encontrar el deployment de MySQL (PENDIENTE)**

```bash
# Listar todos los deployments
microk8s kubectl get deployments -n aplicaciones

# Listar pods de MySQL
microk8s kubectl get pods -n aplicaciones | grep -i mysql

# Listar services de MySQL
microk8s kubectl get services -n aplicaciones | grep -i mysql
```

Una vez identificado el nombre correcto, ejecutar la migración de imágenes (ver sección de Migración).

---

### **PASO 2: Crear imagen Docker v0.0.10**

Desde tu máquina de desarrollo, ejecutar tu script de automatización:

```bash
# Navegar al directorio del proyecto
cd ~/repos/wowfoxz/Botiquin/

# Ejecutar script de creación de imagen
# Configuración:
# - Repositorio: wowfoxz
# - Nombre imagen: dev-web-botilyx
# - Versión: 0.0.10
# - Descripción: "Correcciones críticas: Foreign Key, imágenes con basePath, permisos, UX"

bash ~/KUBERNETES/Crear_Proyecto.sh
```

**Parámetros que te pedirá:**
1. Tipo de proyecto: `2` (Actualización)
2. Carpeta: `Botiquin/`
3. Rama: `1` (main)
4. Nombre imagen: `dev-web-botilyx`
5. Versión: `0.0.10`
6. Descripción: `Correcciones críticas: Foreign Key, imágenes con basePath, permisos, UX`

---

### **PASO 3: Desplegar en Kubernetes**

```bash
# Desde el servidor Kubernetes
cd /home/upsti/Servidor/k8s-botilyx

# Actualizar deployment a v0.0.10
microk8s kubectl set image -n aplicaciones deployment/dev-web-botilyx \
  dev-web-botilyx=upsti/dev-web-botilyx:v0.0.10

# Esperar a que el rollout complete
microk8s kubectl rollout status -n aplicaciones deployment/dev-web-botilyx

# Verificar que los pods están corriendo
microk8s kubectl get pods -n aplicaciones | grep botilyx
```

---

### **PASO 4: Verificación Post-Despliegue**

#### **4.1 Health Check**
```bash
microk8s kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  curl -s http://localhost:3000/botilyx/api/health

# Debe mostrar:
# {"status":"healthy","timestamp":"...","service":"Botilyx","version":"1.0.0"}
```

#### **4.2 Verificar Permisos de Imágenes**
```bash
microk8s kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  ls -la /app/public/medications/ /app/public/treatment-images/

# Debe mostrar permisos de escritura para nextjs (1001)
```

#### **4.3 Ver Logs (sin errores)**
```bash
# Ver últimos logs
microk8s kubectl logs -n aplicaciones deployment/dev-web-botilyx --tail=100

# Buscar errores
microk8s kubectl logs -n aplicaciones deployment/dev-web-botilyx --tail=200 | grep -i error
```

---

### **PASO 5: Migración de Imágenes (OPCIONAL)**

**Solo si tienes imágenes antiguas con URLs sin basePath.**

#### **Opción A: Conectar directamente a MySQL**
```bash
# Desde cualquier máquina con mysql-client
mysql -h 10.10.102.2 -P 30002 -u root -pmysql.botilyx2024 botilyx_db

# Ejecutar migración
UPDATE Medication 
SET imageUrl = CONCAT('/botilyx', imageUrl)
WHERE imageUrl IS NOT NULL 
  AND imageUrl NOT LIKE '/botilyx%'
  AND imageUrl LIKE '/medications/%';

# Verificar
SELECT id, commercialName, imageUrl 
FROM Medication 
WHERE imageUrl IS NOT NULL 
LIMIT 10;

# Salir
exit;
```

#### **Opción B: Usar kubectl (una vez que sepas el nombre del pod de MySQL)**
```bash
# Reemplazar POD_NAME_MYSQL con el nombre real
microk8s kubectl exec -n aplicaciones POD_NAME_MYSQL -- \
  mysql -u root -pmysql.botilyx2024 botilyx_db -e "
    UPDATE Medication 
    SET imageUrl = CONCAT('/botilyx', imageUrl)
    WHERE imageUrl IS NOT NULL 
      AND imageUrl NOT LIKE '/botilyx%'
      AND imageUrl LIKE '/medications/%';
  "
```

---

## 🧪 **PRUEBAS FUNCIONALES POST-DESPLIEGUE**

### **1. Agregar Medicamento con IA**
- ✅ Subir imagen desde cámara/galería
- ✅ Verificar que la IA reconoce el medicamento
- ✅ Verificar que la imagen se muestra en el listado
- ✅ Verificar que NO hay error "EACCES: permission denied"

### **2. Eliminar Medicamento Archivado**
- ✅ Ir a "Medicamentos Archivados"
- ✅ Intentar eliminar un medicamento
- ✅ Verificar que NO hay error "Foreign key constraint violated"
- ✅ Verificar que se elimina correctamente

### **3. Subir Imágenes de Tratamiento**
- ✅ Crear nuevo tratamiento
- ✅ Subir imagen de receta
- ✅ Subir imagen de instrucciones
- ✅ Verificar que NO hay error "EACCES: permission denied"
- ✅ Verificar que las imágenes se guardan

### **4. Grupo Familiar**
- ✅ Agregar persona al grupo familiar
- ✅ Verificar que NO hay error 500
- ✅ Verificar que la validación de DNI duplicado funciona
- ✅ Verificar que el perfil se crea correctamente

### **5. UX - Historial en Configuración**
- ✅ Ir a "Configuración"
- ✅ Verificar que aparece la tarjeta "Historial"
- ✅ Verificar que el menú principal NO muestra "Historial"
- ✅ Hacer clic en "Ver Historial" y verificar que funciona

### **6. Imágenes sin 404**
- ✅ Ir a "Mi Botiquín"
- ✅ Verificar que las imágenes de medicamentos se cargan
- ✅ Abrir DevTools Console (F12)
- ✅ Verificar que NO hay errores "isn't a valid image"

---

## 📊 **RESUMEN DE CORRECCIONES v0.0.10**

| # | Problema | Estado |
|---|----------|--------|
| 1 | **Foreign Key Constraint** al eliminar archivados | ✅ Corregido |
| 2 | **EACCES** al guardar imágenes | ✅ Corregido (permisos) |
| 3 | **Imagen inválida** (sin basePath) | ✅ Corregido (nuevas) |
| 4 | **Error 401** en `/api/auth` en login | ✅ Corregido |
| 5 | **Historial en menú principal** | ✅ Movido a Configuración |

---

## 🔗 **ARCHIVOS MODIFICADOS**

- `src/app/actions.ts` - Foreign Key fix, basePath en imágenes
- `src/components/menu/menu.tsx` - Remover Historial, fix 401
- `src/app/configuracion/page.tsx` - Agregar Historial
- `src/lib/config.ts` - Versión 0.0.10
- `package.json` - Versión 0.0.10

---

## ⚠️ **PROBLEMAS CONOCIDOS PENDIENTES**

### **Móvil (Requieren pruebas en dispositivo real):**
- 📱 Notificaciones Push no se activan
- 📷 Cámara no funciona

### **No Críticos:**
- ⚠️ Warnings de ESLint (sin impacto funcional)
- ⚠️ ECONNREFUSED ::1:3000 (warning interno Next.js 15)

---

## 📞 **SOPORTE POST-DESPLIEGUE**

Si encuentras problemas después del despliegue:

### **Ver logs en tiempo real:**
```bash
microk8s kubectl logs -n aplicaciones deployment/dev-web-botilyx -f --tail=50
```

### **Ver eventos recientes:**
```bash
microk8s kubectl get events -n aplicaciones --sort-by='.lastTimestamp' | grep botilyx | tail -20
```

### **Verificar health del pod:**
```bash
microk8s kubectl describe pod -n aplicaciones -l app=botilyx
```

### **Reiniciar deployment (último recurso):**
```bash
microk8s kubectl rollout restart -n aplicaciones deployment/dev-web-botilyx
```

---

**Versión:** 0.0.10  
**Fecha:** 2025-01-27  
**Estado:** ✅ Listo para despliegue  
**Build local:** ✅ Exitoso  
**Permisos:** ✅ Configurados

