import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/tratamientos/[id]/images - Obtener imágenes de un tratamiento
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Intentar obtener imágenes usando SQL raw como fallback
    const images = await prisma.$queryRaw`
      SELECT *
      FROM "TreatmentImage"
      WHERE "treatmentId" = ${id}
    ` as any[];

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error al obtener imágenes del tratamiento:", error);
    return NextResponse.json([], { status: 200 }); // Devolver array vacío en caso de error
  }
}
