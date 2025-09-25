import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/tratamientos - Obtener todos los tratamientos
export async function GET() {
  try {
    const tratamientos = await prisma.treatment.findMany({
      include: {
        medication: true,
        user: true,
        notifications: true,
      },
    });

    return NextResponse.json(tratamientos);
  } catch (error) {
    console.error("Error al obtener tratamientos:", error);
    return NextResponse.json(
      { error: "Error al obtener tratamientos" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/tratamientos - Crear un nuevo tratamiento
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar datos requeridos
    if (
      !body.name ||
      !body.medicationId ||
      !body.frequencyHours ||
      !body.durationDays ||
      !body.patient ||
      !body.dosage ||
      !body.userId
    ) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Calcular fecha de finalización
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + body.durationDays * 24 * 60 * 60 * 1000
    );

    // Crear el tratamiento
    const tratamiento = await prisma.treatment.create({
      data: {
        name: body.name,
        medicationId: body.medicationId,
        frequencyHours: parseInt(body.frequencyHours),
        durationDays: parseInt(body.durationDays),
        patient: body.patient,
        startDate: startDate,
        endDate: endDate,
        dosage: body.dosage,
        userId: body.userId,
        isActive: true,
      },
    });

    return NextResponse.json(tratamiento);
  } catch (error) {
    console.error("Error al crear tratamiento:", error);
    return NextResponse.json(
      { error: "Error al crear tratamiento" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
