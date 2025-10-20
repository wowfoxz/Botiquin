import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el usuario con su grupo familiar y todos los integrantes
    const usuario = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        grupo: {
          include: {
            integrantes: {
              select: {
                id: true,
                name: true,
                email: true,
                dni: true,
                rol: true,
                fechaNacimiento: true,
                foto: true,
              },
            },
            perfilesMenores: {
              select: {
                id: true,
                nombre: true,
                dni: true,
                fechaNacimiento: true,
                foto: true,
              },
            },
          },
        },
      },
    });

    if (!usuario?.grupo) {
      return NextResponse.json({ error: "Usuario no pertenece a ningún grupo familiar" }, { status: 404 });
    }

    return NextResponse.json({
      grupo: usuario.grupo,
      usuarioActual: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        dni: usuario.dni,
        rol: usuario.rol,
        fechaNacimiento: usuario.fechaNacimiento,
        foto: usuario.foto,
      },
    });
  } catch (error) {
    console.error("Error al obtener datos del grupo familiar:", error);
    return NextResponse.json(
      { error: "Error al obtener datos del grupo familiar" },
      { status: 500 }
    );
  }
}
