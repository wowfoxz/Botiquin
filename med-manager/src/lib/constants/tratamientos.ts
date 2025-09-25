// Constantes para el sistema de tratamientos

export const TIPOS_NOTIFICACION = {
  PUSH: "push",
  EMAIL: "email",
  BROWSER: "browser",
  SOUND: "sound",
} as const;

export const TIEMPOS_ANTICIPACION = {
  PUSH: 30, // minutos
  EMAIL: 60, // minutos
  BROWSER: 15, // minutos
  SOUND: 5, // minutos
} as const;

export const FRECUENCIA_HORAS_DEFAULT = 8;
export const DURACION_DIAS_DEFAULT = 7;
