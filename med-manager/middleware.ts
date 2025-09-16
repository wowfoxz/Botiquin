import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

// Este middleware se ejecuta para casi todas las peticiones.
export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // Definir las rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/register'];

  const isPublicPath = publicPaths.includes(pathname);

  // Si el usuario está logueado y intenta acceder a /login o /register,
  // lo redirigimos a la página principal.
  if (isPublicPath && session?.userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si el usuario no está logueado y trata de acceder a una ruta protegida,
  // lo redirigimos a la página de inicio de sesión.
  if (!isPublicPath && !session?.userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si no se cumple ninguna de las condiciones anteriores, permitimos que la petición continúe.
  return NextResponse.next();
}

// Configuración para que el middleware se aplique a las rutas correctas.
export const config = {
  matcher: [
    /*
     * Emparejar todas las rutas de petición excepto las que empiezan por:
     * - api (rutas de API)
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imagen)
     * - favicon.ico (archivo de favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
