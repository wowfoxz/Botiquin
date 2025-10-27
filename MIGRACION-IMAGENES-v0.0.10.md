# 🖼️ Migración de Imágenes - Versión 0.0.10

## Problema
Las imágenes de medicamentos antiguas tienen URLs sin `basePath`:
- ❌ Anterior: `/medications/medication-123.jpeg`
- ✅ Correcto: `/botilyx/medications/medication-123.jpeg` (producción)

## Solución Automática (Recomendada)

### Opción 1: Actualizar URLs en la base de datos

```sql
-- Actualizar URLs de medicamentos
UPDATE Medication 
SET imageUrl = CONCAT('/botilyx', imageUrl)
WHERE imageUrl IS NOT NULL 
  AND imageUrl NOT LIKE '/botilyx%'
  AND imageUrl LIKE '/medications/%';

-- Verificar cambios
SELECT id, commercialName, imageUrl 
FROM Medication 
WHERE imageUrl IS NOT NULL;
```

### Opción 2: Ejecutar desde Kubernetes

```bash
# Conectar a MySQL desde Kubernetes
microk8s kubectl exec -n aplicaciones deployment/dev-mysql -- \
  mysql -u root -pmysql.botilyx2024 botilyx_db -e "
    UPDATE Medication 
    SET imageUrl = CONCAT('/botilyx', imageUrl)
    WHERE imageUrl IS NOT NULL 
      AND imageUrl NOT LIKE '/botilyx%'
      AND imageUrl LIKE '/medications/%';
  "

# Verificar
microk8s kubectl exec -n aplicaciones deployment/dev-mysql -- \
  mysql -u root -pmysql.botilyx2024 botilyx_db -e "
    SELECT id, commercialName, imageUrl 
    FROM Medication 
    WHERE imageUrl IS NOT NULL;
  "
```

## Solución Manual (Si no funciona la automática)

1. Exportar medicamentos con imágenes:
```sql
SELECT id, commercialName, imageUrl FROM Medication WHERE imageUrl IS NOT NULL;
```

2. Para cada medicamento, actualizar manualmente:
```sql
UPDATE Medication 
SET imageUrl = '/botilyx/medications/medication-XXXXX.jpeg' 
WHERE id = 'ID_DEL_MEDICAMENTO';
```

## Verificación

Después de la migración:

1. Acceder a la aplicación
2. Ir a "Mi Botiquín"
3. Las imágenes deben mostrarse correctamente
4. No debe haber errores "isn't a valid image" en los logs

## Prevención

Las nuevas imágenes ya se guardan con `basePath` incluido gracias a la corrección en `src/app/actions.ts`:

```typescript
// URL pública de la imagen (incluir basePath para producción)
imageUrl = `${config.BASE_PATH}/medications/${fileName}`;
```

