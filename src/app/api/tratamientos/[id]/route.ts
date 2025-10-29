import { NextRequest, NextResponse } from "next/server";
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

    // Obtener medicamentos e imágenes usando SQL raw
    try {
      // Obtener medicamentos
      const medications = await prisma.$queryRaw`
        SELECT tm.*, 
               m.commercialName, 
               m.activeIngredient,
               m.unit,
               m.description,
               m.intakeRecommendations
        FROM TreatmentMedication tm
        LEFT JOIN Medication m ON tm.medicationId = m.id
        WHERE tm.treatmentId = ${id}
      ` as unknown[]; // Prisma $queryRaw returns unknown[]

      // Obtener imágenes
      const images = await prisma.$queryRaw`
        SELECT *
        FROM TreatmentImage
        WHERE treatmentId = ${id}
      ` as unknown[]; // Prisma $queryRaw returns unknown[]

      const tratamientoCompleto = {
        ...tratamiento,
        medications: medications || [],
        images: images || [],
      };

      return NextResponse.json(tratamientoCompleto);
    } catch (error) {
      console.error(`Error al obtener datos para tratamiento ${id}:`, error);
      const tratamientoCompleto = {
        ...tratamiento,
        medications: [],
        images: [],
      };
      return NextResponse.json(tratamientoCompleto);
    }
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
  request: NextRequest,
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
    // const endDate = tratamientoExistente.endDate;
    // if (body.durationDays) {
    //   // Usar la fecha de inicio existente o la específica si está configurada
    //   const startDate = new Date(tratamientoExistente.startDate);
    //   // Ajustar startDate a la zona horaria local
    //   const adjustedStartDate = new Date(
    //     startDate.getTime() - startDate.getTimezoneOffset() * 60000
    //   );
    //   // endDate calculado pero no usado en la actualización
    //   const endDate = new Date(
    //     adjustedStartDate.getTime() +
    //       parseInt(body.durationDays) * 24 * 60 * 60 * 1000
    //   );
    // }

    // Preparar datos para actualización con la nueva estructura
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const datosUpdate: any = { // Prisma TreatmentUpdateInput type
      name: body.name,
      patient: body.patient,
      patientId: body.patientId,
      patientType: body.patientType,
      symptoms: body.symptoms,
      isActive: body.isActive !== undefined ? body.isActive : undefined,
    };

    // Actualizar el tratamiento
    const tratamiento = await prisma.treatment.update({
      where: { id: id },
      data: datosUpdate,
    });

    // TODO: Implementar actualización de medicamentos e imágenes
    // Por ahora solo actualizamos los campos básicos del tratamiento

    // Registrar actualización de tratamiento
    const metadata = extraerMetadataRequest(request);
    await registrarAccionCRUD(
      session.userId,
      TipoAccion.UPDATE,
      TipoEntidad.TRATAMIENTO,
      id,
      {
        name: tratamientoExistente.name,
        patient: tratamientoExistente.patient,
        isActive: tratamientoExistente.isActive,
      },
      {
        name: tratamiento.name,
        patient: tratamiento.patient,
        isActive: tratamiento.isActive,
        medicationsCount: body.medications?.length || 0,
        imagesCount: body.images?.length || 0,
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
  request: NextRequest,
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
        isActive: true,
        startDate: true,
        endDate: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tratamientoExistente) {
      return NextResponse.json(
        { error: "Tratamiento no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar relaciones asociadas en orden (resuelve foreign key constraints)
    // 1. Eliminar notificaciones
    await prisma.notification.deleteMany({
      where: { treatmentId: id },
    });

    // 2. Eliminar medicamentos del tratamiento
    await prisma.treatmentMedication.deleteMany({
      where: { treatmentId: id },
    });

    // 3. Eliminar imágenes del tratamiento
    await prisma.treatmentImage.deleteMany({
      where: { treatmentId: id },
    });

    // 4. Eliminar el tratamiento
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
