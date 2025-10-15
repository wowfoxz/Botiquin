import { GoogleGenerativeAI } from "@google/generative-ai";

// La clave de API se obtiene de forma segura desde las variables de entorno.
// El usuario debe crear un archivo .env.local en la raíz del proyecto con:
// GOOGLE_API_KEY=SU_CLAVE_DE_API_AQUI
const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  // Este error detendrá el servidor si la clave no está configurada,
  // lo cual es bueno para la seguridad y para alertar al desarrollador.
  console.warn(
    "Advertencia: La variable de entorno GOOGLE_API_KEY no está definida. Las funciones de IA no estarán disponibles."
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

// Función auxiliar para manejar reintentos con backoff exponencial
async function ejecutarConReintentos<T>(
  operacion: () => Promise<T>,
  maxReintentos: number = 3,
  delayInicial: number = 1000
): Promise<T> {
  let ultimoError: any;
  
  for (let intento = 0; intento <= maxReintentos; intento++) {
    try {
      return await operacion();
    } catch (error: any) {
      ultimoError = error;
      
      // Verificar si es un error recuperable (503, 429, timeout)
      const esErrorRecuperable = 
        error?.status === 503 || 
        error?.status === 429 ||
        error?.message?.includes('overloaded') ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('network');
      
      if (!esErrorRecuperable || intento === maxReintentos) {
        throw error;
      }
      
      // Calcular delay con backoff exponencial
      const delay = delayInicial * Math.pow(2, intento);
      console.log(`Intento ${intento + 1} falló, reintentando en ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw ultimoError;
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
  2.  "cantidad": El número total de unidades (si son comprimidos) en el envase (ej: 20, 30, 100), tambien pueden sel mililitros o centimetros cubicos (ej: 10ml , 50cc). Debe ser un número. Si no lo ves, pon "No encontrado en la imagen".
  3.  "unidad": La unidad de las cantidades (ej: "comprimidos", "cápsulas", "ml"). Si no lo ves, pon "No encontrado en la imagen".
  4.  "principio_activo": El principio activo y su concentración si está visible (ej: "Paracetamol 500mg") intenta colocar solo la informacion que aparece en la imagen.

  Responde ÚNICAMENTE con el objeto JSON. No incluyas explicaciones ni texto adicional como \`\`\`json. Si un campo no es visible, usa el valor "No encontrado en la imagen".
  Ejemplo de respuesta:
  {
    "nombre_comercial": "Actron",
    "cantidad": 10,
    "unidad": "Capsulas Blandas",
    "principio_activo": "Ibuprofeno 400mg"
  }`;

  const imagePart = fileToGenerativePart(imageBuffer, mimeType);

  try {
    const resultado = await ejecutarConReintentos(async () => {
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      let text = response.text();

      // Limpiar la respuesta de cualquier formato de código markdown
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(text);
    });

    return resultado;
  } catch (error: any) {
    console.error("Error al analizar la imagen con Gemini:", error);
    
    // Determinar el mensaje de error apropiado
    let mensajeError = "No se pudo analizar la imagen.";
    
    if (error?.status === 503 || error?.message?.includes('overloaded')) {
      mensajeError = "El servicio de análisis de imágenes está temporalmente sobrecargado. Por favor, inténtalo de nuevo en unos momentos.";
    } else if (error?.status === 429) {
      mensajeError = "Se han excedido los límites de uso del servicio. Por favor, espera un momento antes de intentar de nuevo.";
    } else if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
      mensajeError = "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.";
    }
    
    return {
      nombre_comercial: null,
      cantidad: null,
      unidad: null,
      principio_activo: null,
      error: mensajeError,
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
    3. "recomendaciones_ingesta": Solo dosis específicas, frecuencia y vía de administración. Sin asteriscos, negritas, advertencias ni disclaimers. Máximo 200 palabras. Solo para adultos y niños (especifica edad mínima).

    Si no encuentras información, usa "No encontrado" como valor para los campos. No incluyas explicaciones ni texto adicional como \`\`\`json.
    Ejemplo de respuesta:
    {
        "principios_activos": "Omeprazol 20mg",
        "descripcion_uso": "Inhibidor de la bomba de protones indicado para el tratamiento de úlceras gástricas y duodenales, esofagitis por reflujo y otros problemas relacionados con el exceso de acidez gástrica.",
        "recomendaciones_ingesta": "Adultos: 1 cápsula de 20mg una vez al día por la mañana, 30 minutos antes del desayuno, por vía oral. Niños mayores de 12 años: 1 cápsula de 20mg una vez al día. Tratamiento de 2-4 semanas para úlceras duodenales."
    }`;

  try {
    const resultado = await ejecutarConReintentos(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Limpiar la respuesta de cualquier formato de código markdown
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(text);
    });

    return resultado;
  } catch (error: any) {
    console.error(
      "Error al obtener información del medicamento con Gemini:",
      error
    );
    
    // Determinar el mensaje de error apropiado
    let mensajeError = "No se pudo obtener la información del medicamento.";
    
    if (error?.status === 503 || error?.message?.includes('overloaded')) {
      mensajeError = "El servicio de información farmacéutica está temporalmente sobrecargado. Por favor, inténtalo de nuevo en unos momentos.";
    } else if (error?.status === 429) {
      mensajeError = "Se han excedido los límites de uso del servicio. Por favor, espera un momento antes de intentar de nuevo.";
    } else if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
      mensajeError = "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.";
    }
    
    return {
      principios_activos: "No encontrado",
      descripcion_uso: "No encontrado",
      recomendaciones_ingesta: "Consultar prospecto",
      error: mensajeError,
    };
  }
}

interface SpecificDrugInfoResult {
  info: string;
  error?: string;
}

export async function getDescriptionWithGemini(
  medicineName: string,
  activeIngredient: string
): Promise<SpecificDrugInfoResult> {
  if (!genAI) {
    return {
      error: "La configuración de la API de IA no está disponible.",
      info: "",
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Eres un experto farmacéutico. Basado en el nombre del medicamento "${medicineName}" y su principio activo "${activeIngredient}", proporciona una descripción breve y clara de para qué se usa este medicamento.

  Responde ÚNICAMENTE con la descripción en texto plano. No incluyas explicaciones ni texto adicional.`;

  try {
    const resultado = await ejecutarConReintentos(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      return { info: text };
    });

    return resultado;
  } catch (error: any) {
    console.error(
      "Error al obtener descripción del medicamento con Gemini:",
      error
    );
    
    // Determinar el mensaje de error apropiado
    let mensajeError = "No se pudo obtener la descripción del medicamento.";
    
    if (error?.status === 503 || error?.message?.includes('overloaded')) {
      mensajeError = "El servicio de información farmacéutica está temporalmente sobrecargado. Por favor, inténtalo de nuevo en unos momentos.";
    } else if (error?.status === 429) {
      mensajeError = "Se han excedido los límites de uso del servicio. Por favor, espera un momento antes de intentar de nuevo.";
    } else if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
      mensajeError = "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.";
    }
    
    return {
      info: "No se pudo obtener la descripción del medicamento.",
      error: mensajeError,
    };
  }
}

export async function getIntakeRecommendationsWithGemini(
  medicineName: string,
  activeIngredient: string,
  unidad?: string
): Promise<SpecificDrugInfoResult> {
  if (!genAI) {
    return {
      error: "La configuración de la API de IA no está disponible.",
      info: "",
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const unidadText = unidad ? ` (presentación: ${unidad})` : "";
  const prompt = `Eres un experto farmacéutico. Basado en el nombre del medicamento "${medicineName}" y su principio activo "${activeIngredient}"${unidadText}, proporciona ÚNICAMENTE las recomendaciones de dosis, frecuencia y vía de administración.

FORMATO REQUERIDO:
- Solo dosis específicas, frecuencia y vía de administración
- Sin asteriscos, negritas ni advertencias
- Sin disclaimers ni recomendaciones de consultar médico
- Máximo 200 palabras
- Ejemplo: "Adultos: 1 comprimido cada 8 horas por vía oral. Niños mayores de 12 años: 1 comprimido cada 12 horas."

NO incluyas:
- Advertencias sobre consultar médico
- Disclaimers sobre dosis individuales
- Texto como "importante", "consulte", "puede variar"
- Cualquier texto adicional o explicativo

Responde ÚNICAMENTE con las recomendaciones de dosis en texto plano simple.`;

  try {
    const resultado = await ejecutarConReintentos(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      return { info: text };
    });

    return resultado;
  } catch (error: any) {
    console.error(
      "Error al obtener recomendaciones de ingesta con Gemini:",
      error
    );
    
    // Determinar el mensaje de error apropiado
    let mensajeError = "No se pudo obtener las recomendaciones de ingesta.";
    
    if (error?.status === 503 || error?.message?.includes('overloaded')) {
      mensajeError = "El servicio de información farmacéutica está temporalmente sobrecargado. Por favor, inténtalo de nuevo en unos momentos.";
    } else if (error?.status === 429) {
      mensajeError = "Se han excedido los límites de uso del servicio. Por favor, espera un momento antes de intentar de nuevo.";
    } else if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
      mensajeError = "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.";
    }
    
    return {
      info: "Consultar prospecto",
      error: mensajeError,
    };
  }
}

interface TreatmentImageAnalysisResult {
  extractedText: string;
  aiAnalysis: string;
  error?: string;
}

export async function analyzeTreatmentImageWithGemini(
  imageBuffer: Buffer,
  mimeType: string,
  imageType: "receta" | "instrucciones"
): Promise<TreatmentImageAnalysisResult> {
  if (!genAI) {
    return {
      extractedText: "",
      aiAnalysis: "",
      error: "La configuración de la API de IA no está disponible.",
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Eres un experto en reconocimiento de caligrafía médica. Analiza esta imagen de ${imageType === "receta" ? "receta médica" : "instrucciones de medicación"} con máxima precisión.

TIPO DE IMAGEN: ${imageType === "receta" ? "Receta Médica" : "Instrucciones de Medicación"}

TÉCNICAS DE RECONOCIMIENTO:
- Lee palabra por palabra, letra por letra si es necesario
- Identifica patrones comunes en caligrafía médica
- Reconoce abreviaciones médicas (ej: "c/8h" = cada 8 horas, "1c/8h" = 1 comprimido cada 8 horas)
- Identifica símbolos médicos (+, -, x, /, números, etc.)
- Distingue entre texto impreso y manuscrito

INFORMACIÓN A EXTRAER:

1. TEXTO EXTRAÍDO COMPLETO:
   - Transcribe TODO el texto visible, incluyendo:
   * Encabezados impresos de la receta/clínica
   * Nombres de medicamentos (tanto impresos como manuscritos)
   * Dosis y cantidades (números y unidades)
   * Frecuencias (cada X horas, veces al día)
   * Duración del tratamiento
   * Instrucciones especiales del médico
   * Firmas y sellos

2. ANÁLISIS ESTRUCTURADO:
   - Lista de medicamentos con dosis exactas
   - Frecuencia de administración detallada
   - Duración total del tratamiento
   - Instrucciones específicas (con/sin comida, horarios, etc.)
   - Observaciones y recomendaciones del médico
   - Contraindicaciones o advertencias

IMPORTANTE PARA CALIGRAFÍA MÉDICA:
- Si la letra es difícil de leer, intenta varias interpretaciones
- Usa el contexto para inferir palabras (ej: si aparece "cada 8 horas" después de un medicamento)
- Reconoce abreviaciones comunes: "c/8h", "1c/8h", "2x1", "3x1", "durante 7 días"
- Si algo es completamente ilegible, usa "[texto ilegible]"
- Mantén la estructura original del documento

IMPORTANTE: Responde SIEMPRE en ESPAÑOL. Todos los textos deben estar en español.

Responde ÚNICAMENTE con un objeto JSON válido:
{
  "extractedText": "texto completo extraído de la imagen tal como aparece",
  "aiAnalysis": "análisis estructurado y organizado de la información médica extraída EN ESPAÑOL"
}`;

  const imagePart = fileToGenerativePart(imageBuffer, mimeType);

  try {
    const resultado = await ejecutarConReintentos(async () => {
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      let text = response.text();

      console.log('Respuesta cruda de Gemini:', text);

      // Limpiar la respuesta de cualquier formato de código markdown
      text = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        const parsed = JSON.parse(text);
        console.log('JSON parseado:', parsed);
        
        return {
          extractedText: String(parsed.extractedText || ""),
          aiAnalysis: String(parsed.aiAnalysis || ""),
        };
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError);
        console.error('Texto que causó el error:', text);
        
        // Si falla el parseo, intentar extraer información manualmente
        return {
          extractedText: text,
          aiAnalysis: "Error al procesar el análisis estructurado. Ver texto extraído.",
        };
      }
    });

    return resultado;
  } catch (error: any) {
    console.error("Error al analizar imagen de tratamiento con Gemini:", error);
    
    // Determinar el mensaje de error apropiado
    let mensajeError = "No se pudo analizar la imagen.";
    
    if (error?.status === 503 || error?.message?.includes('overloaded')) {
      mensajeError = "El servicio de análisis de imágenes está temporalmente sobrecargado. Por favor, inténtalo de nuevo en unos momentos.";
    } else if (error?.status === 429) {
      mensajeError = "Se han excedido los límites de uso del servicio. Por favor, espera un momento antes de intentar de nuevo.";
    } else if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
      mensajeError = "Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.";
    }
    
    return {
      extractedText: "",
      aiAnalysis: "",
      error: mensajeError,
    };
  }
}