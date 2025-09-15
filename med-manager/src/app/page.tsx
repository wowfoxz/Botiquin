import MedicationList from '@/components/medication-list';
import NotificationPanel from '@/components/notification-panel';
import Search from '@/components/search';
import { getNotifications } from '@/lib/notifications';
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const query = searchParams?.query || '';
  const notifications = await getNotifications();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between gap-2 mb-8">
            <h1 className="text-4xl font-bold">Stock de Medicamentos</h1>
            <div className="flex items-center gap-4">
                <Link href="/medications/archived" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Ver Archivados
                </Link>
                <Link href="/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Configuración
                </Link>
                <Link href="/medications/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Agregar Medicamento
                </Link>
            </div>
        </div>

        <NotificationPanel notifications={notifications} />

        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
            <Search placeholder="Buscar por nombre o droga..." />
        </div>

        <div className="mt-12">
            <MedicationList query={query} />
        </div>
      </div>
    </main>
  );
}
