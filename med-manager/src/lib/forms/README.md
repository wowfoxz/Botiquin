# Migración a React Hook Form + Zod

Este proyecto ha sido migrado para usar **React Hook Form** con **Zod** para la validación de formularios, siguiendo las mejores prácticas de [shadcn/ui](https://ui.shadcn.com/docs/components/form) y [Zod](https://zod.dev/).

## Beneficios de la migración

### ✅ **Validación robusta**
- Validación del lado del cliente con mensajes de error claros
- Validación del lado del servidor mantenida para seguridad
- Esquemas de validación reutilizables y type-safe

### ✅ **Mejor experiencia de usuario**
- Validación en tiempo real sin recargar la página
- Mensajes de error específicos y contextuales
- Mejor accesibilidad con ARIA attributes automáticos

### ✅ **Desarrollo más eficiente**
- TypeScript type-safe con inferencia automática de tipos
- Menos código boilerplate
- Validación declarativa y fácil de mantener

## Estructura implementada

### 📁 **Esquemas de validación** (`src/lib/validations.ts`)
```typescript
// Ejemplo de esquema
export const loginSchema = z.object({
  email: z.string().min(1, "El correo electrónico es requerido").email("Debe ser un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Tipos TypeScript derivados automáticamente
export type LoginFormData = z.infer<typeof loginSchema>;
```

### 📁 **Componentes de formulario migrados**

#### 1. **Formulario de Login** (`src/components/client/login-form.tsx`)
- Validación de email y contraseña
- Mensajes de error específicos
- Mantiene compatibilidad con server actions

#### 2. **Formulario de Registro** (`src/components/client/register-form.tsx`)
- Validación de nombre, email y contraseña
- Validación de longitud y formato
- Feedback visual durante el proceso

#### 3. **Formulario de Medicamentos** (`src/app/medications/new/manual/components/MedicationForm.tsx`)
- Validación completa de todos los campos
- Integración con IA para descripción y recomendaciones
- Validación de fechas de vencimiento
- Soporte para imágenes

#### 4. **Formulario de Configuración** (`src/app/configuracion/components/NotificationSettingsForm.tsx`)
- Validación de rangos numéricos
- Configuración de notificaciones
- Valores por defecto inteligentes

#### 5. **Formulario de Tratamientos** (`src/app/tratamientos/components/TratamientoForm.tsx`)
- Validación compleja con dependencias entre campos
- Validación de stock disponible
- Validación de fechas futuras
- Cálculo automático de dosis totales

## Patrón de implementación

### 🔧 **Configuración del formulario**
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
    field1: '',
    field2: '',
  },
});
```

### 🔧 **Renderizado de campos**
```typescript
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Etiqueta del Campo</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 🔧 **Manejo de envío**
```typescript
const onSubmit = async (data: FormData) => {
  // Los datos ya están validados por Zod
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  
  await serverAction(formData);
};
```

## Características implementadas

### 🎯 **Validaciones específicas por formulario**

#### **Login/Registro**
- Email válido
- Contraseña mínima de 6 caracteres
- Campos requeridos

#### **Medicamentos**
- Nombre comercial requerido
- Cantidad numérica positiva
- Fecha de vencimiento futura
- Longitud máxima de textos

#### **Configuración**
- Rangos numéricos válidos (1-365 días)
- Valores positivos para stock

#### **Tratamientos**
- Validación de stock disponible
- Fechas futuras para inicio específico
- Dependencias entre campos (frecuencia/duración)

### 🎯 **Integración con shadcn/ui**
- Componentes `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- Estilos consistentes con el design system
- Accesibilidad automática

### 🎯 **Compatibilidad mantenida**
- Server actions existentes funcionan sin cambios
- FormData se genera automáticamente para compatibilidad
- Redirecciones y navegación preservadas

## Uso en desarrollo

### 📝 **Agregar nuevo campo**
1. Actualizar el esquema Zod en `validations.ts`
2. Agregar el campo al `defaultValues`
3. Crear el `FormField` correspondiente

### 📝 **Agregar validación personalizada**
```typescript
const customSchema = z.object({
  field: z.string().refine((val) => {
    // Lógica de validación personalizada
    return val.length > 5;
  }, {
    message: "Mensaje de error personalizado"
  })
});
```

### 📝 **Validación condicional**
```typescript
const conditionalSchema = z.object({
  type: z.enum(["option1", "option2"]),
  conditionalField: z.string().optional(),
}).refine((data) => {
  if (data.type === "option1") {
    return data.conditionalField !== undefined;
  }
  return true;
}, {
  message: "Campo requerido para esta opción",
  path: ["conditionalField"]
});
```

## Próximos pasos

- [ ] Migrar formularios restantes si los hay
- [ ] Agregar validación de archivos para imágenes
- [ ] Implementar validación asíncrona para verificar disponibilidad
- [ ] Agregar tests unitarios para los esquemas de validación
