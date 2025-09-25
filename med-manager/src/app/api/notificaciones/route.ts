import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/notificaciones - Obtener todas las notificaciones
export async function GET() {
  try {
    const notificaciones = await prisma.notification.findMany({
      include: {
        treatment: {
          include: {
            medication: true,
          },
        },
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
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/notificaciones - Crear una nueva notificación
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar datos requeridos
    if (!body.treatmentId || !body.scheduledDate || !body.type) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Crear la notificación
    const notificacion = await prisma.notification.create({
      data: {
        treatmentId: body.treatmentId,
        scheduledDate: new Date(body.scheduledDate),
        type: body.type,
        sent: body.sent || false,
      },
    });

    return NextResponse.json(notificacion);
  } catch (error) {
    console.error("Error al crear notificación:", error);
    return NextResponse.json(
      { error: "Error al crear notificación" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
