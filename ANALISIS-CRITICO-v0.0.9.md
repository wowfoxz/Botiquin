# 🔴 ANÁLISIS CRÍTICO DE SEGURIDAD - v0.0.9

## ⚠️ **PROBLEMAS CRÍTICOS DE SEGURIDAD IDENTIFICADOS**

### 🔴 **1. FUGA DE DATOS - Medicamentos visibles entre usuarios**

#### **Archivos afectados:**
1. `src/components/medication-list.tsx` - Líneas 58-63
2. `src/app/medications/archived/page.tsx` - Líneas 30-37

#### **Problema:**
```typescript
// ❌ NO FILTRA POR userId
medications = await prisma.medication.findMany({
  where: whereClause,  // Solo filtra archived: false
  orderBy: {
    createdAt: 'desc',
  },
});
```

#### **Impacto:**
- ✅ **CONFIRMADO POR USUARIO**: El segundo usuario ve los medicamentos del primero
- Vulnerabilidad de privacidad CRÍTICA
- Todos los usuarios ven medicamentos de TODOS los usuarios

#### **Solución:**
```typescript
// ✅ Obtener userId de la sesión
const session = await getSession();
if (!session?.userId) {
  redirect('/login');
}

// ✅ Agregar userId al whereClause
const whereClause: Record<string, unknown> = { 
  archived: false,
  userId: session.userId  // ✅ FILTRAR POR USUARIO
};
```

---

### 🔴 **2. MIDDLEWARE NO PROTEGE RUTAS CRÍTICAS**

#### **Problema:**
El middleware NO incluye:
- `/api/auth` (NO protegido)
- `/botiquin` (páginas públicas, NO protegidas)
- `/medications` (páginas públicas, NO protegidas)

#### **Evidencia del usuario:**
> "cuando ingreso deslogeado a @https://web.formosa.gob.ar/botilyx la web me redirige a @https://web.formosa.gob.ar/botilyx/botiquin y me muestra los datos del usuario"

#### **Archivos afectados:**
- `src/middleware.ts` - Líneas 9-17, 58-67
- `src/app/page.tsx` - Redirige a `/botiquin` sin verificar sesión

#### **Solución:**
Las páginas que consumen datos deben verificar la sesión **dentro del componente** (como ya lo hace `medication-list.tsx` en línea 28), pero falta el filtro por `userId`.

---

## ⚠️ **PROBLEMAS DE VALIDACIÓN**

### 📋 **3. Límite de unidad muy restrictivo**

#### **Archivo afectado:**
- `src/lib/validations.ts` - Línea 73

#### **Problema:**
```typescript
unit: z
  .string()
  .min(1, "La unidad es requerida")
  .max(20, "La unidad no puede tener más de 20 caracteres"),
  //  ❌ ^^ Demasiado corto
```

#### **Evidencia del usuario:**
> "no puedo ingresar 'comprimidos recubiertos' por que mi arroja 'La unidad no puede tener más de 20 caracteres'"

"comprimidos recubiertos" = 23 caracteres

#### **Solución:**
```typescript
.max(50, "La unidad no puede tener más de 50 caracteres"),
```

---

## 🐛 **PROBLEMAS DE REDIRECCIÓN**

### 🔄 **4. Duplicación de basePath en editar usuario**

#### **Evidencia del usuario:**
> "al guardar, se guarda bien pero la url me redirige erroneamente a: @https://web.formosa.gob.ar/botilyx/botilyx/configuracion/grupo-familiar"

#### **Ubicación:**
- `src/app/configuracion/grupo-familiar/editar-usuario/[id]/page.tsx` - Línea 120

#### **Código actual:**
```typescript
router.push('/configuracion/grupo-familiar?success=Usuario actualizado exitosamente');
```

#### **Análisis:**
El código parece correcto. El problema podría estar en:
1. Cache del navegador
2. Service Worker desactualizado
3. Problema de compilación

#### **Verificación necesaria:**
- Build completo
- Limpiar caché de navegador
- Verificar que no hay otros `redirect()` ocultos

---

## 🖼️ **PROBLEMAS DE ASSETS**

### 🔕 **5. Favicon 404 en notificaciones**

#### **Evidencia del usuario:**
```
GET https://web.formosa.gob.ar/icons/favicon.png 404 (Not Found)
```

#### **Problema:**
Falta `basePath` en la ruta del ícono: `/botilyx/icons/favicon.png`

#### **Archivo afectado:**
- `src/hooks/useNotifications.ts` o donde se envíe la notificación test

#### **Solución:**
Agregar `config.BASE_PATH` a la ruta del ícono.

---

### 🖼️ **6. Error 400 en Next.js Image Optimizer**

#### **Evidencia del usuario:**
```
GET https://web.formosa.gob.ar/botilyx/_next/image?url=%2Fmedications%2F...&w=64&q=75 400 (Bad Request)
```

#### **Problema:**
La imagen no existe en el volumen montado de Kubernetes o la ruta es incorrecta.

#### **Causas posibles:**
1. Imagen se subió antes de montar el volumen persistente
2. Permisos incorrectos en el volumen (1001:1001)
3. La imagen está en otro pod

#### **Solución:**
Verificar permisos y existencia de archivos en `/mnt/dev-web-botilyx/medications/`

---

## 🔴 **ERRORES 500 - Auditoría**

### 💥 **7. POST 500 en operaciones con auditoría**

#### **Evidencia del usuario:**
```
POST /botilyx/medications/archived 500 (Internal Server Error)
POST /botilyx/medications/new/manual 500 (Internal Server Error)
POST /botilyx/api/tratamientos/upload-image 500 (Internal Server Error)
```

#### **Causa raíz:**
Columnas `TEXT` insuficientes para datos de auditoría en:
- `Historial.datosPrevios`
- `Historial.datosPosteriores`
- `Historial.metadata`
- `User.foto`

#### **Solución:**
```bash
# EN KUBERNETES - Después del despliegue
microk8s kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  npx prisma db push
```

Esto actualiza las columnas a `LONGTEXT`.

---

## ⚠️ **WARNINGS (NO CRÍTICOS)**

### 📋 **8. Missing Description en DialogContent**

```
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
```

**Impacto:** Accesibilidad (no crítico)

**Solución futura:** Agregar `<DialogDescription>` en los diálogos.

---

## 📊 **RESUMEN DE PRIORIDADES**

### 🔴 **CRÍTICO - Arreglar INMEDIATAMENTE:**
1. ✅ Filtrar medicamentos por `userId` (2 archivos)
2. ✅ Aumentar límite de unidad a 50 caracteres

### 🟡 **IMPORTANTE - Arreglar ANTES de desplegar:**
3. ✅ Corregir favicon en notificaciones
4. ⚠️ Verificar duplicación de basePath (puede ser caché)

### 🔵 **INFORMATIVO - Documentar:**
5. ⚠️ Los errores 500 requieren `prisma db push` en K8s
6. ⚠️ Las imágenes 400 requieren verificar permisos del volumen

---

## 🎯 **PLAN DE ACCIÓN**

1. **Corregir `medication-list.tsx`**: Agregar filtro por `userId`
2. **Corregir `medications/archived/page.tsx`**: Agregar filtro por `userId`
3. **Aumentar validación de unidad**: De 20 a 50 caracteres
4. **Corregir favicon en notificaciones**: Agregar `basePath`
5. **Build completo**: Verificar que no hay errores
6. **Probar localmente**: Dos usuarios diferentes
7. **Desplegar v0.0.9**: Con todas las correcciones
8. **Ejecutar `prisma db push`**: En Kubernetes después del despliegue
9. **Verificar permisos**: En `/mnt/dev-web-botilyx/`

---

## 📝 **CAMBIOS PARA v0.0.9**

```
[FIX] CRÍTICO: Filtrado por userId en medicamentos
[FIX] CRÍTICO: Límite de unidad aumentado a 50 caracteres
[FIX] Favicon 404 en notificaciones (agregar basePath)
[UPDATE] Documentación de post-despliegue (prisma db push)
```

---

## ⚠️ **NOTAS IMPORTANTES**

1. **Los errores 500** NO se corregirán en el código, requieren `prisma db push` en K8s.
2. **La duplicación de basePath** podría ser caché del navegador.
3. **Las imágenes 400** requieren verificación manual en el servidor.
4. **El middleware está correcto** - las páginas verifican sesión internamente.

