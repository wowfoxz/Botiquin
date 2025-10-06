# Exportación de Listas de Compras

## Funcionalidades Implementadas

### 1. Exportar como Imagen (PNG)
- Utiliza `html-to-image` para capturar la lista como imagen
- Genera una imagen de alta resolución (3x)
- Crea dinámicamente el HTML antes de capturar
- Descarga automáticamente con nombre personalizado

### 2. Exportar como PDF
- Utiliza `@react-pdf/renderer` para generar PDFs
- Diseño limpio y profesional
- Incluye disclaimer de precios

### 3. Copiar como Texto
- Copia el contenido al portapapeles
- Formato de texto plano

## Archivos Creados

- `src/lib/export/exportImage.ts` - Utilidad para exportar como imagen (crea HTML dinámicamente)
- `src/lib/export/exportPDF.tsx` - Componente y utilidad para exportar como PDF
- `src/lib/export/index.ts` - Archivo de índice para importaciones

## Archivos Modificados

- `src/app/lista-compras/page.tsx` - Integración de las funcionalidades de exportación

## Uso

Las funcionalidades están disponibles en:
1. **Lista de Compras Actual**: Botón "Guardar" → Opciones de exportación
2. **Historial de Listas**: Botón "Opciones" en cada lista → Opciones de exportación

## Dependencias Instaladas

```bash
npm install html-to-image @react-pdf/renderer
```

## Notas Técnicas

- La exportación como imagen crea un elemento HTML temporal en el DOM, lo captura y luego lo elimina
- La exportación como PDF genera el documento programáticamente sin necesidad de renderizar HTML
- Los nombres de archivo se sanitizan automáticamente para evitar caracteres especiales
