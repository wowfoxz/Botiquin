import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Verificar conexión a base de datos
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Botilyx',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
