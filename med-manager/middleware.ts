import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { decrypt } from "@/lib/crypto";
import { cookies } from "next/headers";

// Este middleware se ejecuta para casi todas las peticiones.
export async function middleware(request: NextRequest) {
  const sessionCookie = (await cookies()).get("session")?.value;
  let session = null;

  if (sessionCookie) {
    try {
      session = await decrypt(sessionCookie);
    } catch {
      session = null;
    }
  }

  const { pathname } = request.nextUrl;

  // Obtener el basePath desde las variables de entorno
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  // Ajustar el pathname para considerar el basePath
  const adjustedPathname = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length) || "/"
    : pathname;

  // Definir las rutas públicas que no requieren autenticación
  const publicPaths = ["/login", "/register", "/api/health"];
  const isPublicPath = publicPaths.includes(adjustedPathname);

  // Permitir el acceso a archivos estáticos sin autenticación
  if (
    adjustedPathname.startsWith("/_next/static") ||
    adjustedPathname.startsWith("/_next/image") ||
    adjustedPathname.startsWith("/favicon.ico") ||
    /\.(ico|png|jpg|jpeg|svg|gif|webp|css|js)$/.test(adjustedPathname)
  ) {
    return NextResponse.next();
  }

  // Si el usuario está logueado y intenta acceder a /login o /register,
  // lo redirigimos a la página principal.
  if (isPublicPath && session?.userId) {
    return NextResponse.redirect(new URL(basePath + "/", request.url));
  }

  // Si el usuario no está logueado o la sesión ha expirado y trata de acceder a una ruta protegida,
  // lo redirigimos a la página de inicio de sesión.
  if (
    !isPublicPath &&
    (!session?.userId ||
      (session.expires && new Date(session.expires) < new Date()))
  ) {
    // Para solicitudes API, devolvemos un error 401 en lugar de redirigir
    if (adjustedPathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return NextResponse.redirect(new URL(basePath + "/login", request.url));
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
