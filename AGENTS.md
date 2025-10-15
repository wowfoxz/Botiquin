# AGENTS.md - Reglas de trabajo para agentes

## Idioma y estilo de código
- Comunicarse siempre en **español**.
- Escribir **comentarios en español**.
- Usar **nombres en español** para variables, funciones, archivos y módulos, **salvo que** el proyecto ya use inglés y el cambio cause conflictos o inconsistencias.

## Lectura y análisis de archivos
- **Leer siempre el archivo completo** antes de hacer cualquier cambio.
- Comprender el **contexto global** antes de modificar cualquier línea.

## Restricciones de cambios
- **No modificar** el archivo `src/app/globals.css` (relacionado con Tailwind v4).
- **No cambiar el diseño general** del proyecto sin consultar con el equipo.
- **No crear nuevos componentes UI**, usar solo los existentes en `src/components/ui`.
  - Documentación de componentes: [https://ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)

## Uso de iconos
- Buscar primero el icono en **https://tabler.io/icons**.
- Si no existe ahí, recién entonces usar **https://lucide.dev/icons**.

## Calidad de código
- **Verificar que no haya errores de sintaxis ni de lógica** antes de finalizar una tarea.
- **Corregir advertencias de ESLint** sin introducir nuevos errores.
- **No romper funcionalidades existentes** al hacer cambios.
- ✅ **Revisión en frío obligatoria**:
  - Una vez que termines de escribir o corregir un archivo, **leelo completo otra vez**
    (desde la primera hasta la última línea) **sin saltarte nada**.
  - Comprobá que:
    - No haya llaves, paréntesis o comillas sin cerrar.
    - No exista código duplicado (imports, funciones, bloques JSX, etc.).
    - **No haya subrayados amarillos/rojos en el editor** (VS Code).
      - Si ves el mensaje *"All imports … are unused"*, *"is defined but never used"*, etc.,
  - Solo después de esta segunda pasada podés considerar la tarea terminada.

## Ejecución de comandos
- **No ejecutar comandos directamente en la terminal**.
- Enviar el comando que deba ejecutarse y esperar feedback del usuario.

## Documentación externa
- Leer y tener en cuenta la documentación oficial de Tailwind CSS v4:
  - [Tailwind CSS v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4 )
  - [Tailwind CSS v4 en español](https://johnserrano.co/blog/tailwind-css-4-novedades-y-configuracion )

## Stack tecnológico
- Antes de tocar cualquier dependencia o configuración, **leé los archivos**
  `package.json`.
  (o sus equivalentes) para inferir el stack exacto del proyecto.
- No instales ni actualices paquetes sin consultar; respeta las versiones
  ya resueltas por el lock-file (`pnpm-lock.yaml`, `package-lock.json` o `yarn.lock`).

## Testing
- En este proyecto **no se escriben tests automáticos**.
- No generes archivos de test (`*.test.*`, `*.spec.*`) ni instales
  frameworks de testing (jest, vitest, cypress, etc.).
-Cuando se te solicita un texto de los ultimos cambios para el Commit, tienes que usar adelante del cada texto la nomenclatura correspondiente [CREATE] [FIX] [ADD] [UPDATE] [DELETE] [CAHNGE] [EDIT]