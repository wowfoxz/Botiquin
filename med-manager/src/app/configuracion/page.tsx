import { updateNotificationSettings } from '@/app/actions';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import Link from 'next/link';

export default async function SettingsPage() {
  const session = await getSession();
  const userId = session?.userId;

  let settings = null;
  if (userId) {
    settings = await prisma.notificationSettings.findUnique({
      where: { userId: userId },
    });
  }

  // Default values if no settings are found
  const daysBeforeExpiration = settings?.daysBeforeExpiration ?? 30;
  const lowStockThreshold = settings?.lowStockThreshold ?? 10;

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Configuración</h1>
            <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary-soft-blue)' }}>
                &larr; Volver al Stock
            </Link>
        </div>

        <form action={updateNotificationSettings} className="shadow-md rounded px-8 pt-6 pb-8 mb-4" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Notificaciones</h2>
            <div className="mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="daysBeforeExpiration">
                    Avisar de vencimiento (días antes)
                </label>
                <input
                    id="daysBeforeExpiration"
                    name="daysBeforeExpiration"
                    type="number"
                    defaultValue={daysBeforeExpiration}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border-primary)'
                    }}
                    required
                />
                <p className="text-xs italic mt-2" style={{ color: 'var(--color-text-secondary)' }}>Recibirás una alerta cuando a un medicamento le queden estos días o menos para vencer.</p>
            </div>
            <div className="mb-6">
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }} htmlFor="lowStockThreshold">
                    Umbral de stock bajo (unidades)
                </label>
                <input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    step="any"
                    defaultValue={lowStockThreshold}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                    style={{
                      backgroundColor: 'var(--color-surface-secondary)',
                      color: 'var(--color-text-primary)',
                      borderColor: 'var(--color-border-primary)'
                    }}
                    required
                />
                <p className="text-xs italic mt-2" style={{ color: 'var(--color-text-secondary)' }}>Recibirás una alerta cuando la cantidad de un medicamento sea igual o inferior a este número.</p>
            </div>
            <div className="flex items-center justify-end">
                <button
                    type="submit"
                    className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    style={{
                      backgroundColor: 'var(--color-primary-soft-blue)',
                      color: 'var(--color-text-inverse)'
                    }}
                >
                    Guardar Cambios
                </button>
            </div>
        </form>
      </div>
    </main>
  );
}
