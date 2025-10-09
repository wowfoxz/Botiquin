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
import { writeFile } from "fs/promises";
import path from "path";

export async function processUploadedImage(
  imageBase64: string,
  mimeType: string
) {
  if (!imageBase64 || !mimeType) {
    redirect("/medications/new/upload?error=No-image");
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
  }

  // Guardar la imagen en el servidor
  let imageUrl = "";
  try {
    // Generar nombre único para la imagen
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = mimeType.split("/")[1] || "jpg";
    const fileName = `medication-${timestamp}-${randomString}.${extension}`;

    // Ruta donde se guardará la imagen
    const publicPath = path.join(
      process.cwd(),
      "public",
      "medications",
      fileName
    );

    // Guardar la imagen
    await writeFile(publicPath, imageBuffer);

    // URL pública de la imagen
    imageUrl = `/medications/${fileName}`;
  } catch (error) {
    console.error("Error al guardar la imagen:", error);
    // Continuar sin imagen si hay error
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
    image_url: imageUrl, // Agregar la URL de la imagen
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
  const dni = formData.get("dni") as string;
  const fechaNacimiento = formData.get("fechaNacimiento") as string;
  const password = formData.get("password") as string;
  const grupoNombre = formData.get("grupoNombre") as string;

  if (!name || !email || !dni || !fechaNacimiento || !password || !grupoNombre) {
    throw new Error("Todos los campos son requeridos.");
  }

  // Verificar si el email ya existe
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUserByEmail) {
    throw new Error("El correo electrónico ya está en uso.");
  }

  // Verificar si el DNI ya existe
  const existingUserByDni = await prisma.user.findUnique({
    where: { dni },
  });

  if (existingUserByDni) {
    throw new Error("El DNI ya está registrado en el sistema.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el grupo familiar y el usuario en una transacción
  const result = await prisma.$transaction(async (tx) => {
    // Primero crear el usuario sin grupo
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        dni,
        fechaNacimiento: new Date(fechaNacimiento),
        password: hashedPassword,
        rol: "ADULTO",
      },
    });

    // Luego crear el grupo familiar con el usuario como creador
    const grupo = await tx.grupoFamiliar.create({
      data: {
        nombre: grupoNombre,
        creadorId: newUser.id,
      },
    });

    // Finalmente actualizar el usuario con el grupo
    const updatedUser = await tx.user.update({
      where: { id: newUser.id },
      data: { grupoId: grupo.id },
    });

    return updatedUser;
  });

  await createSession(result.id);
  redirect("/botiquin");
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
  redirect("/botiquin");
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
  const imageUrl = formData.get("imageUrl") as string | null;

  try {
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
        imageUrl: imageUrl || null, // Guardar la URL de la imagen si existe
        userId: userId,
      },
    });

    revalidatePath("/botiquin");
  } catch (error) {
    console.error("Error al agregar medicamento:", error);
    throw error;
  }
  
  redirect("/botiquin?success=Medicamento agregado exitosamente");
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

  revalidatePath("/botiquin");
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

  revalidatePath("/botiquin");
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

  revalidatePath("/botiquin");
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

  try {
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

    revalidatePath("/botiquin");
    revalidatePath("/configuracion");
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    throw error;
  }
  
  redirect("/configuracion?success=Configuracion actualizada exitosamente");
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

// Eliminar un medicamento permanentemente
export async function deleteMedication(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return;
  }

  await prisma.medication.delete({
    where: { id },
  });

  revalidatePath("/botiquin");
  revalidatePath("/medications/archived");
}

// Actualizar un medicamento archivado (sin cambiar fecha de vencimiento)
export async function updateArchivedMedication(formData: FormData) {
  const id = formData.get("id") as string;
  const commercialName = formData.get("commercialName") as string;
  const activeIngredient = formData.get("activeIngredient") as string;
  const initialQuantity = parseFloat(formData.get("initialQuantity") as string);
  const unit = formData.get("unit") as string;
  const description = formData.get("description") as string;
  const intakeRecommendations = formData.get("intakeRecommendations") as string;

  if (!id) {
    return;
  }

  await prisma.medication.update({
    where: { id },
    data: {
      commercialName,
      activeIngredient,
      initialQuantity,
      unit,
      description,
      intakeRecommendations,
    },
  });

  revalidatePath("/botiquin");
  revalidatePath("/medications/archived");
}

// Acciones para gestión del grupo familiar

export async function agregarAdultoAlGrupo(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("No autenticado. Inicie sesión para continuar.");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const dni = formData.get("dni") as string;
  const fechaNacimiento = formData.get("fechaNacimiento") as string;

  if (!name || !email || !dni || !fechaNacimiento) {
    throw new Error("Todos los campos son requeridos.");
  }

  // Obtener el grupo del usuario actual
  const usuarioActual = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { grupo: true },
  });

  if (!usuarioActual?.grupo) {
    throw new Error("Usuario no pertenece a ningún grupo familiar.");
  }

  // Verificar si el email ya existe
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUserByEmail) {
    throw new Error("El correo electrónico ya está en uso.");
  }

  // Verificar si el DNI ya existe
  const existingUserByDni = await prisma.user.findUnique({
    where: { dni },
  });

  if (existingUserByDni) {
    throw new Error("El DNI ya está registrado en el sistema.");
  }

  const hashedPassword = await bcrypt.hash(dni, 10); // Contraseña por defecto es el DNI

  await prisma.user.create({
    data: {
      name,
      email,
      dni,
      fechaNacimiento: new Date(fechaNacimiento),
      password: hashedPassword,
      rol: "ADULTO",
      grupoId: usuarioActual.grupo.id,
    },
  });

  revalidatePath("/configuracion/grupo-familiar");
  redirect("/configuracion/grupo-familiar?success=Adulto agregado exitosamente");
}

export async function agregarMenorConCuentaAlGrupo(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("No autenticado. Inicie sesión para continuar.");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const dni = formData.get("dni") as string;
  const fechaNacimiento = formData.get("fechaNacimiento") as string;

  if (!name || !email || !dni || !fechaNacimiento) {
    throw new Error("Todos los campos son requeridos.");
  }

  // Obtener el grupo del usuario actual
  const usuarioActual = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { grupo: true },
  });

  if (!usuarioActual?.grupo) {
    throw new Error("Usuario no pertenece a ningún grupo familiar.");
  }

  // Verificar si el email ya existe
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUserByEmail) {
    throw new Error("El correo electrónico ya está en uso.");
  }

  // Verificar si el DNI ya existe
  const existingUserByDni = await prisma.user.findUnique({
    where: { dni },
  });

  if (existingUserByDni) {
    throw new Error("El DNI ya está registrado en el sistema.");
  }

  const hashedPassword = await bcrypt.hash(dni, 10); // Contraseña por defecto es el DNI

  await prisma.user.create({
    data: {
      name,
      email,
      dni,
      fechaNacimiento: new Date(fechaNacimiento),
      password: hashedPassword,
      rol: "MENOR",
      grupoId: usuarioActual.grupo.id,
    },
  });

  revalidatePath("/configuracion/grupo-familiar");
  redirect("/configuracion/grupo-familiar?success=Menor con cuenta agregado exitosamente");
}

export async function agregarPerfilMenorAlGrupo(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("No autenticado. Inicie sesión para continuar.");
  }

  const name = formData.get("name") as string;
  const dni = formData.get("dni") as string;
  const fechaNacimiento = formData.get("fechaNacimiento") as string;

  if (!name || !dni || !fechaNacimiento) {
    throw new Error("Todos los campos son requeridos.");
  }

  // Obtener el grupo del usuario actual
  const usuarioActual = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { grupo: true },
  });

  if (!usuarioActual?.grupo) {
    throw new Error("Usuario no pertenece a ningún grupo familiar.");
  }

  // Verificar si el DNI ya existe en usuarios o perfiles
  const existingUserByDni = await prisma.user.findUnique({
    where: { dni },
  });

  if (existingUserByDni) {
    throw new Error("El DNI ya está registrado en el sistema.");
  }

  const existingPerfilByDni = await prisma.perfilMenor.findUnique({
    where: { dni },
  });

  if (existingPerfilByDni) {
    throw new Error("El DNI ya está registrado en el sistema.");
  }

  await prisma.perfilMenor.create({
    data: {
      nombre: name,
      dni,
      fechaNacimiento: new Date(fechaNacimiento),
      grupoId: usuarioActual.grupo.id,
    },
  });

  revalidatePath("/configuracion/grupo-familiar");
  redirect("/configuracion/grupo-familiar?success=Perfil de menor agregado exitosamente");
}

export async function registrarTomaMedicamento(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("No autenticado. Inicie sesión para continuar.");
  }

  const medicamentoId = formData.get("medicamentoId") as string;
  const consumidorTipo = formData.get("consumidorTipo") as string;
  const consumidorId = formData.get("consumidorId") as string;
  const fechaHora = formData.get("fechaHora") as string;

  if (!medicamentoId || !consumidorTipo || !consumidorId || !fechaHora) {
    throw new Error("Todos los campos son requeridos.");
  }

  // Obtener el grupo del usuario actual
  const usuarioActual = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { grupo: true },
  });

  if (!usuarioActual?.grupo) {
    throw new Error("Usuario no pertenece a ningún grupo familiar.");
  }

  // Verificar que el medicamento pertenece al grupo
  const medicamento = await prisma.medication.findFirst({
    where: {
      id: medicamentoId,
      user: {
        grupoId: usuarioActual.grupo.id,
      },
    },
  });

  if (!medicamento) {
    throw new Error("Medicamento no encontrado o no pertenece al grupo familiar.");
  }

  // Crear la toma y actualizar la cantidad del medicamento en una transacción
  await prisma.$transaction(async (tx) => {
    // Crear la toma según el tipo de consumidor
    if (consumidorTipo === "usuario") {
      // Verificar que el usuario consumidor pertenece al grupo
      const consumidorUsuario = await tx.user.findFirst({
        where: {
          id: consumidorId,
          grupoId: usuarioActual.grupo.id,
        },
      });

      if (!consumidorUsuario) {
        throw new Error("Usuario consumidor no encontrado o no pertenece al grupo familiar.");
      }

      await tx.toma.create({
        data: {
          medicamentoId,
          consumidorUsuarioId: consumidorId,
          registranteId: session.userId,
          fechaHora: new Date(fechaHora),
          grupoId: usuarioActual.grupo.id,
        },
      });
    } else if (consumidorTipo === "perfil") {
      // Verificar que el perfil consumidor pertenece al grupo
      const consumidorPerfil = await tx.perfilMenor.findFirst({
        where: {
          id: consumidorId,
          grupoId: usuarioActual.grupo.id,
        },
      });

      if (!consumidorPerfil) {
        throw new Error("Perfil consumidor no encontrado o no pertenece al grupo familiar.");
      }

      await tx.toma.create({
        data: {
          medicamentoId,
          consumidorPerfilId: consumidorId,
          registranteId: session.userId,
          fechaHora: new Date(fechaHora),
          grupoId: usuarioActual.grupo.id,
        },
      });
    }

    // Actualizar la cantidad del medicamento (decrementar en 1)
    await tx.medication.update({
      where: { id: medicamentoId },
      data: {
        currentQuantity: {
          decrement: 1,
        },
      },
    });
  });

  revalidatePath("/botiquin");
  redirect("/botiquin?success=Toma registrada exitosamente");
}
