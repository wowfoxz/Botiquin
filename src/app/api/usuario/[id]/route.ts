import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Obtener el usuario a editar
    const usuario = await prisma.user.findFirst({
      where: {
        id: id,
        grupo: {
          integrantes: {
            some: {
              id: session.userId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        dni: true,
        fechaNacimiento: true,
        rol: true,
        foto: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}
