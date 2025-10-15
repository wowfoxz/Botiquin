import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { registrarAccionCRUD, TipoAccion, TipoEntidad, extraerMetadataRequest } from "@/lib/auditoria";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, endpoint } = body;

    if (!userId || !endpoint) {
      return NextResponse.json(
        { error: "Se requieren userId y endpoint" },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Buscar y eliminar la suscripción
    const subscription = await prisma.pushSubscription.findFirst({
      where: {
        userId: userId,
        endpoint: endpoint
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Suscripción no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la suscripción
    await prisma.pushSubscription.delete({
      where: { id: subscription.id }
    });

    // Registrar auditoría
    const metadata = extraerMetadataRequest(request);
    await registrarAccionCRUD(
      userId,
      TipoAccion.DELETE,
      TipoEntidad.NOTIFICACION,
      subscription.id,
      { endpoint: subscription.endpoint },
      undefined,
      metadata
    );

    return NextResponse.json({ 
      message: "Suscripción eliminada correctamente"
    });

  } catch (error) {
    console.error("Error al desuscribirse de notificaciones push:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}