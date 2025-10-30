import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { Home } from 'lucide-react';
import { SplashOverlay } from '@/components/ui/SplashOverlay';

export default async function InicioPage() {
  // Verificar autenticación
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) {
    redirect('/login');
  }

  const session = await decrypt(sessionCookie);
  if (!session?.userId) {
    redirect('/login');
  }

  return (
    <>
      <SplashOverlay />
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-primary/10">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Inicio
            </h1>
            <p className="text-muted-foreground">
              Bienvenido a Botilyx
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Este módulo estará vacío por ahora */}
          <div className="col-span-full text-center py-12">
            <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Módulo en Construcción
            </h2>
            <p className="text-muted-foreground">
              Próximamente habrá contenido aquí
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

