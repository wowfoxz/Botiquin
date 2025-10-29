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
      console.log('ℹ️ NotificationProcessor: Deshabilitado en desarrollo');
      return;
    }

    const processNotifications = async () => {
      // Evitar llamadas concurrentes
      if (isProcessingRef.current) {
        console.log('⏭️ Notificaciones ya se están procesando, saltando...');
        return;
      }

      try {
        isProcessingRef.current = true;
        console.log('🔔 Procesando notificaciones automáticas...');
        
        const response = await apiFetch('/api/notifications/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Notificaciones procesadas:', data);
        } else {
          console.error('❌ Error procesando notificaciones:', response.statusText);
        }
      } catch (error) {
        console.error('❌ Error en proceso de notificaciones:', error);
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

