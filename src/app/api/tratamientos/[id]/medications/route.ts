import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/tratamientos/[id]/medications - Obtener medicamentos de un tratamiento
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Intentar obtener medicamentos usando SQL raw como fallback
    const medications = await prisma.$queryRaw`
      SELECT tm.*, 
             m."commercialName", 
             m."activeIngredient",
             m.unit,
             m.description,
             m."intakeRecommendations"
      FROM "TreatmentMedication" tm
      LEFT JOIN "Medication" m ON tm."medicationId" = m.id
      WHERE tm."treatmentId" = ${id}
    ` as unknown[]; // Prisma $queryRaw returns unknown[]

    return NextResponse.json(medications);
  } catch (error) {
    console.error("Error al obtener medicamentos del tratamiento:", error);
    return NextResponse.json([], { status: 200 }); // Devolver array vacío en caso de error
  }
}
