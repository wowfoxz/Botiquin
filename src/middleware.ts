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
    "/api/medicamentos-grupo",
    "/api/consumidores-grupo",
    "/api/historial",
  ];

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(basePath + path)
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

      // Si existe un expiry, comparar con la hora actual
      if (session.expires) {
        const expiresAt = new Date(session.expires);
        const now = new Date();
        if (expiresAt < now) {
          return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
        }
      }
    } catch (error) {
      console.error("Error al verificar la sesión:", error);
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
    "/api/medicamentos-grupo/:path*",
    "/api/consumidores-grupo/:path*",
    "/api/historial/:path*",
  ],
};
