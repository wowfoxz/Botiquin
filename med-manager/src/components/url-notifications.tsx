'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function UrlNotifications() {
  const searchParams = useSearchParams();
  const hasShownNotification = useRef(false);

  useEffect(() => {
    // Solo mostrar notificaciones una vez por carga de página
    if (hasShownNotification.current) return;

    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast.success(decodeURIComponent(success));
      hasShownNotification.current = true;
    }
    if (error) {
      toast.error(decodeURIComponent(error));
      hasShownNotification.current = true;
    }
  }, [searchParams]);

  return null;
}
