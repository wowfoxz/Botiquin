# 📝 RESUMEN DE CAMBIOS PARA COMMIT - v0.0.8

## [FIX] Corrección de duplicación de basePath en redirecciones

### Problema:
- Next.js 15 con `basePath` configurado duplicaba rutas: `/botilyx/botilyx/`
- `redirect()` en server actions causaba duplicación
- Menú aparecía en páginas de autenticación
- Errores 500 por columnas `TEXT` insuficientes

### Solución:
1. Removidos `redirect()` de server actions (7 lugares)
2. Navegación manejada por cliente con `router.push()`
3. Menú solo se renderiza si NO es página auth Y está autenticado
4. Columnas cambiadas a `LONGTEXT` en Prisma

---

## [CHANGE] Arquitectura de redirecciones

### Antes:
```typescript
// Server action
export async function actualizarUsuario(formData) {
  // ...
  redirect("/configuracion/grupo-familiar"); // ❌ Duplicaba: /botilyx/botilyx/
}
```

### Después:
```typescript
// Server action
export async function actualizarUsuario(formData) {
  // ...
  revalidatePath("/configuracion/grupo-familiar");
  // No redirect - el cliente maneja la navegación
}

// Cliente
await actualizarUsuario(formData);
router.push('/configuracion/grupo-familiar'); // ✅ Next.js agrega basePath: /botilyx/
```

---

## [FIX] Menú oculto en páginas de autenticación

### src/components/menu/menu.tsx
```typescript
const isAuthPage = pathname === `${basePath}/login` || 
                   pathname === `${basePath}/register` ||
                   pathname === '/login' || 
                   pathname === '/register';

if (isAuthPage) {
  return null; // No renderizar en páginas auth
}
```

---

## [UPDATE] Schema de base de datos

### prisma/schema.prisma
```prisma
model User {
  foto String? @db.LongText // TEXT → LONGTEXT
}

model Historial {
  datosPrevios     String? @db.LongText // TEXT → LONGTEXT
  datosPosteriores String? @db.LongText // TEXT → LONGTEXT
  metadata         String? @db.LongText // TEXT → LONGTEXT
}
```

---

## [REMOVE] Link temporalmente deshabilitado

### src/components/client/login-form.tsx
- Comentado link "¿Olvidaste tu contraseña?" (página no implementada)

---

## 📁 **ARCHIVOS MODIFICADOS (11)**

### Core Actions:
- [CHANGE] `src/app/actions.ts` - Removidos 7 redirect()

### Formularios:
- [CHANGE] `src/app/medications/new/manual/components/MedicationForm.tsx`
- [CHANGE] `src/app/configuracion/grupo-familiar/editar-usuario/[id]/page.tsx`
- [CHANGE] `src/app/configuracion/grupo-familiar/editar-perfil/[id]/page.tsx`

### Componentes:
- [FIX] `src/components/medication-card.tsx`
- [FIX] `src/components/menu/menu.tsx` - Lógica auth mejorada
- [FIX] `src/components/client/login-form.tsx` - Link comentado

### Layout:
- [CHANGE] `src/app/layout.tsx` - Simplificado

### Database:
- [UPDATE] `prisma/schema.prisma` - LONGTEXT

### Config:
- [UPDATE] `.env.production` - Versión 0.0.8
- [UPDATE] `src/lib/config.ts` - Versión 0.0.8

---

## 📊 **IMPACTO**

### ✅ **Solucionado:**
- Duplicación `/botilyx/botilyx/` en 7 flujos
- Menú en páginas de autenticación
- Link 404 a forgot-password
- Columnas insuficientes para datos grandes

### ✅ **Mejoras:**
- Navegación más consistente
- Mejor UX en autenticación
- Mayor capacidad de almacenamiento en auditoría
- Código más mantenible

### ⚠️ **Post-Despliegue:**
```bash
# Si prisma db push falla en Kubernetes:
microk8s kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  npx prisma db push
```

---

## 🎯 **TESTING RECOMENDADO**

### Flujos a verificar:
1. ✅ Login → Debe ir a `/botilyx/botiquin`
2. ✅ Consumir medicamento → Debe quedar en `/botilyx/botiquin`
3. ✅ Editar usuario → Debe ir a `/botilyx/configuracion/grupo-familiar`
4. ✅ Agregar medicamento → Debe ir a `/botilyx/botiquin`
5. ✅ Menú NO visible en `/botilyx/login`
6. ✅ Menú SÍ visible en `/botilyx/botiquin` (autenticado)
7. ✅ Subir foto de usuario → No error 500
8. ✅ Crear tratamiento con imágenes → No error 500

---

## 📚 **DOCUMENTACIÓN GENERADA**

- `ANALISIS-COMPLETO-v0.0.8.md` - Análisis de errores y soluciones
- `AUDITORIA-FINAL-v0.0.8.md` - Verificación exhaustiva del sistema
- `RESUMEN-COMMITS-v0.0.8.md` - Este archivo

---

## 🚀 **LISTO PARA PRODUCCIÓN**

**Versión:** 0.0.8
**Estado:** ✅ APROBADO
**Riesgo:** BAJO
**Rollback:** Disponible (v0.0.7)

