import { Notification } from '@/lib/notifications';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bell, AlertTriangle } from 'lucide-react';

export default function NotificationPanel({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return null; // Don't render anything if there are no notifications
  }

  return (
    <Alert variant="destructive" className="mb-6">
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
  );
}
