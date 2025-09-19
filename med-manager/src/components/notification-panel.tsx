import { Notification } from '@/lib/notifications';

export default function NotificationPanel({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) {
    return null; // Don't render anything if there are no notifications
  }

  return (
    <div
      className="mb-8 p-4 border-l-4 rounded-md"
      style={{
        backgroundColor: 'var(--advertencia)',
        borderColor: 'var(--color-advertencia)',
        color: 'var(--negro)'
      }}
    >
      <h3 className="text-lg font-bold">Alertas Importantes</h3>
      <ul className="mt-2 list-disc list-inside">
        {notifications.map((notification) => (
          <li key={notification.id}>
            {notification.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
