'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addMedication(formData: FormData) {
  const commercialName = formData.get('commercialName') as string;
  const activeIngredient = formData.get('activeIngredient') as string;
  const initialQuantity = parseFloat(formData.get('initialQuantity') as string);
  const unit = formData.get('unit') as string;
  const expirationDate = new Date(formData.get('expirationDate') as string);
  const description = formData.get('description') as string;
  const intakeRecommendations = formData.get('intakeRecommendations') as string;

  // For now, we'll find or create a dummy user.
  // In a real app, this would come from the authenticated session.
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'password', // In a real app, this should be hashed
        name: 'Test User',
      },
    });
  }

  await prisma.medication.create({
    data: {
      commercialName,
      activeIngredient,
      initialQuantity,
      currentQuantity: initialQuantity,
      unit,
      expirationDate,
      description,
      intakeRecommendations,
      userId: user.id,
    },
  });

  revalidatePath('/');
  redirect('/');
}

export async function updateMedicationQuantity(formData: FormData) {
  const id = formData.get('id') as string;
  const newQuantity = parseFloat(formData.get('newQuantity') as string);

  if (newQuantity < 0) {
    // Maybe return an error message in the future
    return;
  }

  await prisma.medication.update({
    where: { id },
    data: {
      currentQuantity: newQuantity,
    },
  });

  revalidatePath('/');
}

export async function toggleMedicationArchiveStatus(formData: FormData) {
    const id = formData.get('id') as string;

    const medication = await prisma.medication.findUnique({
        where: { id },
        select: { archived: true },
    });

    if (!medication) {
        // Or handle error appropriately
        return;
    }

    await prisma.medication.update({
        where: { id },
        data: {
            archived: !medication.archived,
        },
    });

    revalidatePath('/');
    revalidatePath('/medications/archived');
}

export async function updateNotificationSettings(formData: FormData) {
  const daysBeforeExpiration = parseInt(formData.get('daysBeforeExpiration') as string, 10);
  const lowStockThreshold = parseFloat(formData.get('lowStockThreshold') as string);

  // In the future, we'll get the logged-in user's ID.
  const user = await prisma.user.findFirst();
  if (!user) {
    // Or handle error appropriately
    // This case should ideally not happen if the user is on the settings page.
    return;
  }

  await prisma.notificationSettings.upsert({
    where: { userId: user.id },
    update: {
      daysBeforeExpiration,
      lowStockThreshold,
    },
    create: {
      userId: user.id,
      daysBeforeExpiration,
      lowStockThreshold,
    },
  });

  revalidatePath('/'); // Revalidate the home page to get new notifications
  revalidatePath('/settings'); // Revalidate the settings page itself
  redirect('/settings'); // Redirect back to settings page to show a success state
}
