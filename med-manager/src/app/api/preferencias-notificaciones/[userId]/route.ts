import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/preferencias-notificaciones/[userId] - Obtener preferencias de notificaciones de un usuario
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Await params before using them
    const { userId } = await params;

    const preferencias = await prisma.notificationPreferences.findUnique({
      where: { userId: userId },
    });

    // Si no existen preferencias, crear unas por defecto
    if (!preferencias) {
      // Primero verificar si el usuario existe, si no crearlo
      let usuario = await prisma.user.findUnique({
        where: { id: userId },
      });

      // Si el usuario no existe, crear uno temporal
      if (!usuario) {
        usuario = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@temp.com`,
            name: "Usuario Temporal",
            password: "temp-password", // En una app real, esto estaría hasheado
          },
        });
      }

      const nuevasPreferencias = await prisma.notificationPreferences.create({
        data: {
          userId: userId,
          push: false,
          sound: false,
          email: false,
          browser: false,
        },
      });

      return NextResponse.json(nuevasPreferencias);
    }

    return NextResponse.json(preferencias);
  } catch (error) {
    console.error("Error al obtener preferencias de notificaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener preferencias de notificaciones" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
