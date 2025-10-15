import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { registrarAccionCRUD, TipoAccion, TipoEntidad, extraerMetadataRequest } from "@/lib/auditoria";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, userId } = body;

    if (!subscription || !userId) {
      return NextResponse.json(
        { error: "Se requieren subscription y userId" },
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

    // Buscar suscripción existente
    const existingSubscription = await prisma.pushSubscription.findFirst({
      where: {
        userId: userId,
        endpoint: subscription.endpoint
      }
    });

    if (existingSubscription) {
      // Actualizar suscripción existente
      await prisma.pushSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth,
          updatedAt: new Date()
        }
      });

      // Registrar auditoría
      const metadata = extraerMetadataRequest(request);
      await registrarAccionCRUD(
        userId,
        TipoAccion.UPDATE,
        TipoEntidad.NOTIFICACION,
        existingSubscription.id,
        { endpoint: existingSubscription.endpoint },
        { endpoint: subscription.endpoint },
        metadata
      );

      return NextResponse.json({ 
        message: "Suscripción actualizada correctamente",
        id: existingSubscription.id 
      });
    } else {
      // Crear nueva suscripción
      const newSubscription = await prisma.pushSubscription.create({
        data: {
          userId: userId,
          endpoint: subscription.endpoint,
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth
        }
      });

      // Registrar auditoría
      const metadata = extraerMetadataRequest(request);
      await registrarAccionCRUD(
        userId,
        TipoAccion.CREATE,
        TipoEntidad.NOTIFICACION,
        newSubscription.id,
        undefined,
        { endpoint: subscription.endpoint },
        metadata
      );

      return NextResponse.json({ 
        message: "Suscripción creada correctamente",
        id: newSubscription.id 
      });
    }

  } catch (error) {
    console.error("Error al suscribirse a notificaciones push:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


