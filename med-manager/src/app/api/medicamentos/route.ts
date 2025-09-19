import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
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

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error al buscar medicamentos:", error);
    return new Response(
      JSON.stringify({ error: "Error al buscar medicamentos" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
