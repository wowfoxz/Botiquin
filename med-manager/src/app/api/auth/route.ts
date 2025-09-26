import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "No hay sesión activa" },
        { status: 401 }
      );
    }

    // En una aplicación real, aquí harías una llamada a la base de datos para obtener los datos del usuario
    // Por ahora, simulamos un usuario básico
    const user = {
      id: session.userId,
      email: "usuario@ejemplo.com",
      name: "Usuario Ejemplo",
    };

    return NextResponse.json({ user, session });
  } catch (error) {
    console.error("Error al obtener la sesión:", error);
    return NextResponse.json(
      { error: "Error al obtener la sesión" },
      { status: 500 }
    );
  }
}
