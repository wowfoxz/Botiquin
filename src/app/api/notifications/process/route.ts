import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import webpush from 'web-push';

// Configurar VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BO63iDbR-YNn2So-X3dvBuFMRTLn0RMeWLz1BEfd-LhqgNBIra7rKqY9RuYdeNtZWOZs5SOWm12KXMewuw-hM9k';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'oKM3Kkf-JsBTlQI1_tGY02Cj03FvAdnfIQAHTFPaVBE';

webpush.setVapidDetails(
  'mailto:admin@botilyx.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function POST() {
  try {
    const now = new Date();
    console.log(`🔔 [${now.toISOString()}] Procesando notificaciones automáticas...`);

    // 1️⃣ Detectar medicamentos vencidos o por vencer
    await processMedicationExpirations();

    // 2️⃣ Detectar medicamentos con stock bajo
    await processLowStock();

    // 3️⃣ Procesar recordatorios de tratamientos
    await processTreatmentReminders();

    return NextResponse.json({ 
      success: true, 
      message: 'Notificaciones procesadas exitosamente',
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('❌ Error procesando notificaciones:', error);
    return NextResponse.json(
      { error: 'Error procesando notificaciones' },
      { status: 500 }
    );
  }
}

// 1️⃣ Detectar medicamentos vencidos o por vencer
async function processMedicationExpirations() {
  try {
    // Obtener todos los usuarios con sus configuraciones
    const users = await prisma.user.findMany({
      include: {
        notificationSettings: true,
        pushSubscriptions: true,
        medications: {
          where: {
            archived: false
          }
        }
      }
    });

    for (const user of users) {
      if (!user.notificationSettings) continue;

      const daysBeforeExpiration = user.notificationSettings.daysBeforeExpiration;
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysBeforeExpiration);

      // Medicamentos que vencen pronto o ya vencieron
      const expiringMedications = user.medications.filter(med => {
        const expirationDate = new Date(med.expirationDate);
        return expirationDate <= thresholdDate;
      });

      for (const medication of expiringMedications) {
        const expirationDate = new Date(medication.expirationDate);
        const isExpired = expirationDate < new Date();
        
        const message = isExpired
          ? `⚠️ El medicamento "${medication.commercialName}" ya venció el ${expirationDate.toLocaleDateString('es-AR')}`
          : `⏰ El medicamento "${medication.commercialName}" vence en ${Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días`;

        // Enviar notificación push
        await sendPushNotification(user, message);
      }
    }
  } catch (error) {
    console.error('Error procesando vencimientos:', error);
  }
}

// 2️⃣ Detectar medicamentos con stock bajo
async function processLowStock() {
  try {
    const users = await prisma.user.findMany({
      include: {
        notificationSettings: true,
        pushSubscriptions: true,
        medications: {
          where: {
            archived: false
          }
        }
      }
    });

    for (const user of users) {
      if (!user.notificationSettings) continue;

      const lowStockThreshold = user.notificationSettings.lowStockThreshold;

      // Medicamentos con stock bajo
      const lowStockMedications = user.medications.filter(med =>
        med.currentQuantity <= lowStockThreshold && med.currentQuantity > 0
      );

      for (const medication of lowStockMedications) {
        const message = `📦 Stock bajo: "${medication.commercialName}" - Quedan ${medication.currentQuantity} ${medication.unit}`;
        
        // Enviar notificación push
        await sendPushNotification(user, message);
      }
    }
  } catch (error) {
    console.error('Error procesando stock bajo:', error);
  }
}

// 3️⃣ Procesar recordatorios de tratamientos
async function processTreatmentReminders() {
  try {
    const now = new Date();

    // Obtener tratamientos activos
    const activeTreatments = await prisma.treatment.findMany({
      where: {
        isActive: true,
        endDate: {
          gte: now
        }
      },
      include: {
        user: {
          include: {
            pushSubscriptions: true
          }
        },
        medications: {
          include: {
            medication: true
          }
        }
      }
    });

    for (const treatment of activeTreatments) {
      for (const treatmentMed of treatment.medications) {
        if (!treatmentMed.isActive) continue;

        // Calcular siguiente toma
        const nextDose = calculateNextDose(treatmentMed, now);
        
        if (nextDose && isTimeForReminder(nextDose, now)) {
          // Verificar si ya se tomó
          const wasTaken = await checkIfDoseTaken(treatment, treatmentMed, nextDose);
          
          if (!wasTaken) {
            const patientName = treatment.patient || 'el paciente';
            const message = `💊 Recordatorio: Es hora de que ${patientName} tome ${treatmentMed.dosage} de ${treatmentMed.medication.commercialName}`;
            
            // Enviar notificación
            await sendPushNotification(treatment.user, message);
            
            // Registrar que se envió la notificación
            await prisma.notification.create({
              data: {
                type: 'recordatorio',
                treatmentId: treatment.id,
                scheduledDate: nextDose,
                sent: true
              }
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error procesando recordatorios:', error);
  }
}

// Calcular próxima dosis
function calculateNextDose(treatmentMed: any, now: Date): Date | null {
  const frequencyHours = treatmentMed.frequencyHours;
  const startDate = treatmentMed.specificStartTime 
    ? new Date(treatmentMed.specificStartTime)
    : new Date(treatmentMed.createdAt);

  // Calcular cuántas horas han pasado desde el inicio
  const hoursSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  
  // Calcular el número de dosis que ya deberían haberse tomado
  const dosesCompleted = Math.floor(hoursSinceStart / frequencyHours);
  
  // Calcular la siguiente dosis
  const nextDose = new Date(startDate.getTime() + (dosesCompleted + 1) * frequencyHours * 60 * 60 * 1000);
  
  // Verificar que esté dentro del período activo
  const endDate = new Date(treatmentMed.endDate);
  if (nextDose > endDate) {
    return null;
  }
  
  return nextDose;
}

// Verificar si es hora de enviar recordatorio (dentro de los próximos 5 minutos)
function isTimeForReminder(nextDose: Date, now: Date): boolean {
  const minutesUntilDose = (nextDose.getTime() - now.getTime()) / (1000 * 60);
  return minutesUntilDose >= 0 && minutesUntilDose <= 5;
}

// Verificar si ya se tomó la dosis
async function checkIfDoseTaken(treatment: any, treatmentMed: any, nextDose: Date): Promise<boolean> {
  // Buscar tomas en un rango de ±30 minutos alrededor de la hora programada
  const startRange = new Date(nextDose.getTime() - 30 * 60 * 1000);
  const endRange = new Date(nextDose.getTime() + 30 * 60 * 1000);

  const tomas = await prisma.toma.findMany({
    where: {
      medicamentoId: treatmentMed.medicationId,
      OR: [
        { consumidorUsuarioId: treatment.userId },
        { consumidorPerfilId: treatment.patientId }
      ],
      fechaHora: {
        gte: startRange,
        lte: endRange
      }
    }
  });

  return tomas.length > 0;
}

// Enviar notificación push a todas las suscripciones del usuario
async function sendPushNotification(user: any, message: string) {
  if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
    console.log(`ℹ️ Usuario ${user.email} no tiene suscripciones push`);
    return;
  }

  const payload = JSON.stringify({
    title: '🔔 Botilyx - Recordatorio',
    body: message,
    icon: '/icons/favicon.png',
    badge: '/icons/favicon.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/botiquin'
    }
  });

  const promises = user.pushSubscriptions.map(async (subscription: any) => {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      };

      await webpush.sendNotification(pushSubscription, payload);
      console.log(`✅ Notificación enviada a ${user.email}`);
    } catch (error: any) {
      // Si la suscripción expiró o es inválida, eliminarla
      if (error.statusCode === 410) {
        console.log(`🗑️ Eliminando suscripción expirada para ${user.email}`);
        await prisma.pushSubscription.delete({
          where: { id: subscription.id }
        });
      } else {
        console.error(`❌ Error enviando notificación a ${user.email}:`, error);
      }
    }
  });

  await Promise.allSettled(promises);
}
