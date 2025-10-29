"use client";

import { useNotificationProcessor } from '@/hooks/useNotificationProcessor';

/**
 * Componente que ejecuta el procesador de notificaciones automáticas
 * Solo se renderiza en producción para evitar spam en desarrollo
 */
export function NotificationProcessor() {
  // Solo ejecutar en producción
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useNotificationProcessor();
  }

  // No renderiza nada en el DOM
  return null;
}

