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
      if (
        !session?.userId ||
        (session.expires && new Date(session.expires) < new Date())
      ) {
        return NextResponse.json({ error: "Sesión expirada" }, { status: 401 });
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
