import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import webpush from "web-push";

// Configurar web-push (esto debería ir en variables de entorno)
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.warn("VAPID keys no configuradas. Las notificaciones push no funcionarán.");
}

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:tu-email@ejemplo.com', // Este email debería ser de tu aplicación
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: Request) {
  try {
    // Verificar que es una llamada autorizada (podrías agregar autenticación aquí)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.NOTIFICATION_PROCESSOR_SECRET}`) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Obtener notificaciones pendientes que deben enviarse
    const notificacionesPendientes = await prisma.notification.findMany({
      where: {
        sent: false,
        scheduledDate: {
          lte: now // Fecha programada menor o igual a ahora
        }
      },
      include: {
        treatment: {
          include: {
            user: true,
            medications: {
              include: {
                medication: true
              }
            }
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      },
      take: 50 // Procesar máximo 50 notificaciones por vez
    });


    const resultados: Array<{
      id: string;
      success: boolean;
      message?: string;
      resultados?: any[];
      error?: string;
    }> = [];

    for (const notificacion of notificacionesPendientes) {
      try {
        const resultado = await procesarNotificacion(notificacion);
        resultados.push(resultado);
      } catch (error) {
        console.error(`Error al procesar notificación ${notificacion.id}:`, error);
        resultados.push({
          id: notificacion.id,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }

    return NextResponse.json({
      message: "Procesamiento completado",
      procesadas: notificacionesPendientes.length,
      resultados: resultados
    });

  } catch (error) {
    console.error("Error en el procesador de notificaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

async function procesarNotificacion(notificacion: {
  id: string;
  type: string;
  treatment: any;
}) {
  const { treatment, type } = notificacion;
  const { user, medications } = treatment;

  // Crear mensaje de notificación
  const mensaje = generarMensajeNotificacion(treatment, medications, type);

  // Procesar según el tipo de notificación
  switch (type) {
    case 'push':
      return await enviarNotificacionPush(user.id, mensaje, notificacion.id);
    
    case 'email':
      return await enviarNotificacionEmail(user.email, mensaje, notificacion.id);
    
    case 'browser':
      return await enviarNotificacionNavegador(user.id, mensaje, notificacion.id);
    
    case 'sound':
      return await procesarNotificacionSonora(user.id, mensaje, notificacion.id);
    
    default:
      throw new Error(`Tipo de notificación no soportado: ${type}`);
  }
}

async function enviarNotificacionPush(userId: string, mensaje: {
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
  requireInteraction: boolean;
  data: any;
  actions?: any[];
}, notificacionId: string) {
  try {
    // Obtener suscripciones push del usuario
    const suscripciones = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (suscripciones.length === 0) {
      // Marcar como enviada aunque no haya suscripciones
      await prisma.notification.update({
        where: { id: notificacionId },
        data: { sent: true }
      });
      return {
        id: notificacionId,
        success: true,
        message: "No hay suscripciones push activas"
      };
    }

    const payload = JSON.stringify(mensaje);
    const resultados: Array<{
      suscripcion: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const suscripcion of suscripciones) {
      try {
        await webpush.sendNotification({
          endpoint: suscripcion.endpoint,
          keys: {
            p256dh: suscripcion.p256dhKey,
            auth: suscripcion.authKey
          }
        }, payload);
        
        resultados.push({ suscripcion: suscripcion.id, success: true });
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              console.error(`Error al enviar push a suscripción ${suscripcion.id}:`, error);
              resultados.push({ suscripcion: suscripcion.id, success: false, error: errorMessage });
              
              // Si la suscripción ya no es válida, eliminarla
              if (error && typeof error === 'object' && 'statusCode' in error && (error as any).statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: suscripcion.id }
          });
        }
      }
    }

    // Marcar notificación como enviada si al menos una suscripción fue exitosa
    const exitosa = resultados.some(r => r.success);
    await prisma.notification.update({
      where: { id: notificacionId },
      data: { sent: exitosa }
    });

    return {
      id: notificacionId,
      success: exitosa,
      resultados: resultados
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al enviar notificación push: ${errorMessage}`);
  }
}

async function enviarNotificacionEmail(email: string, mensaje: {
  title: string;
  body: string;
}, notificacionId: string) {
  try {
    // Aquí implementarías el envío de email usando Nodemailer, Resend, etc.
    // Por ahora, simulamos el envío
    
    // TODO: Implementar envío real de email
    // await enviarEmail(email, mensaje.title, mensaje.body);
    
    await prisma.notification.update({
      where: { id: notificacionId },
      data: { sent: true }
    });

    return {
      id: notificacionId,
      success: true,
      message: "Email enviado (simulado)"
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al enviar email: ${errorMessage}`);
  }
}

async function enviarNotificacionNavegador(userId: string, mensaje: {
  title: string;
  body: string;
}, notificacionId: string) {
  try {
    // Las notificaciones del navegador se manejan desde el cliente
    // Aquí solo marcamos como enviada y registramos el evento
    
    await prisma.notification.update({
      where: { id: notificacionId },
      data: { sent: true }
    });

    return {
      id: notificacionId,
      success: true,
      message: "Notificación de navegador programada"
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al procesar notificación de navegador: ${errorMessage}`);
  }
}

async function procesarNotificacionSonora(userId: string, mensaje: {
  title: string;
  body: string;
}, notificacionId: string) {
  try {
    // Las notificaciones sonoras se manejan desde el cliente
    // Aquí solo marcamos como enviada y registramos el evento
    
    await prisma.notification.update({
      where: { id: notificacionId },
      data: { sent: true }
    });

    return {
      id: notificacionId,
      success: true,
      message: "Notificación sonora programada"
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al procesar notificación sonora: ${errorMessage}`);
  }
}

function generarMensajeNotificacion(treatment: {
  id: string;
}, medications: Array<{
  medication: {
    commercialName?: string;
  };
  dosage?: string;
}>, type: string) {
  const medicamento = medications[0]?.medication;
  const nombreMedicamento = medicamento?.commercialName || 'Medicamento';
  const dosis = medications[0]?.dosage || '1 dosis';

  const mensaje = {
    title: 'Botilyx - Recordatorio',
    body: `Es hora de tomar ${dosis} de ${nombreMedicamento}`,
    icon: '/icons/favicon.png',
    badge: '/icons/favicon.png',
    tag: `medication-${treatment.id}`,
    requireInteraction: true,
    data: {
      treatmentId: treatment.id,
      type: type,
      url: '/tratamientos'
    },
    actions: [
      {
        action: 'take-medication',
        title: 'Marcar como tomado',
        icon: '/icons/favicon.png'
      },
      {
        action: 'snooze',
        title: 'Posponer 10 min',
        icon: '/icons/favicon.png'
      }
    ]
  };

  // Personalizar según el tipo
  switch (type) {
    case 'push':
      mensaje.title = '💊 Botilyx';
      break;
    case 'email':
      mensaje.title = `Recordatorio de medicamento - ${nombreMedicamento}`;
      break;
    case 'browser':
      mensaje.title = 'Recordatorio de medicamento';
      break;
    case 'sound':
      mensaje.title = '¡Es hora de tu medicamento!';
      break;
  }

  return mensaje;
}


