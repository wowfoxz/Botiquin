import { Notification } from '@/lib/notifications';

export default function NotificationPanel({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return null; // Don't render anything if there are no notifications
  }

  return (
    <div className="mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-md">
      <h3 className="text-lg font-bold text-yellow-800">Alertas Importantes</h3>
      <ul className="mt-2 list-disc list-inside">
        {notifications.map((notification) => (
          <li key={notification.id} className="text-yellow-700">
            {notification.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
