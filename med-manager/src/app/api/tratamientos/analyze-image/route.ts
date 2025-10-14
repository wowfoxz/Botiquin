import { NextRequest, NextResponse } from "next/server";
import { analyzeTreatmentImageWithGemini } from "@/lib/ai-processor";

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

    // Convertir el archivo a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;

    // Analizar la imagen con IA
    const analysis = await analyzeTreatmentImageWithGemini(buffer, mimeType, imageType);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error al analizar imagen:", error);
    return NextResponse.json(
      { error: "Error al analizar la imagen" },
      { status: 500 }
    );
  }
}
