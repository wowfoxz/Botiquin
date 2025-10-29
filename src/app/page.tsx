import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/session';

export default async function Home() {
  // Verificar si el usuario está autenticado
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) {
    redirect('/login');
  }

  // Verificar si la sesión ha expirado
  try {
    const session = await decrypt(sessionCookie);
    // Comparación de fechas ajustando por zona horaria para evitar errores por offsets
    if (!session?.userId || (session.expires && new Date(session.expires) < new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000))) {
      redirect('/login');
    }
  } catch {
    redirect('/login');
  }

  // Redirigir directamente al inicio
  redirect('/inicio');
}
