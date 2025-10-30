"use client";

import { useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';

/**
 * Hook para procesar notificaciones automáticas en segundo plano
 * Se ejecuta cada 5 minutos mientras la app esté abierta
 * Solo se ejecuta en producción para evitar spam en desarrollo
 */
export function useNotificationProcessor() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Solo ejecutar en producción
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
      return;
    }

    const processNotifications = async () => {
      // Evitar llamadas concurrentes
      if (isProcessingRef.current) {
        return;
      }

      try {
        isProcessingRef.current = true;
        
        const response = await apiFetch('/api/notifications/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // Error silencioso - no loguear en producción
        }
      } catch {
        // Error silencioso - no loguear en producción
      } finally {
        isProcessingRef.current = false;
      }
    };

    // Ejecutar inmediatamente al montar
    processNotifications();

    // Ejecutar cada 5 minutos
    intervalRef.current = setInterval(processNotifications, 5 * 60 * 1000);

    // Limpiar al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}

