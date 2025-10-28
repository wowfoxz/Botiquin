/**
 * Configuración de la aplicación
 * 
 * IMPORTANTE: Estas variables están hardcodeadas para evitar problemas
 * con variables de entorno que no se cargan correctamente en Docker build.
 * 
 * Para producción (Kubernetes): usar estos valores
 * Para desarrollo local: las variables de entorno las sobrescriben
 */

// Detectar si estamos en producción basándonos en NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';

// Configuración de producción (Kubernetes)
const PRODUCTION_CONFIG = {
  BASE_PATH: '/botilyx',
  API_URL: 'https://web.formosa.gob.ar/botilyx',
  APP_VERSION: '0.0.11',
  VAPID_PUBLIC_KEY: 'BO63iDbR-YNn2So-X3dvBuFMRTLn0RMeWLz1BEfd-LhqgNBIra7rKqY9RuYdeNtZWOZs5SOWm12KXMewuw-hM9k',
  AUTH_USER: 'admin',
  AUTH_PASS: 'admin123',
} as const;

// Configuración de desarrollo (local)
const DEVELOPMENT_CONFIG = {
  BASE_PATH: '',
  API_URL: 'http://localhost:3000',
  APP_VERSION: '0.1.0-dev',
  VAPID_PUBLIC_KEY: 'BO63iDbR-YNn2So-X3dvBuFMRTLn0RMeWLz1BEfd-LhqgNBIra7rKqY9RuYdeNtZWOZs5SOWm12KXMewuw-hM9k',
  AUTH_USER: 'admin',
  AUTH_PASS: 'admin123',
} as const;

/**
 * Configuración activa
 * Prioridad:
 * 1. Variables de entorno NEXT_PUBLIC_* (si existen)
 * 2. Configuración hardcodeada según NODE_ENV
 */
export const config = {
  // Base path para rutas
  BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? 
    (isProduction ? PRODUCTION_CONFIG.BASE_PATH : DEVELOPMENT_CONFIG.BASE_PATH),
  
  // URL de la API
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? 
    (isProduction ? PRODUCTION_CONFIG.API_URL : DEVELOPMENT_CONFIG.API_URL),
  
  // Versión de la aplicación
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? 
    (isProduction ? PRODUCTION_CONFIG.APP_VERSION : DEVELOPMENT_CONFIG.APP_VERSION),
  
  // Clave pública VAPID para notificaciones push
  VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? 
    (isProduction ? PRODUCTION_CONFIG.VAPID_PUBLIC_KEY : DEVELOPMENT_CONFIG.VAPID_PUBLIC_KEY),
  
  // Credenciales de autenticación básica
  AUTH_USER: process.env.NEXT_PUBLIC_AUTH_USER ?? 
    (isProduction ? PRODUCTION_CONFIG.AUTH_USER : DEVELOPMENT_CONFIG.AUTH_USER),
  
  AUTH_PASS: process.env.NEXT_PUBLIC_AUTH_PASS ?? 
    (isProduction ? PRODUCTION_CONFIG.AUTH_PASS : DEVELOPMENT_CONFIG.AUTH_PASS),
  
  // Flags de entorno
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: !isProduction,
} as const;

// Exportar también las configuraciones para referencia
export { PRODUCTION_CONFIG, DEVELOPMENT_CONFIG };

// Log de configuración en desarrollo
if (!isProduction) {
  console.log('🔧 Configuración cargada:', {
    NODE_ENV: process.env.NODE_ENV,
    BASE_PATH: config.BASE_PATH,
    API_URL: config.API_URL,
    APP_VERSION: config.APP_VERSION,
  });
}

