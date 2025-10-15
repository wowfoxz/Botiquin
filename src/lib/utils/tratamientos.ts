import {
  Tratamiento,
  Notificacion,
  PreferenciasNotificaciones,
} from "@/types/tratamientos";

/**
 * Calcular el número total de dosis para un medicamento de un tratamiento
 * @param medicamento - El medicamento del tratamiento para calcular las dosis
 * @returns El número total de dosis
 */
export const calcularDosisTotales = (medicamento: { durationDays: number; frequencyHours: number }): number => {
  return Math.ceil(
    medicamento.durationDays * (24 / medicamento.frequencyHours)
  );
};

/**
 * Generar fechas de dosis para un medicamento de un tratamiento
 * @param medicamento - El medicamento del tratamiento para generar las fechas
 * @param startDate - La fecha de inicio del tratamiento
 * @returns Un array de fechas de dosis
 */
export const generarFechasDosis = (medicamento: { durationDays: number; frequencyHours: number }, startDate: Date): Date[] => {
  // Ajustar la fecha de inicio a la zona horaria local
  const adjustedStartDate = new Date(
    startDate.getTime() -
      startDate.getTimezoneOffset() * 60000
  );
  const dosisTotales = calcularDosisTotales(medicamento);
  const fechas: Date[] = [];

  for (let i = 0; i < dosisTotales; i++) {
    const fechaDosis = new Date(
      adjustedStartDate.getTime() +
        i * medicamento.frequencyHours * 60 * 60 * 1000
    );
    fechas.push(fechaDosis);
  }

  return fechas;
};

/**
 * Crear notificaciones para un tratamiento
 * @param tratamientoId - ID del tratamiento
 * @param preferencias - Preferencias de notificaciones del usuario
 * @param fechasDosis - Fechas de dosis del tratamiento
 * @returns Array de notificaciones a crear
 */
export const crearNotificaciones = (
  tratamientoId: string,
  preferencias: PreferenciasNotificaciones,
  fechasDosis: Date[]
): Omit<Notificacion, "id" | "createdAt" | "updatedAt">[] => {
  const notificaciones: Omit<Notificacion, "id" | "createdAt" | "updatedAt">[] =
    [];

  fechasDosis.forEach((fecha) => {
    // Notificación push (30 minutos antes)
    if (preferencias.push) {
      notificaciones.push({
        treatmentId: tratamientoId,
        scheduledDate: new Date(fecha.getTime() - 30 * 60 * 1000),
        sent: false,
        type: "push",
      });
    }

    // Notificación por email (1 hora antes)
    if (preferencias.email) {
      notificaciones.push({
        treatmentId: tratamientoId,
        scheduledDate: new Date(fecha.getTime() - 60 * 60 * 1000),
        sent: false,
        type: "email",
      });
    }

    // Notificación de navegador (15 minutos antes)
    if (preferencias.browser) {
      notificaciones.push({
        treatmentId: tratamientoId,
        scheduledDate: new Date(fecha.getTime() - 15 * 60 * 1000),
        sent: false,
        type: "browser",
      });
    }

    // Notificación sonora (5 minutos antes)
    if (preferencias.sound) {
      notificaciones.push({
        treatmentId: tratamientoId,
        scheduledDate: new Date(fecha.getTime() - 5 * 60 * 1000),
        sent: false,
        type: "sound",
      });
    }
  });

  return notificaciones;
};

/**
 * Formatear una fecha a string legible
 * @param fecha - La fecha a formatear
 * @returns String con la fecha formateada
 */
export const formatearFecha = (fecha: Date): string => {
  // Ajustar la fecha a la zona horaria local antes de formatear
  const adjustedDate = new Date(
    fecha.getTime() - fecha.getTimezoneOffset() * 60000
  );
  return adjustedDate.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
