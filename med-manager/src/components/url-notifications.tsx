'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function UrlNotifications() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lastProcessedUrl = useRef<string>('');

  useEffect(() => {
    const currentUrl = window.location.href;
    
    // Solo procesar si la URL ha cambiado
    if (currentUrl === lastProcessedUrl.current) return;
    
    lastProcessedUrl.current = currentUrl;

    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast.success(decodeURIComponent(success));
      
      // Limpiar la URL después de mostrar el mensaje
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('success');
        router.replace(url.pathname);
        lastProcessedUrl.current = url.pathname; // Actualizar la referencia
      }, 100);
    }
    
    if (error) {
      toast.error(decodeURIComponent(error));
      
      // Limpiar la URL después de mostrar el mensaje
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        router.replace(url.pathname);
        lastProcessedUrl.current = url.pathname; // Actualizar la referencia
      }, 100);
    }
  }, [searchParams, router]);

  return null;
}
