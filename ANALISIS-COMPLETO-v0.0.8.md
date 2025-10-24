# 🔍 ANÁLISIS COMPLETO DEL SISTEMA - v0.0.8

## 📋 **ERRORES DETECTADOS EN LOG v0.0.7**

### 1. ❌ Duplicación de basePath: `/botilyx/botilyx/`

**Errores:**
```
GET https://web.formosa.gob.ar/botilyx/botilyx/botiquin 404
GET https://web.formosa.gob.ar/botilyx/botilyx/configuracion/grupo-familiar 404
```

**Causa Raíz:**
- `redirect()` en server actions DUPLICA el basePath en Next.js 15
- Next.js agrega `/botilyx` automáticamente
- El código agregaba `/botilyx` manualmente → resultado: `/botilyx/botilyx/`

**Solución Aplicada:**
```typescript
// ❌ ANTES (en server action):
redirect("/configuracion/grupo-familiar");  
// Next.js duplica: /botilyx + /botilyx + /configuracion = /botilyx/botilyx/configuracion

// ✅ AHORA:
// Server action:
revalidatePath("/configuracion/grupo-familiar");
// NO redirect() aquí

// Cliente (component):
router.push('/configuracion/grupo-familiar');
// Next.js agrega: /botilyx + /configuracion = /botilyx/configuracion ✅
```

**Archivos Corregidos:**
- `src/app/actions.ts`:
  - `agregarAdultoAlGrupo()` ✅
  - `agregarMenorConCuentaAlGrupo()` ✅
  - `agregarPerfilMenorAlGrupo()` ✅
  - `actualizarUsuarioGrupo()` ✅
  - `actualizarPerfilMenor()` ✅
  - `addMedication()` (línea 294) ✅
  - `registrarTomaMedicamento()` (línea 1111) ✅
- `src/app/configuracion/grupo-familiar/editar-usuario/[id]/page.tsx` ✅
- `src/app/configuracion/grupo-familiar/editar-perfil/[id]/page.tsx` ✅
- `src/app/medications/new/manual/components/MedicationForm.tsx` ✅
- `src/components/medication-card.tsx` ✅

---

### 2. ❌ Menú aparece en páginas de login/register

**Problema:**
El menú lateral se mostraba incluso en páginas de autenticación.

**Causa:**
- `layout.tsx` intentaba usar `getSession()` en servidor
- El componente `<Menu />` se renderizaba siempre

**Solución:**
```typescript
// src/components/menu/menu.tsx
const Menu = () => {
  const pathname = usePathname();
  const basePath = config.BASE_PATH;
  
  // No mostrar en páginas de autenticación
  const isAuthPage = pathname === `${basePath}/login` || 
                     pathname === `${basePath}/register` ||
                     pathname === '/login' || 
                     pathname === '/register';
  
  if (isAuthPage) {
    return null; // ✅ No renderizar
  }
  // ... resto del código
}
```

**Archivos Corregidos:**
- `src/components/menu/menu.tsx` ✅
- `src/app/layout.tsx` ✅

---

### 3. ❌ Link a forgot-password (404)

**Error:**
```
GET https://web.formosa.gob.ar/botilyx/forgot-password 404
```

**Causa:**
Página no implementada.

**Solución:**
Comentado temporalmente el link en login.

**Archivos Corregidos:**
- `src/components/client/login-form.tsx` ✅

---

### 4. ⚠️ Errores 500 en operaciones de medicamentos

**Errores:**
```
POST https://web.formosa.gob.ar/botilyx/medications/archived 500
POST https://web.formosa.gob.ar/botilyx/medications/new/manual?... 500
POST https://web.formosa.gob.ar/botilyx/api/tratamientos/upload-image 500
```

**Causa Probable:**
- Columnas de base de datos `TEXT` en lugar de `LONGTEXT`
- La auditoría (historial) guarda JSON grandes que exceden el límite de TEXT

**Solución Ya Aplicada (v0.0.7):**
```prisma
// prisma/schema.prisma
model User {
  foto String? @db.LongText // ✅ Cambiado
}

model Historial {
  datosPrevios     String?  @db.LongText  // ✅ Cambiado
  datosPosteriores String?  @db.LongText  // ✅ Cambiado
  metadata         String?  @db.LongText  // ✅ Cambiado
}
```

**Acción Requerida:**
```bash
# Ejecutar en el pod de Kubernetes después de desplegar v0.0.8
microk8s kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  npx prisma db push
```

---

## 📊 **REGLAS DE basePath EN NEXT.JS**

| Contexto | basePath Manual | Ejemplo |
|----------|----------------|---------|
| `<Link href="/ruta">` | ❌ NO | Next.js agrega automáticamente |
| `router.push("/ruta")` | ❌ NO | Next.js agrega automáticamente |
| `redirect()` en server component | ❌ NO | Next.js agrega automáticamente |
| `redirect()` en server action | ⚠️ **EVITAR** | **Causa duplicación** |
| `fetch("/api/...")` | ✅ SÍ | `apiFetch()` helper con `config.BASE_PATH` |
| `window.location.href` | ✅ SÍ | `${config.BASE_PATH}/ruta` |
| `<Image src="/image.png">` | ❌ NO | Next.js agrega automáticamente |
| Metadata (icons, manifest) | ✅ SÍ | `${basePath}/icons/favicon.ico` |
| Service Worker registration | ✅ SÍ | `${basePath}/sw.js` |
| Cookies `path` | ✅ SÍ | `path: basePath \|\| "/"` |

---

## ✅ **RESUMEN DE CORRECCIONES v0.0.8**

### 📁 **Archivos Modificados (11):**

```
✓ src/app/actions.ts (7 redirect() removidos)
✓ src/components/menu/menu.tsx (validación de ruta auth)
✓ src/app/layout.tsx (simplificado)
✓ src/components/client/login-form.tsx (forgot-password comentado)
✓ src/app/configuracion/grupo-familiar/editar-usuario/[id]/page.tsx
✓ src/app/configuracion/grupo-familiar/editar-perfil/[id]/page.tsx
✓ src/app/medications/new/manual/components/MedicationForm.tsx
✓ src/components/medication-card.tsx
✓ .env.production (versión 0.0.8)
✓ src/lib/config.ts (versión 0.0.8)
```

---

## 🚀 **VERIFICACIONES POST-DESPLIEGUE**

Después de desplegar v0.0.8, verificar:

### ✅ **Debe Funcionar:**
- [ ] Consumir medicamento → `/botilyx/botiquin` (sin duplicación)
- [ ] Editar usuario → `/botilyx/configuracion/grupo-familiar` (sin duplicación)
- [ ] Agregar medicamento → `/botilyx/botiquin` (sin duplicación)
- [ ] Menú NO aparece en `/botilyx/login`
- [ ] Menú NO aparece en `/botilyx/register`
- [ ] Favicon carga correctamente
- [ ] Manifest carga correctamente

### ⚠️ **Puede Fallar (si no se aplica prisma db push):**
- [ ] Error 500 al crear medicamento con auditoría grande
- [ ] Error 500 al actualizar usuario con foto
- [ ] Error 500 al subir imagen de tratamiento

**Solución:**
```bash
microk8s kubectl exec -n aplicaciones deployment/dev-web-botilyx -- \
  npx prisma db push
```

---

## 🎯 **LISTO PARA DESPLEGAR v0.0.8**

Todos los problemas de duplicación de basePath han sido corregidos siguiendo el patrón correcto de Next.js 15.

