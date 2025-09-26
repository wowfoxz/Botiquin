import { GoogleGenerativeAI } from "@google/generative-ai";

// La clave de API se obtiene de forma segura desde las variables de entorno.
// El usuario debe crear un archivo .env.local en la raíz del proyecto con:
// GOOGLE_API_KEY=SU_CLAVE_DE_API_AQUI
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  // Este error detendrá el servidor si la clave no está configurada,
  // lo cual es bueno para la seguridad y para alertar al desarrollador.
  console.error(
    "Error Crítico: La variable de entorno GOOGLE_API_KEY no está definida."
  );
  // En un entorno de producción, podrías manejar esto de forma más elegante,
  // pero para el desarrollo, fallar rápido es una buena práctica.
}

// Solo inicializamos genAI si la clave existe
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Función para convertir un buffer de imagen a un formato que Gemini puede entender
function fileToGenerativePart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

interface ImageAnalysisResult {
  nombre_comercial: string | null;
  cantidad: number | null;
  unidad: string | null;
  principio_activo: string | null;
  error?: string;
}

export async function analyzeImageWithGemini(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ImageAnalysisResult> {
  if (!genAI) {
    return {
      error: "La configuración de la API de IA no está disponible.",
      nombre_comercial: null,
      cantidad: null,
      unidad: null,
      principio_activo: null,
    };
  }
  // Usar el modelo multimodal actualizado
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Analiza MUY CUIDADOSAMENTE la imagen de esta caja de medicamento y extrae la siguiente información en formato JSON. Sé muy preciso.

  INFORMACIÓN A EXTRAER:
  1.  "nombre_comercial": El nombre de la marca del medicamento.
  2.  "cantidad": El número total de unidades en el envase (ej: 20, 30, 100). Debe ser un número. Si no lo ves, pon null.
  3.  "unidad": La unidad de las cantidades (ej: "comprimidos", "cápsulas", "ml"). Si no lo ves, pon null.
  4.  "principio_activo": El principio activo y su concentración si está visible (ej: "Paracetamol 500mg").

  Responde ÚNICAMENTE con el objeto JSON. No incluyas explicaciones ni texto adicional como \`\`\`json. Si un campo no es visible, usa el valor null.
  Ejemplo de respuesta:
  {
    "nombre_comercial": "Ibuprofeno 600mg",
    "cantidad": 20,
    "unidad": "comprimidos",
    "principio_activo": "Ibuprofeno 600mg"
  }`;

  const imagePart = fileToGenerativePart(imageBuffer, mimeType);

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    // Limpiar la respuesta de cualquier formato de código markdown
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Error al analizar la imagen con Gemini:", error);
    return {
      nombre_comercial: null,
      cantidad: null,
      unidad: null,
      principio_activo: null,
      error: "No se pudo analizar la imagen.",
    };
  }
}

interface DrugInfoResult {
  principios_activos: string;
  descripcion_uso: string;
  recomendaciones_ingesta: string;
  error?: string;
}

export async function getDrugInfoWithGemini(
  medicineName: string
): Promise<DrugInfoResult> {
  if (!genAI) {
    return {
      error: "La configuración de la API de IA no está disponible.",
      principios_activos: "",
      descripcion_uso: "",
      recomendaciones_ingesta: "",
    };
  }
  // Usar el modelo de texto actualizado
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Eres un experto farmacéutico. Basado en el nombre del medicamento "${medicineName}", busca información y responde ÚNICAMENTE con un objeto JSON con los siguientes campos:

    1. "principios_activos": El o los principios activos principales y su concentración.
    2. "descripcion_uso": Un resumen breve y claro de para qué se usa el medicamento.
    3. "recomendaciones_ingesta": Las recomendaciones generales de ingesta, incluyendo DOSIS, FRECUENCIA Y VÍA DE ADMINISTRACIÓN (ej: "1 comprimido cada 8 horas por vía oral"). Si hay varias presentaciones, menciona las más comunes. Sé específico sobre la dosis típica para adultos.

    Si no encuentras información, usa "No encontrado" como valor para los campos. No incluyas explicaciones ni texto adicional como \`\`\`json.
    Ejemplo de respuesta:
    {
        "principios_activos": "Omeprazol 20mg",
        "descripcion_uso": "Inhibidor de la bomba de protones indicado para el tratamiento de úlceras gástricas y duodenales, esofagitis por reflujo y otros problemas relacionados con el exceso de acidez gástrica.",
        "recomendaciones_ingesta": "Tomar 1 cápsula de 20mg una vez al día por la mañana, 30 minutos antes del desayuno, por vía oral. En casos de úlceras duodenales, el tratamiento dura 2-4 semanas."
    }`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpiar la respuesta de cualquier formato de código markdown
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.error(
      "Error al obtener información del medicamento con Gemini:",
      error
    );
    return {
      principios_activos: "No encontrado",
      descripcion_uso: "No encontrado",
      recomendaciones_ingesta: "Consultar prospecto",
      error: "No se pudo obtener la información del medicamento.",
    };
  }
}
