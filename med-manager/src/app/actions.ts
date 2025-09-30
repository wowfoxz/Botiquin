"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createSession, getSession, deleteSession } from "@/lib/session";
import {
  analyzeImageWithGemini,
  getDrugInfoWithGemini,
} from "@/lib/ai-processor";

export async function processUploadedImage(
  imageBase64: string,
  mimeType: string
) {
  if (!imageBase64 || !mimeType) {
    redirect("/medications/new/upload?error=No-image");
    return;
  }

  const imageBuffer = Buffer.from(imageBase64, "base64");

  const imageAnalysis = await analyzeImageWithGemini(imageBuffer, mimeType);

  if (imageAnalysis.error || !imageAnalysis.nombre_comercial) {
    const errorMessage =
      imageAnalysis.error ||
      "No se pudo identificar el medicamento en la imagen.";
    redirect(
      `/medications/new/upload?error=${encodeURIComponent(errorMessage)}`
    );
    return;
  }

  const drugInfo = await getDrugInfoWithGemini(imageAnalysis.nombre_comercial);
  if (drugInfo.error) {
    console.error("Error en la búsqueda de información web:", drugInfo.error);
  }

  const combinedData = {
    nombre_comercial: imageAnalysis.nombre_comercial,
    cantidad_inicial: imageAnalysis.cantidad,
    unidad: imageAnalysis.unidad,
    principios_activos:
      drugInfo.principios_activos || imageAnalysis.principio_activo || "",
    descripcion_uso: drugInfo.descripcion_uso || "",
    recomendaciones_ingesta: drugInfo.recomendaciones_ingesta || "",
  };

  const params = new URLSearchParams();
  Object.entries(combinedData).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  redirect(`/medications/new/manual?${params.toString()}`);
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    throw new Error("Todos los campos son requeridos.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("El correo electrónico ya está en uso.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  await createSession(newUser.id);
  redirect("/");
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Correo y contraseña son requeridos.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Credenciales no válidas.");
  }

  const passwordsMatch = await bcrypt.compare(password, user.password);

  if (!passwordsMatch) {
    throw new Error("Credenciales no válidas.");
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutUser() {
  await deleteSession();
  redirect("/login");
}

export async function addMedication(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    console.error("No autenticado. Inicie sesión para continuar.");
    return;
  }
  const userId = session.userId;

  const commercialName = formData.get("commercialName") as string;
  const activeIngredient = formData.get("activeIngredient") as string;
  const initialQuantity = parseFloat(formData.get("initialQuantity") as string);
  const unit = formData.get("unit") as string;
  const expirationDate = new Date(formData.get("expirationDate") as string);
  const description = formData.get("description") as string;
  const intakeRecommendations = formData.get("intakeRecommendations") as string;

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

  revalidatePath("/");
  redirect("/");
}

export async function updateMedicationQuantity(formData: FormData) {
  const id = formData.get("id") as string;
  const newQuantity = parseFloat(formData.get("newQuantity") as string);

  if (newQuantity < 0) {
    return;
  }

  await prisma.medication.update({
    where: { id },
    data: {
      currentQuantity: newQuantity,
    },
  });

  revalidatePath("/");
}

export async function toggleMedicationArchiveStatus(formData: FormData) {
  const id = formData.get("id") as string;

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

  revalidatePath("/");
  revalidatePath("/medications/archived");
}

export async function unarchiveMedicationWithNewExpiration(formData: FormData) {
  const id = formData.get("id") as string;
  const newExpirationRaw = formData.get("newExpirationDate") as string | null;

  if (!id || !newExpirationRaw) {
    return;
  }

  const newExpirationDate = new Date(newExpirationRaw);
  if (isNaN(newExpirationDate.getTime())) {
    // Fecha inválida, no hacer nada
    return;
  }

  // Obtener el medicamento para acceder a initialQuantity
  const medication = await prisma.medication.findUnique({
    where: { id },
    select: { initialQuantity: true },
  });

  if (!medication) {
    return;
  }

  // Actualizar el medicamento: desarchivar, reiniciar cantidad, actualizar fecha de vencimiento
  await prisma.medication.update({
    where: { id },
    data: {
      archived: false,
      currentQuantity: medication.initialQuantity,
      expirationDate: newExpirationDate,
    },
  });

  revalidatePath("/");
  revalidatePath("/medications/archived");
}

export async function updateNotificationSettings(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    console.error("No autenticado. Inicie sesión para continuar.");
    return;
  }
  const userId = session.userId;

  const daysBeforeExpiration = parseInt(
    formData.get("daysBeforeExpiration") as string,
    10
  );
  const lowStockThreshold = parseFloat(
    formData.get("lowStockThreshold") as string
  );

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

  revalidatePath("/");
  revalidatePath("/configuracion");
  redirect("/configuracion");
}

export async function getDescriptionFromAI(formData: FormData) {
  const commercialName = formData.get("commercialName") as string;
  const activeIngredient = formData.get("activeIngredient") as string;

  // Importamos las funciones necesarias
  const { getDescriptionWithGemini } = await import("@/lib/ai-processor");

  const result = await getDescriptionWithGemini(
    commercialName,
    activeIngredient
  );

  return {
    success: !result.error,
    info: result.info,
    error: result.error,
  };
}

export async function getIntakeRecommendationsFromAI(formData: FormData) {
  const commercialName = formData.get("commercialName") as string;
  const activeIngredient = formData.get("activeIngredient") as string;

  // Importamos las funciones necesarias
  const { getIntakeRecommendationsWithGemini } = await import(
    "@/lib/ai-processor"
  );

  const result = await getIntakeRecommendationsWithGemini(
    commercialName,
    activeIngredient
  );

  return {
    success: !result.error,
    info: result.info,
    error: result.error,
  };
}
/* Duplicate addMedication function removed. The remaining implementation is kept elsewhere in this file.
   This prevents having multiple definitions and ensures the file ends correctly with a single revalidatePath/redirect call. */
