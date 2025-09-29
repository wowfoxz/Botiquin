import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/tratamientos - Obtener todos los tratamientos (opcionalmente filtrar por userId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const tratamientos = await prisma.treatment.findMany({
      where: userId ? { userId } : {},
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

    // Verificar que el usuario exista
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la medicina pertenezca al usuario
    const medication = await prisma.medication.findUnique({
      where: { id: body.medicationId },
    });

    if (!medication || medication.userId !== body.userId) {
      return NextResponse.json(
        { error: "Medicamento no válido" },
        { status: 400 }
      );
    }

    // Determinar fecha de inicio y corregir por zona horaria
    let startDate = new Date();
    // Ajustar startDate a la zona horaria local (normalizar quitando el offset)
    startDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);

    // Si se proporcionó una hora específica, parsearla y ajustarla también
    let specificStartDate: Date | null = null;
    if (body.startAtSpecificTime && body.specificStartTime) {
      // Normalizar usando el offset de la fecha proporcionada para manejar correctamente zonas horarias
      specificStartDate = new Date(
        new Date(body.specificStartTime).getTime() -
          new Date(body.specificStartTime).getTimezoneOffset() * 60000
      );
      startDate = specificStartDate;
    }

    // Calcular fecha de finalización (manejo de zonas horarias)
    // Creamos una copia de startDate y sumamos días usando UTC para evitar efectos de offset/DST
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + parseInt(body.durationDays));

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
        startAtSpecificTime: body.startAtSpecificTime || false,
        specificStartTime: body.specificStartTime
          ? new Date(
              new Date(body.specificStartTime).getTime() -
                new Date(body.specificStartTime).getTimezoneOffset() * 60000
            )
          : null,
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