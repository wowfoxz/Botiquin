import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/tratamientos/[id] - Obtener un tratamiento por ID
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tratamiento = await prisma.treatment.findUnique({
      where: { id: id },
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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();

    // Verificar si el tratamiento existe
    const tratamientoExistente = await prisma.treatment.findUnique({
      where: { id: id },
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
      // Usar la fecha de inicio existente o la específica si está configurada
      const startDate = new Date(tratamientoExistente.startDate);
      // Ajustar startDate a la zona horaria local
      const adjustedStartDate = new Date(
        startDate.getTime() - startDate.getTimezoneOffset() * 60000
      );
      endDate = new Date(
        adjustedStartDate.getTime() +
          parseInt(body.durationDays) * 24 * 60 * 60 * 1000
      );
      // Ajustar endDate a la zona horaria local
      endDate = new Date(
        endDate.getTime() - endDate.getTimezoneOffset() * 60000
      );
    }

    // Actualizar el tratamiento
    const tratamiento = await prisma.treatment.update({
      where: { id: id },
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
        startAtSpecificTime:
          body.startAtSpecificTime !== undefined
            ? body.startAtSpecificTime
            : undefined,
        specificStartTime:
          body.specificStartTime !== undefined
            ? body.specificStartTime
              ? new Date(
                  new Date(body.specificStartTime).getTime() -
                    new Date(body.specificStartTime).getTimezoneOffset() * 60000
                )
              : null
            : undefined,
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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar si el tratamiento existe
    const tratamientoExistente = await prisma.treatment.findUnique({
      where: { id: id },
    });

    if (!tratamientoExistente) {
      return NextResponse.json(
        { error: "Tratamiento no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar notificaciones asociadas primero
    await prisma.notification.deleteMany({
      where: { treatmentId: id },
    });

    // Eliminar el tratamiento
    await prisma.treatment.delete({
      where: { id: id },
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
