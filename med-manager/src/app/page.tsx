import { logoutUser } from '@/app/actions';
import MedicationList from '@/components/medication-list';
import NotificationPanel from '@/components/notification-panel';
import Search from '@/components/search';
import { getNotifications } from '@/lib/notifications';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/session';

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || '';

  // Verificar si el usuario está autenticado
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) {
    redirect('/login');
  }

  // Verificar si la sesión ha expirado
  try {
    const session = await decrypt(sessionCookie);
    if (!session?.userId || (session.expires && new Date(session.expires) < new Date())) {
      redirect('/login');
    }
  } catch {
    redirect('/login');
  }

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
                <form action={logoutUser}>
                    <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-900">
                        Cerrar Sesión
                    </button>
                </form>
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
