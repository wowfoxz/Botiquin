import { updateNotificationSettings } from '@/app/actions';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function SettingsPage() {
  // In the future, we'll get the logged-in user's ID.
  const user = await prisma.user.findFirst();

  let settings = null;
  if (user) {
    settings = await prisma.notificationSettings.findUnique({
      where: { userId: user.id },
    });
  }

  // Default values if no settings are found
  const daysBeforeExpiration = settings?.daysBeforeExpiration ?? 30;
  const lowStockThreshold = settings?.lowStockThreshold ?? 10;

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Configuración</h1>
            <Link href="/" className="text-blue-500 hover:underline">
                &larr; Volver al Stock
            </Link>
        </div>

        <form action={updateNotificationSettings} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Notificaciones</h2>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="daysBeforeExpiration">
                    Avisar de vencimiento (días antes)
                </label>
                <input
                    id="daysBeforeExpiration"
                    name="daysBeforeExpiration"
                    type="number"
                    defaultValue={daysBeforeExpiration}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
                <p className="text-gray-600 text-xs italic mt-2">Recibirás una alerta cuando a un medicamento le queden estos días o menos para vencer.</p>
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lowStockThreshold">
                    Umbral de stock bajo (unidades)
                </label>
                <input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    step="any"
                    defaultValue={lowStockThreshold}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                />
                <p className="text-gray-600 text-xs italic mt-2">Recibirás una alerta cuando la cantidad de un medicamento sea igual o inferior a este número.</p>
            </div>
            <div className="flex items-center justify-end">
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Guardar Cambios
                </button>
            </div>
        </form>
      </div>
    </main>
  );
}
