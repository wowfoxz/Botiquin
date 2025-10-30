import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
}

// Eliminado tipo local PushSubscription no utilizado

export const useNotifications = () => {
  const [notificationState, setNotificationState] = useState<NotificationPermissionState>({
    permission: 'default',
    isSupported: false,
    isSubscribed: false
  });

  const [isLoading, setIsLoading] = useState(false);

  // Verificar soporte y permisos al cargar
  useEffect(() => {
    const checkNotificationSupport = async () => {
      // Verificar soporte básico
      const hasNotification = 'Notification' in window;
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasPushManager = 'PushManager' in window;

      if (!hasNotification || !hasServiceWorker || !hasPushManager) {
        setNotificationState(prev => ({ ...prev, isSupported: false }));
        return;
      }

      // Verificar si HTTPS (requerido para push notifications)
      // Permitir localhost y IPs locales para desarrollo
      const isLocalhost = location.hostname === 'localhost' || 
                         location.hostname === '127.0.0.1' ||
                         location.hostname.startsWith('192.168.') ||
                         location.hostname.startsWith('10.') ||
                         location.hostname.startsWith('172.') ||
                         location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/); // Cualquier IP local
      
      
      if (location.protocol !== 'https:' && !isLocalhost) {

        setNotificationState(prev => ({ ...prev, isSupported: false }));
        return;
      }

      setNotificationState(prev => ({ ...prev, isSupported: true }));
      
      // Verificar permisos actuales
      const permission = Notification.permission;
      setNotificationState(prev => ({ ...prev, permission }));

      // Verificar si ya está suscrito
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setNotificationState(prev => ({
          ...prev,
          isSubscribed: !!subscription
        }));
      } catch {
        // Error silencioso en verificación de suscripción
      }
    };

    checkNotificationSupport();
  }, []);

  // Solicitar permisos de notificación
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!notificationState.isSupported) {
      toast.error('Las notificaciones no son compatibles con este navegador');
      return false;
    }

    setIsLoading(true);
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        toast.success('Permisos de notificación concedidos');
        return true;
      } else {
        toast.error('Permisos de notificación denegados');
        return false;
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      toast.error('Error al solicitar permisos de notificación');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [notificationState.isSupported]);

  // Suscribirse a notificaciones push
  const subscribeToPush = useCallback(async (userId: string): Promise<boolean> => {
    if (!notificationState.isSupported) {
      toast.error('Las notificaciones push no son compatibles');
      return false;
    }

    if (notificationState.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setIsLoading(true);

    try {
      // Registrar service worker
      const { config } = await import('@/lib/config');
      const registration = await navigator.serviceWorker.register(config.BASE_PATH + '/sw.js');
      // Esperar a que el service worker esté listo
      await navigator.serviceWorker.ready;

      // Obtener clave VAPID (hardcodeada en config)
      const vapidKey = config.VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        throw new Error('VAPID_PUBLIC_KEY no está definida en config');
      }

      // Crear suscripción push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource
      });

      // Preparar datos de suscripción para el servidor
      const subscriptionData = {
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
            auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!))))
          }
        },
        userId
      };

      // Enviar suscripción al servidor
      const response = await apiFetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(`Error al registrar suscripción: ${errorData.error || 'Error desconocido'}`);
      }

      setNotificationState(prev => ({ ...prev, isSubscribed: true }));
      toast.success('Notificaciones push activadas correctamente');
      return true;

    } catch {
      toast.error('Error al activar notificaciones push');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [notificationState.isSupported, notificationState.permission, requestPermission]);

  // Desuscribirse de notificaciones push
  const unsubscribeFromPush = useCallback(async (userId: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // Notificar al servidor
        await apiFetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            endpoint: subscription.endpoint
          })
        });
      }

      setNotificationState(prev => ({ ...prev, isSubscribed: false }));
      toast.success('Notificaciones push desactivadas');
      return true;

    } catch {
      toast.error('Error al desactivar notificaciones push');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enviar notificación de prueba
  const sendTestNotification = useCallback(async () => {
    if (!notificationState.isSupported) {
      toast.error('Las notificaciones no están disponibles');
      return false;
    }

    try {
      // Solicitar permisos explícitamente
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        toast.error('Permisos de notificación denegados. Actívalos en configuración del navegador.');
        return false;
      }
      
      const { config } = await import('@/lib/config');
      
      // Usar Service Worker (funciona en móviles Y desktop)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Configuración de notificación con vibración
        const notificationOptions = {
          body: '¡Notificación funcionando! Las notificaciones push están activas correctamente.',
          icon: config.BASE_PATH + '/icons/favicon.png',
          badge: config.BASE_PATH + '/icons/favicon.png',
          tag: 'test-notification-' + Date.now(),
          requireInteraction: false, // En móvil es mejor false
          data: {
            url: config.BASE_PATH + '/tratamientos'
          }
        } as NotificationOptions & { vibrate?: number[] };
        
        // Agregar vibración si es móvil
        if ('vibrate' in navigator) {
          (notificationOptions as { vibrate: number[] }).vibrate = [200, 100, 200];
        }
        
        await registration.showNotification('🔔 Botilyx - Prueba', notificationOptions);

        toast.success('Notificación de prueba enviada');
        return true;
      } else {
        // Fallback para navegadores sin Service Worker (raro)
        const notification = new Notification('🔔 Botilyx - Prueba', {
          body: '¡Notificación funcionando! Las notificaciones push están activas correctamente.',
          icon: config.BASE_PATH + '/icons/favicon.png',
          badge: config.BASE_PATH + '/icons/favicon.png',
          tag: 'test-notification-' + Date.now(),
          requireInteraction: false,
          silent: false
        });

        // Manejar click
        notification.onclick = function() {
          window.focus();
          window.location.href = config.BASE_PATH + '/tratamientos';
          notification.close();
        };

        toast.success('Notificación de prueba enviada');
        return true;
      }

    } catch {
      toast.error('Error al enviar notificación de prueba');
      return false;
    }
  }, [notificationState.isSupported]);

  return {
    ...notificationState,
    isLoading,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  };
};

// Función auxiliar para convertir VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


