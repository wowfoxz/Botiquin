import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/medicinas - Obtener todas las medicinas
export async function GET() {
  try {
    const medicinas = await prisma.medication.findMany();

    return NextResponse.json(medicinas);
  } catch (error) {
    console.error("Error al obtener medicinas:", error);
    return NextResponse.json(
      { error: "Error al obtener medicinas" },
      { status: 500 }
    );
  }
}
