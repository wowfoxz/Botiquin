"use client";

import { useState } from 'react';
import { Notification } from '@/lib/notifications';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function NotificationPanel({ notifications }: { notifications: Notification[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (notifications.length === 0) {
    return null; // Don't render anything if there are no notifications
  }

  return (
    <>
      {/* Botón flotante de campana */}
      <div className="fixed top-20 right-4 md:right-8 z-40">
        <Button
          variant={isOpen ? "default" : "outline"}
          size="icon"
          className="relative h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar alertas" : "Ver alertas importantes"}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <>
              <Bell className="h-5 w-5" />
              {!isOpen && notifications.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 rounded-full text-xs font-bold"
                >
                  {notifications.length}
                </Badge>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Panel de alertas (se muestra cuando isOpen = true) */}
      {isOpen && (
        <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Importantes
          </AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  {notification.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
