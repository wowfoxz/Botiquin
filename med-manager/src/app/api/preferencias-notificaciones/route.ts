import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/preferencias-notificaciones - Obtener preferencias de notificaciones (opcionalmente filtrar por userId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Se requiere userId" },
        { status: 400 }
      );
    }

    let preferencias = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    // Si no existen preferencias, crear unas por defecto
    if (!preferencias) {
      preferencias = await prisma.notificationPreferences.create({
        data: {
          userId,
          push: false,
          sound: false,
          email: false,
          browser: false,
        },
      });
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

 // POST /api/preferencias-notificaciones - Crear o actualizar preferencias de notificaciones
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "Se requiere userId" },
        { status: 400 }
      );
    }

    // Obtener las preferencias existentes si existen
    const existingPreferences = await prisma.notificationPreferences.findUnique({
      where: { userId: body.userId },
    });

    const preferencias = await prisma.notificationPreferences.upsert({
      where: { userId: body.userId },
      update: {
        push: body.push !== undefined ? body.push : existingPreferences?.push ?? false,
        sound: body.sound !== undefined ? body.sound : existingPreferences?.sound ?? false,
        email: body.email !== undefined ? body.email : existingPreferences?.email ?? false,
        browser: body.browser !== undefined ? body.browser : existingPreferences?.browser ?? false,
      },
      create: {
        userId: body.userId,
        push: body.push ?? false,
        sound: body.sound ?? false,
        email: body.email ?? false,
        browser: body.browser ?? false,
      },
    });

    return NextResponse.json(preferencias);
  } catch (error) {
    console.error("Error al actualizar preferencias de notificaciones:", error);
    return NextResponse.json(
      { error: "Error al actualizar preferencias de notificaciones" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}