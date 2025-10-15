import { NextResponse } from "next/server";
import { deleteSession, getSession } from "@/lib/session";
import { registrarAccionAuth, TipoAccion } from "@/lib/auditoria";

export async function POST() {
  try {
    // Obtener el usuario antes de eliminar la sesión
    const session = await getSession();
    const userId = session?.userId;
    
    await deleteSession();
    
    // Registrar logout si había una sesión activa
    if (userId) {
      await registrarAccionAuth(userId, TipoAccion.LOGOUT);
    }
    
    // Crear respuesta con cookie limpiada
    const response = NextResponse.json({ message: "Sesión cerrada correctamente" });
    
    // Asegurar que la cookie se elimine del cliente
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
      sameSite: "lax",
    });
    
    return response;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
