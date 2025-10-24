import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { registrarAccionCRUD, TipoAccion, TipoEntidad, extraerMetadataRequest } from "@/lib/auditoria";

// GET /api/tratamientos - Obtener todos los tratamientos (opcionalmente filtrar por userId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const tratamientos = await prisma.treatment.findMany({
      where: userId ? { userId } : {},
      include: {
        user: true,
        notifications: true,
      },
    });

    // Obtener medicamentos e imágenes para cada tratamiento usando SQL raw
    const tratamientosCompletos = await Promise.all(
      tratamientos.map(async (tratamiento) => {
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
            WHERE tm.treatmentId = ${tratamiento.id}
          ` as any[];

          // Obtener imágenes
          const images = await prisma.$queryRaw`
            SELECT *
            FROM TreatmentImage
            WHERE treatmentId = ${tratamiento.id}
          ` as any[];

          return {
            ...tratamiento,
            medications: medications || [],
            images: images || [],
          };
        } catch (error) {
          console.error(`Error al obtener datos para tratamiento ${tratamiento.id}:`, error);
          return {
            ...tratamiento,
            medications: [],
            images: [],
          };
        }
      })
    );

    return NextResponse.json(tratamientosCompletos);
  } catch (error) {
    console.error("Error al obtener tratamientos:", error);
    return NextResponse.json(
      { error: "Error al obtener tratamientos" },
      { status: 500 }
    );
  }
}

// POST /api/tratamientos - Crear un nuevo tratamiento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos requeridos
    if (
      !body.name ||
      !body.patient ||
      !body.medications ||
      !Array.isArray(body.medications) ||
      body.medications.length === 0 ||
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

    // Validar medicamentos
    for (const medication of body.medications) {
      if (!medication.medicationId || !medication.dosage || !medication.frequencyHours || !medication.durationDays) {
        return NextResponse.json(
          { error: "Datos de medicamento incompletos" },
          { status: 400 }
        );
      }

      // Verificar que la medicina exista
      const med = await prisma.medication.findUnique({
        where: { id: medication.medicationId },
      });

      if (!med) {
        return NextResponse.json(
          { error: `Medicamento no encontrado: ${medication.medicationId}` },
          { status: 400 }
        );
      }
    }

    // Calcular fechas de inicio y fin del tratamiento general
    const now = new Date();
    const earliestStart = now;
    let latestEnd = now;

    // Crear el tratamiento principal
    const tratamiento = await prisma.treatment.create({
      data: {
        name: body.name,
        patient: body.patient,
        patientId: body.patientId || null,
        patientType: body.patientType || null,
        symptoms: body.symptoms || null,
        startDate: earliestStart,
        endDate: latestEnd, // Se actualizará después
        userId: body.userId,
        isActive: true,
      },
    });

    // Crear medicamentos del tratamiento
    const treatmentMedications: any[] = [];
    for (const medicationData of body.medications) {
      // Determinar fecha de inicio para este medicamento
      let medicationStartDate = now;
      if (medicationData.startOption === "specific" && medicationData.specificDate) {
        medicationStartDate = new Date(medicationData.specificDate);
      }

      // Calcular fecha de finalización para este medicamento
      const medicationEndDate = new Date(medicationStartDate);
      medicationEndDate.setUTCDate(medicationEndDate.getUTCDate() + parseInt(medicationData.durationDays));

      // Actualizar fecha de finalización del tratamiento si es necesario
      if (medicationEndDate > latestEnd) {
        latestEnd = medicationEndDate;
      }

      const treatmentMedication = await prisma.treatmentMedication.create({
        data: {
          treatmentId: tratamiento.id,
          medicationId: medicationData.medicationId,
          frequencyHours: parseInt(medicationData.frequencyHours),
          durationDays: parseInt(medicationData.durationDays),
          dosage: medicationData.dosage,
          startDate: medicationStartDate,
          endDate: medicationEndDate,
          startAtSpecificTime: medicationData.startOption === "specific",
          specificStartTime: medicationData.startOption === "specific" && medicationData.specificDate
            ? new Date(medicationData.specificDate)
            : null,
          isActive: true,
        },
      });

      treatmentMedications.push(treatmentMedication);
    }

    // Actualizar fecha de finalización del tratamiento
    await prisma.treatment.update({
      where: { id: tratamiento.id },
      data: { endDate: latestEnd },
    });

    // Procesar imágenes si las hay
    if (body.images && Array.isArray(body.images)) {
      for (const imageData of body.images) {
        // Aquí se procesarían las imágenes y se almacenarían
        // Por ahora solo creamos el registro básico
        await prisma.treatmentImage.create({
          data: {
            treatmentId: tratamiento.id,
            imageUrl: imageData.imageUrl || "",
            imageType: imageData.imageType,
            extractedText: imageData.extractedText || null,
            aiAnalysis: imageData.aiAnalysis || null,
          },
        });
      }
    }

    // Registrar creación de tratamiento
    const metadata = extraerMetadataRequest(request);
    await registrarAccionCRUD(
      body.userId,
      TipoAccion.CREATE,
      TipoEntidad.TRATAMIENTO,
      tratamiento.id,
      undefined,
      {
        name: body.name,
        patient: body.patient,
        medicationsCount: body.medications.length,
        imagesCount: body.images?.length || 0,
        isActive: true,
      },
      metadata
    );

    // Obtener el tratamiento completo con relaciones
    const completeTreatment = await prisma.treatment.findUnique({
      where: { id: tratamiento.id },
      include: {
        medications: {
          include: {
            medication: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json(completeTreatment);
  } catch (error) {
    console.error("Error al crear tratamiento:", error);
    return NextResponse.json(
      { error: "Error al crear tratamiento" },
      { status: 500 }
    );
  }
}