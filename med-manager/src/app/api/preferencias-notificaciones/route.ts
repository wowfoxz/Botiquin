import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/preferencias-notificaciones - Crear/actualizar preferencias de notificaciones
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar datos requeridos
    if (!body.userId) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si ya existen preferencias para este usuario
    const preferenciasExistentes =
      await prisma.notificationPreferences.findUnique({
        where: { userId: body.userId },
      });

    if (preferenciasExistentes) {
      // Actualizar preferencias existentes
      const preferencias = await prisma.notificationPreferences.update({
        where: { userId: body.userId },
        data: {
          push:
            body.push !== undefined ? body.push : preferenciasExistentes.push,
          sound:
            body.sound !== undefined
              ? body.sound
              : preferenciasExistentes.sound,
          email:
            body.email !== undefined
              ? body.email
              : preferenciasExistentes.email,
          browser:
            body.browser !== undefined
              ? body.browser
              : preferenciasExistentes.browser,
        },
      });

      return NextResponse.json(preferencias);
    }

    // Crear nuevas preferencias
    const preferencias = await prisma.notificationPreferences.create({
      data: {
        userId: body.userId,
        push: body.push || false,
        sound: body.sound || false,
        email: body.email || false,
        browser: body.browser || false,
      },
    });

    return NextResponse.json(preferencias);
  } catch (error) {
    console.error(
      "Error al crear/actualizar preferencias de notificaciones:",
      error
    );
    return NextResponse.json(
      { error: "Error al crear/actualizar preferencias de notificaciones" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
