 // Tipos para el sistema de tratamientos médicos

export type Medicamento = {
  id: string;
  commercialName: string;
  activeIngredient?: string;
  description?: string;
  intakeRecommendations?: string;
  imageUrl?: string;
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  expirationDate: Date;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type Tratamiento = {
  id: string;
  name: string;
  patient: string; // Nombre del paciente (texto libre para compatibilidad)
  patientId?: string; // ID del paciente del grupo familiar (opcional)
  patientType?: string; // "usuario" o "perfil" - tipo de paciente seleccionado
  symptoms?: string; // Síntomas del paciente (opcional)
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  medications?: TratamientoMedicamento[]; // Medicamentos del tratamiento
  images?: TratamientoImagen[]; // Imágenes del tratamiento
};

export type TratamientoMedicamento = {
  id: string;
  treatmentId: string;
  medicationId: string;
  frequencyHours: number;
  durationDays: number;
  dosage: string;
  startDate: Date;
  endDate: Date;
  startAtSpecificTime: boolean;
  specificStartTime?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  medication?: Medicamento;
};

export type TratamientoImagen = {
  id: string;
  treatmentId: string;
  imageUrl: string;
  imageType: "receta" | "instrucciones";
  extractedText?: string;
  aiAnalysis?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Notificacion = {
  id: string;
  treatmentId: string;
  scheduledDate: Date;
  sent: boolean;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PreferenciasNotificaciones = {
  id: string;
  push: boolean;
  sound: boolean;
  email: boolean;
  browser: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};
