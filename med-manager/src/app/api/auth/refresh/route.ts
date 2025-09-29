import { NextRequest } from "next/server";
import { getSession, createSession } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if session is expired (timezone-aware)
    const nowTimezoneAware = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
    if (session.expires && new Date(session.expires) < nowTimezoneAware) {
      return new Response(JSON.stringify({ error: "Sesión expirada" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Refresh the session by creating a new one
    await createSession(session.userId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al refrescar la sesión:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
