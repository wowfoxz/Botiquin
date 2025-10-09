import { NextRequest } from "next/server";
import { registrarBusqueda, extraerMetadataRequest } from "@/lib/auditoria";
import { getServerSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession();
    if (!session?.userId) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await request.json();
    const { searchdata } = body;

    if (!searchdata) {
      return new Response(
        JSON.stringify({ error: "El término de búsqueda es requerido" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Llamar a la API externa
    const response = await fetch("https://cnpm.msal.gov.ar/api/vademecum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchdata }),
    });

    if (!response.ok) {
      throw new Error(`Error en la API externa: ${response.status}`);
    }

    const data = await response.json();

    // Determinar cantidad de resultados
    let cantidadResultados = 0;
    if (Array.isArray(data)) {
      cantidadResultados = data.length;
    } else if (data.medicamentos && Array.isArray(data.medicamentos)) {
      cantidadResultados = data.medicamentos.length;
    }

    // Registrar búsqueda
    const metadata = extraerMetadataRequest(request);
    await registrarBusqueda(
      session.userId,
      searchdata,
      "medicamento",
      cantidadResultados,
      metadata
    );

    // Verificar si la respuesta contiene medicamentos o la estructura es inesperada
    if (
      !data ||
      (Array.isArray(data) && data.length === 0) ||
      (data.medicamentos &&
        Array.isArray(data.medicamentos) &&
        data.medicamentos.length === 0) ||
      // Si no es un array directo ni contiene la propiedad 'medicamentos' como array
      (!Array.isArray(data) &&
        !Array.isArray((data as { medicamentos?: unknown[] })?.medicamentos))
    ) {
      // Normalizar la respuesta para devolver siempre un array de medicamentos vacío
      // y mantener un esquema consistente incluyendo el campo 'error' (null en caso de éxito)
      return new Response(JSON.stringify({ error: null, medicamentos: [] }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error al buscar medicamentos:", error);
    return new Response(
      JSON.stringify({
        error: "Error al buscar medicamentos",
        medicamentos: [],
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
