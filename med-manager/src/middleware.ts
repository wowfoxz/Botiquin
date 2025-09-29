import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  // Rutas que requieren autenticación
  const protectedPaths = [
    "/api/tratamientos",
    "/api/medicinas",
    "/api/notificaciones",
    "/api/preferencias-notificaciones",
  ];

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
      const session = await decrypt(sessionCookie);

      // Verificar userId
      if (!session?.userId) {
        return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
      }

      // Si existe un expiry, comparar ajustando la hora actual según el offset de zona horaria
      if (session.expires) {
        const expiresAt = new Date(session.expires);
        // Ajustar la hora actual para tener en cuenta la zona horaria local
        const nowAdjusted = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
        if (expiresAt < nowAdjusted) {
          return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
        }
      }
    } catch {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/tratamientos/:path*",
    "/api/medicinas/:path*",
    "/api/notificaciones/:path*",
    "/api/preferencias-notificaciones/:path*",
  ],
};
