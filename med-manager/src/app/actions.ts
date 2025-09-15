'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { createSession, getSession, deleteSession } from '@/lib/session';

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'Todos los campos son requeridos.' };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'El correo electrónico ya está en uso.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Iniciar sesión automáticamente después del registro
  await createSession(newUser.id);
  redirect('/');
}

export async function loginUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Correo y contraseña son requeridos.' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: 'Credenciales no válidas.' };
  }

  const passwordsMatch = await bcrypt.compare(password, user.password);

  if (!passwordsMatch) {
    return { error: 'Credenciales no válidas.' };
  }

  // Crear la sesión
  await createSession(user.id);
  redirect('/');
}

export async function logoutUser() {
  await deleteSession();
  redirect('/login');
}

export async function addMedication(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: 'No autenticado. Inicie sesión para continuar.' };
  }
  const userId = session.userId;

  const commercialName = formData.get('commercialName') as string;
  const activeIngredient = formData.get('activeIngredient') as string;
  const initialQuantity = parseFloat(formData.get('initialQuantity') as string);
  const unit = formData.get('unit') as string;
  const expirationDate = new Date(formData.get('expirationDate') as string);
  const description = formData.get('description') as string;
  const intakeRecommendations = formData.get('intakeRecommendations') as string;

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
      userId: userId,
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

  // Future improvement: check if the medication belongs to the logged-in user
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

    // Future improvement: check if the medication belongs to the logged-in user
    const medication = await prisma.medication.findUnique({
        where: { id },
        select: { archived: true },
    });

    if (!medication) {
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
  const session = await getSession();
  if (!session?.userId) {
    return { error: 'No autenticado. Inicie sesión para continuar.' };
  }
  const userId = session.userId;

  const daysBeforeExpiration = parseInt(formData.get('daysBeforeExpiration') as string, 10);
  const lowStockThreshold = parseFloat(formData.get('lowStockThreshold') as string);

  await prisma.notificationSettings.upsert({
    where: { userId: userId },
    update: {
      daysBeforeExpiration,
      lowStockThreshold,
    },
    create: {
      userId: userId,
      daysBeforeExpiration,
      lowStockThreshold,
    },
  });

  revalidatePath('/');
  revalidatePath('/settings');
  redirect('/settings');
}
