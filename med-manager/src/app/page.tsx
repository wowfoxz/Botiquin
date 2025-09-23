import { logoutUser } from '@/app/actions';
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

  return (
    <main className="flex min-h-screen flex-col items-center p-24" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between gap-2 mb-8">
          <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Dashboard</h1>
          <div className="flex items-center gap-4">
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Bienvenido</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>Este es tu panel de control personal.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
