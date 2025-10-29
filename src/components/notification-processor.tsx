"use client";

import { useNotificationProcessor } from '@/hooks/useNotificationProcessor';

/**
 * Componente que ejecuta el procesador de notificaciones automáticas
 * Solo se ejecuta en producción para evitar spam en desarrollo
 */
export function NotificationProcessor() {
  // El hook decide internamente si ejecutarse o no según el entorno
  useNotificationProcessor();

  // No renderiza nada en el DOM
  return null;
}

