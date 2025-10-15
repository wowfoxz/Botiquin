import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export interface Notification {
  id: string;
  message: string;
  type: "expiry" | "stock";
}

// This function will be called from a Server Component to get the notifications.
export async function getNotifications(): Promise<Notification[]> {
  const session = await getSession();
  if (!session?.userId) {
    return [];
  }
  const userId = session.userId;

  // Check if session is expired
  if (session.expires && new Date(session.expires) < new Date()) {
    return []; // Return empty array if session is expired
  }

  let settings = await prisma.notificationSettings.findUnique({
    where: { userId: userId },
  });

  // If user has no settings, create them with default values.
  if (!settings) {
    settings = await prisma.notificationSettings.create({
      data: {
        userId: userId,
        daysBeforeExpiration: 30,
        lowStockThreshold: 10,
      },
    });
  }

  // Calculate expiration threshold adjusted to local timezone to avoid
  // off-by-one-day issues when comparing dates from the database.
  const now = new Date();
  const adjustedExpirationDateThreshold = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  );
  adjustedExpirationDateThreshold.setDate(
    adjustedExpirationDateThreshold.getDate() + settings.daysBeforeExpiration
  );

  // Also compute an adjusted "today" to use for comparisons against expiration.
  const today = new Date();
  const adjustedToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  );

  const medicationsToNotify = await prisma.medication.findMany({
    where: {
      userId: userId,
      archived: false,
      OR: [
        {
          expirationDate: {
            lte: adjustedExpirationDateThreshold,
          },
        },
        {
          currentQuantity: {
            lte: settings.lowStockThreshold,
          },
        },
      ],
    },
  });

  const notifications: Notification[] = [];

  for (const med of medicationsToNotify) {
    // Use the adjusted expiration threshold and the adjusted "today" so comparisons
    // are performed in the same timezone baseline and avoid off-by-one-day issues.
    const isExpiringSoon =
      med.expirationDate <= adjustedExpirationDateThreshold &&
      med.expirationDate > adjustedToday;
    const isLowStock = med.currentQuantity <= settings.lowStockThreshold;

    if (isExpiringSoon) {
      notifications.push({
        id: `${med.id}-expiry`,
        message: `El medicamento '${med.commercialName}' está a punto de vencer.`,
        type: "expiry",
      });
    } else if (med.expirationDate <= new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)) {
      // Check if already expired (using an adjusted "today" computed inline to ensure correct timezone handling)
      notifications.push({
        id: `${med.id}-expiry`,
        message: `El medicamento '${med.commercialName}' ha vencido.`,
        type: "expiry",
      });
    }

    if (isLowStock) {
      notifications.push({
        id: `${med.id}-stock`,
        message: `Queda poco stock de '${med.commercialName}' (${med.currentQuantity} ${med.unit}).`,
        type: "stock",
      });
    }
  }

  const uniqueNotifications = Array.from(
    new Map(notifications.map((item) => [item.id, item])).values()
  );

  return uniqueNotifications;
}
