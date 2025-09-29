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
  medicationId: string;
  frequencyHours: number;
  durationDays: number;
  patient: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  dosage: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  medication?: Medicamento;
  // Nuevo campo para especificar si el tratamiento comienza en una hora específica
  startAtSpecificTime?: boolean;
  // Nuevo campo para la hora específica de inicio
  specificStartTime?: Date;
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
