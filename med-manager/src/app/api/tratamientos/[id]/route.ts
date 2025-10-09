import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { registrarAccionCRUD, TipoAccion, TipoEntidad, extraerMetadataRequest } from "@/lib/auditoria";
import { getServerSession } from "@/lib/auth";

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
  }
}

// PUT /api/tratamientos/[id] - Actualizar un tratamiento
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

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

    // Preparar datos para actualización
    const datosUpdate: any = {
      name: body.name,
      medicationId: body.medicationId,
      patient: body.patient,
      dosage: body.dosage,
      isActive: body.isActive,
      endDate: endDate,
    };

    if (body.frequencyHours) {
      datosUpdate.frequencyHours = parseInt(body.frequencyHours);
    }
    if (body.durationDays) {
      datosUpdate.durationDays = parseInt(body.durationDays);
    }
    if (body.startAtSpecificTime !== undefined) {
      datosUpdate.startAtSpecificTime = body.startAtSpecificTime;
    }
    if (body.specificStartTime !== undefined) {
      datosUpdate.specificStartTime = body.specificStartTime
        ? new Date(
            new Date(body.specificStartTime).getTime() -
              new Date(body.specificStartTime).getTimezoneOffset() * 60000
          )
        : null;
    }

    // Actualizar el tratamiento
    const tratamiento = await prisma.treatment.update({
      where: { id: id },
      data: datosUpdate,
    });

    // Registrar actualización de tratamiento
    const metadata = extraerMetadataRequest(request);
    await registrarAccionCRUD(
      session.userId,
      TipoAccion.UPDATE,
      TipoEntidad.TRATAMIENTO,
      id,
      {
        name: tratamientoExistente.name,
        frequencyHours: tratamientoExistente.frequencyHours,
        durationDays: tratamientoExistente.durationDays,
        patient: tratamientoExistente.patient,
        dosage: tratamientoExistente.dosage,
        isActive: tratamientoExistente.isActive,
      },
      {
        name: tratamiento.name,
        frequencyHours: tratamiento.frequencyHours,
        durationDays: tratamiento.durationDays,
        patient: tratamiento.patient,
        dosage: tratamiento.dosage,
        isActive: tratamiento.isActive,
      },
      metadata
    );

    return NextResponse.json(tratamiento);
  } catch (error) {
    console.error("Error al actualizar tratamiento:", error);
    return NextResponse.json(
      { error: "Error al actualizar tratamiento" },
      { status: 500 }
    );
  }
}

// DELETE /api/tratamientos/[id] - Eliminar un tratamiento
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    // Verificar si el tratamiento existe
    const tratamientoExistente = await prisma.treatment.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        patient: true,
        dosage: true,
        frequencyHours: true,
        durationDays: true,
        isActive: true,
      },
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

    // Registrar eliminación de tratamiento
    const metadata = extraerMetadataRequest(request);
    await registrarAccionCRUD(
      session.userId,
      TipoAccion.DELETE,
      TipoEntidad.TRATAMIENTO,
      id,
      tratamientoExistente,
      undefined,
      metadata
    );

    return NextResponse.json({
      message: "Tratamiento eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar tratamiento:", error);
    return NextResponse.json(
      { error: "Error al eliminar tratamiento" },
      { status: 500 }
    );
  }
}
