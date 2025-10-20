import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el usuario con su grupo
    const usuario = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { grupo: true },
    });

    if (!usuario?.grupo) {
      return NextResponse.json({ error: "Usuario no pertenece a ningún grupo" }, { status: 400 });
    }

    // Obtener todos los medicamentos del grupo familiar
    const medicamentos = await prisma.medication.findMany({
      where: {
        user: {
          grupoId: usuario.grupo.id,
        },
        archived: false, // Solo medicamentos activos
      },
      select: {
        id: true,
        commercialName: true,
        activeIngredient: true,
      },
      orderBy: {
        commercialName: "asc",
      },
    });

    return NextResponse.json({ medicamentos });
  } catch (error) {
    console.error("Error al obtener medicamentos del grupo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
