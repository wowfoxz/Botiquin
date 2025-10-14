import { z } from "zod";

// Esquema para el formulario de login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Debe ser un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Esquema para el formulario de registro inicial (creador del grupo familiar)
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Debe ser un correo electrónico válido"),
  dni: z
    .string()
    .min(1, "El DNI es requerido")
    .min(7, "El DNI debe tener al menos 7 caracteres")
    .max(10, "El DNI no puede tener más de 10 caracteres")
    .regex(/^[0-9]+$/, "El DNI debe contener solo números"),
  fechaNacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      return date < today;
    }, {
      message: "La fecha de nacimiento debe ser en el pasado",
    }),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede tener más de 100 caracteres"),
  grupoNombre: z
    .string()
    .min(1, "El nombre del grupo familiar es requerido")
    .min(2, "El nombre del grupo debe tener al menos 2 caracteres")
    .max(50, "El nombre del grupo no puede tener más de 50 caracteres"),
});

// Esquema para el formulario de medicamentos
export const medicationSchema = z.object({
  commercialName: z
    .string()
    .min(1, "El nombre comercial es requerido")
    .max(100, "El nombre comercial no puede tener más de 100 caracteres"),
  activeIngredient: z
    .string()
    .max(100, "El principio activo no puede tener más de 100 caracteres")
    .optional(),
  initialQuantity: z
    .string()
    .min(1, "La cantidad inicial es requerida")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "La cantidad inicial debe ser un número mayor que 0",
    }),
  unit: z
    .string()
    .min(1, "La unidad es requerida")
    .max(20, "La unidad no puede tener más de 20 caracteres"),
  description: z
    .string()
    .max(500, "La descripción no puede tener más de 500 caracteres")
    .optional(),
  intakeRecommendations: z
    .string()
    .max(500, "Las recomendaciones no pueden tener más de 500 caracteres")
    .optional(),
  expirationDate: z
    .string()
    .min(1, "La fecha de vencimiento es requerida")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, {
      message: "La fecha de vencimiento debe ser hoy o en el futuro",
    }),
  imageUrl: z.string().optional(),
});

// Esquema para el formulario de configuración de notificaciones
export const notificationSettingsSchema = z.object({
  daysBeforeExpiration: z
    .string()
    .min(1, "Los días antes del vencimiento son requeridos")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1 && num <= 365;
    }, {
      message: "Los días deben ser un número entre 1 y 365",
    }),
  lowStockThreshold: z
    .string()
    .min(1, "El umbral de stock bajo es requerido")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, {
      message: "El umbral de stock bajo debe ser un número mayor o igual a 0",
    }),
});

// Esquema para medicamentos individuales en un tratamiento
export const treatmentMedicationSchema = z.object({
  medicationId: z
    .string()
    .min(1, "Debe seleccionar un medicamento"),
  dosage: z
    .string()
    .min(1, "La dosis es requerida")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, {
      message: "La dosis debe ser un número mayor a 0",
    }),
  frequencyHours: z
    .string()
    .min(1, "La frecuencia es requerida")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, {
      message: "La frecuencia debe ser un número mayor que 0",
    }),
  durationDays: z
    .string()
    .min(1, "La duración es requerida")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, {
      message: "La duración debe ser un número mayor que 0",
    }),
  startOption: z.enum(["now", "specific"]),
  specificDate: z.string().optional(),
}).refine((data) => {
  if (data.startOption === "specific") {
    if (!data.specificDate) {
      return false;
    }
    const selectedDate = new Date(data.specificDate);
    const now = new Date();
    return selectedDate > now;
  }
  return true;
}, {
  message: "La fecha de inicio debe ser en el futuro",
  path: ["specificDate"],
});

// Esquema para el formulario de tratamientos mejorado
export const treatmentSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del tratamiento es requerido")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  patient: z.string().optional(),
  patientId: z.string().optional(), // ID del paciente del grupo familiar
  patientType: z.enum(["usuario", "perfil"]).optional(), // Tipo de paciente
  symptoms: z
    .string()
    .max(500, "Los síntomas no pueden tener más de 500 caracteres")
    .optional(),
  medications: z
    .array(treatmentMedicationSchema)
    .min(1, "Debe agregar al menos un medicamento"),
});

// Esquema para agregar integrante adulto al grupo familiar
export const agregarAdultoSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Debe ser un correo electrónico válido"),
  dni: z
    .string()
    .min(1, "El DNI es requerido")
    .min(7, "El DNI debe tener al menos 7 caracteres")
    .max(10, "El DNI no puede tener más de 10 caracteres")
    .regex(/^[0-9]+$/, "El DNI debe contener solo números"),
  fechaNacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      return date < today;
    }, {
      message: "La fecha de nacimiento debe ser en el pasado",
    }),
});

// Esquema para agregar menor con cuenta al grupo familiar
export const agregarMenorConCuentaSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Debe ser un correo electrónico válido"),
  dni: z
    .string()
    .min(1, "El DNI es requerido")
    .min(7, "El DNI debe tener al menos 7 caracteres")
    .max(10, "El DNI no puede tener más de 10 caracteres")
    .regex(/^[0-9]+$/, "El DNI debe contener solo números"),
  fechaNacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      return date < today;
    }, {
      message: "La fecha de nacimiento debe ser en el pasado",
    }),
});

// Esquema para agregar perfil de menor sin cuenta al grupo familiar
export const agregarPerfilMenorSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  dni: z
    .string()
    .min(1, "El DNI es requerido")
    .min(7, "El DNI debe tener al menos 7 caracteres")
    .max(10, "El DNI no puede tener más de 10 caracteres")
    .regex(/^[0-9]+$/, "El DNI debe contener solo números"),
  fechaNacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      return date < today;
    }, {
      message: "La fecha de nacimiento debe ser en el pasado",
    }),
});

// Esquema para registrar toma de medicamento
export const registrarTomaSchema = z.object({
  medicamentoId: z
    .string()
    .min(1, "Debe seleccionar un medicamento"),
  consumidorTipo: z.enum(["usuario", "perfil"]),
  consumidorId: z
    .string()
    .min(1, "Debe seleccionar un consumidor"),
  fechaHora: z
    .string()
    .min(1, "La fecha y hora son requeridas")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: "La fecha y hora deben ser válidas",
    }),
});

// Tipos TypeScript derivados de los esquemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type AgregarAdultoFormData = z.infer<typeof agregarAdultoSchema>;
export type AgregarMenorConCuentaFormData = z.infer<typeof agregarMenorConCuentaSchema>;
export type AgregarPerfilMenorFormData = z.infer<typeof agregarPerfilMenorSchema>;
export type RegistrarTomaFormData = z.infer<typeof registrarTomaSchema>;
export type MedicationFormData = z.infer<typeof medicationSchema>;
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
export type TreatmentMedicationFormData = z.infer<typeof treatmentMedicationSchema>;
export type TreatmentFormData = z.infer<typeof treatmentSchema>;
