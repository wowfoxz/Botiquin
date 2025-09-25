import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/tratamientos/[id] - Obtener un tratamiento por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tratamiento = await prisma.treatment.findUnique({
      where: { id: params.id },
      include: {
        medication: true,
        user: true,
        notifications: true,
      },
    });

    if (!tratamiento) {
      return NextResponse.json(
        { error: "Tratamiento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(tratamiento);
  } catch (error) {
    console.error("Error al obtener tratamiento:", error);
    return NextResponse.json(
      { error: "Error al obtener tratamiento" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/tratamientos/[id] - Actualizar un tratamiento
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Verificar si el tratamiento existe
    const tratamientoExistente = await prisma.treatment.findUnique({
      where: { id: params.id },
    });

    if (!tratamientoExistente) {
      return NextResponse.json(
        { error: "Tratamiento no encontrado" },
        { status: 404 }
      );
    }

    // Calcular nueva fecha de finalización si cambia la duración
    let endDate = tratamientoExistente.endDate;
    if (
      body.durationDays &&
      parseInt(body.durationDays) !== tratamientoExistente.durationDays
    ) {
      const startDate = new Date(tratamientoExistente.startDate);
      endDate = new Date(
        startDate.getTime() + parseInt(body.durationDays) * 24 * 60 * 60 * 1000
      );
    }

    // Actualizar el tratamiento
    const tratamiento = await prisma.treatment.update({
      where: { id: params.id },
      data: {
        name: body.name,
        medicationId: body.medicationId,
        frequencyHours: body.frequencyHours
          ? parseInt(body.frequencyHours)
          : undefined,
        durationDays: body.durationDays
          ? parseInt(body.durationDays)
          : undefined,
        patient: body.patient,
        dosage: body.dosage,
        isActive: body.isActive,
        endDate: endDate,
      },
    });

    return NextResponse.json(tratamiento);
  } catch (error) {
    console.error("Error al actualizar tratamiento:", error);
    return NextResponse.json(
      { error: "Error al actualizar tratamiento" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/tratamientos/[id] - Eliminar un tratamiento
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el tratamiento existe
    const tratamientoExistente = await prisma.treatment.findUnique({
      where: { id: params.id },
    });

    if (!tratamientoExistente) {
      return NextResponse.json(
        { error: "Tratamiento no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar notificaciones asociadas primero
    await prisma.notification.deleteMany({
      where: { treatmentId: params.id },
    });

    // Eliminar el tratamiento
    await prisma.treatment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Tratamiento eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar tratamiento:", error);
    return NextResponse.json(
      { error: "Error al eliminar tratamiento" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
