import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const imageType = formData.get("imageType") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ninguna imagen" },
        { status: 400 }
      );
    }

    if (!imageType || !["receta", "instrucciones"].includes(imageType)) {
      return NextResponse.json(
        { error: "Tipo de imagen inválido. Debe ser 'receta' o 'instrucciones'" },
        { status: 400 }
      );
    }

    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), "public", "treatment-images");
    await mkdir(uploadDir, { recursive: true });

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `treatment-${imageType}-${timestamp}-${randomString}.${fileExtension}`;
    
    // Ruta completa del archivo
    const filePath = join(uploadDir, fileName);
    
    // Convertir archivo a buffer y guardarlo
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // URL pública del archivo
    const imageUrl = `/treatment-images/${fileName}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      fileName
    });

  } catch (error) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
