import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/notificaciones - Obtener todas las notificaciones (opcionalmente filtrar por userId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const notificaciones = await prisma.notification.findMany({
      where: userId ? { treatment: { userId } } : {},
      include: {
        treatment: true,
      },
      orderBy: {
        scheduledDate: "asc",
      },
    });

    return NextResponse.json(notificaciones);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}