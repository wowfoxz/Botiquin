// Service Worker para notificaciones push
const CACHE_NAME = 'botilyx-v1';

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache abierto');
        // No cachear archivos automáticamente para evitar errores
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error en instalación:', error);
        return self.skipWaiting();
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activación completada');
      return self.clients.claim();
    })
  );
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Recibiendo notificación push');
  
  let notificationData = {
    title: 'Botilyx',
    body: 'Es hora de tomar tu medicamento',
    icon: '/icons/favicon.png',
    badge: '/icons/favicon.png',
    tag: 'medication-reminder',
    requireInteraction: true,
    data: {
      url: '/tratamientos'
    }
  };

  // Si hay datos específicos en el push, usarlos
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Error al parsear datos del push:', error);
    }
  }

  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    notificationData
  );

  event.waitUntil(notificationPromise);
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Click en notificación');
  
  event.notification.close();

  // Abrir la app
  const urlToOpen = event.notification.data?.url || '/tratamientos';
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('Service Worker: Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});