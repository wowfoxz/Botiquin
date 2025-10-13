import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

    // Obtener todos los consumidores del grupo familiar
    const consumidores: Array<{
      id: string;
      name: string;
      tipo: "usuario" | "perfil";
      rol?: string;
      foto?: string;
    }> = [];

    // Agregar usuarios del grupo
    const usuarios = await prisma.user.findMany({
      where: { grupoId: usuario.grupo.id },
      select: {
        id: true,
        name: true,
        rol: true,
        foto: true,
      },
    });

    usuarios.forEach(usuario => {
      consumidores.push({
        id: usuario.id,
        name: usuario.name || "Sin nombre",
        tipo: "usuario",
        rol: usuario.rol,
        foto: usuario.foto,
      });
    });

    // Agregar perfiles de menores
    const perfilesMenores = await prisma.perfilMenor.findMany({
      where: { grupoId: usuario.grupo.id },
      select: {
        id: true,
        nombre: true,
        foto: true,
      },
    });

    perfilesMenores.forEach(perfil => {
      consumidores.push({
        id: perfil.id,
        name: perfil.nombre,
        tipo: "perfil",
        foto: perfil.foto,
      });
    });

    return NextResponse.json({ consumidores });
  } catch (error) {
    console.error("Error al obtener consumidores del grupo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
