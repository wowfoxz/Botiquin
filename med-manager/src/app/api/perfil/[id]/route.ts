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

    // Obtener el perfil a editar
    const perfil = await prisma.perfilMenor.findFirst({
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
        nombre: true,
        dni: true,
        fechaNacimiento: true,
        foto: true,
      },
    });

    if (!perfil) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    return NextResponse.json(perfil);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json(
      { error: "Error al obtener perfil" },
      { status: 500 }
    );
  }
}
