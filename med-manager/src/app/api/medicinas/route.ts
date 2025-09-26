import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/medicinas - Obtener todas las medicinas (opcionalmente filtrar por userId)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const medicinas = await prisma.medication.findMany({
      where: userId ? { userId } : {},
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(medicinas);
  } catch (error) {
    console.error("Error al obtener medicinas:", error);
    return NextResponse.json(
      { error: "Error al obtener medicinas" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}