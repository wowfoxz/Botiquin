import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { config } from "@/lib/config";

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

          // Determinar la ruta de almacenamiento
          // En desarrollo: Guarda en public/ local
          // En producción (Kubernetes): Guarda en el volumen montado en /app/public/
          const isProduction = process.env.NODE_ENV === 'production';
          const uploadsBasePath = isProduction
            ? join(process.cwd(), "public")  // Kubernetes: volumen montado en /app/public/
            : join(process.cwd(), "public");  // Desarrollo: carpeta local

          const uploadDir = join(uploadsBasePath, "treatment-images");
    
    console.log('📁 Guardando imágenes en:', uploadDir);
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

    // URL pública del archivo (incluir basePath para producción)
    const imageUrl = `${config.BASE_PATH}/treatment-images/${fileName}`;

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
