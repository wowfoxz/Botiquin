import prisma from '@/lib/prisma';
import { Medication, NotificationSettings } from '@prisma/client';

export interface Notification {
  id: string;
  message: string;
  type: 'expiry' | 'stock';
}

// This function will be called from a Server Component to get the notifications.
export async function getNotifications(): Promise<Notification[]> {
  // In the future, we'll get the logged-in user's ID.
  const user = await prisma.user.findFirst();

  if (!user) {
    return [];
  }

  let settings = await prisma.notificationSettings.findUnique({
    where: { userId: user.id },
  });

  // If user has no settings, create them with default values.
  if (!settings) {
    settings = await prisma.notificationSettings.create({
      data: {
        userId: user.id,
        daysBeforeExpiration: 30,
        lowStockThreshold: 10,
      },
    });
  }

  const { daysBeforeExpiration, lowStockThreshold } = settings;

  const expirationDateThreshold = new Date();
  expirationDateThreshold.setDate(expirationDateThreshold.getDate() + daysBeforeExpiration);

  const medicationsToNotify = await prisma.medication.findMany({
    where: {
      userId: user.id,
      archived: false,
      OR: [
        {
          expirationDate: {
            lte: expirationDateThreshold,
          },
        },
        {
          currentQuantity: {
            lte: lowStockThreshold,
          },
        },
      ],
    },
  });

  const notifications: Notification[] = [];

  for (const med of medicationsToNotify) {
    // Check if the medication is within the expiration threshold and not already expired
    const isExpiringSoon = med.expirationDate <= expirationDateThreshold && med.expirationDate > new Date();
    const isLowStock = med.currentQuantity <= lowStockThreshold;

    if (isExpiringSoon) {
      notifications.push({
        id: `${med.id}-expiry`,
        message: `El medicamento '${med.commercialName}' está a punto de vencer.`,
        type: 'expiry',
      });
    } else if (med.expirationDate <= new Date()) { // Check if already expired
        notifications.push({
            id: `${med.id}-expiry`,
            message: `El medicamento '${med.commercialName}' ha vencido.`,
            type: 'expiry',
        });
    }

    if (isLowStock) {
      notifications.push({
        id: `${med.id}-stock`,
        message: `Queda poco stock de '${med.commercialName}' (${med.currentQuantity} ${med.unit}).`,
        type: 'stock',
      });
    }
  }

  // Remove duplicate notifications if a medication triggers both expiry and stock alerts
  const uniqueNotifications = Array.from(new Map(notifications.map(item => [item.id, item])).values());

  return uniqueNotifications;
}
