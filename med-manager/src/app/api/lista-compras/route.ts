import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface SessionUser {
  userId: string;
  email?: string;
  name?: string;
}

interface ServerSession {
  userId: string;
  user?: SessionUser;
}

export async function GET() {
  try {
    // Obtener la sesión del usuario
    const session = (await getServerSession()) as ServerSession | null;

    if (!session || !session.userId) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const userId: string = session.userId;

    // Obtener todas las listas de compras del usuario
    const shoppingLists = await prisma.shoppingList.findMany({
      where: {
        userId: userId,
        isArchived: false,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new Response(JSON.stringify(shoppingLists), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error al obtener listas de compras:", error);
    return new Response(
      JSON.stringify({
        error: "Error al obtener listas de compras",
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

interface ShoppingItemCreate {
  name: string;
  presentation?: string;
  laboratory?: string;
  price: number;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const session = (await getServerSession()) as ServerSession | null;

    if (!session || !session.userId) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const userId = session.userId;
    const body = await request.json();
    const { name, items, total } = body;

    if (!name || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "Datos inválidos" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Crear la lista de compras con sus items
    const shoppingList = await prisma.shoppingList.create({
      data: {
        name,
        total,
        userId,
        items: {
          create: items.map((item: ShoppingItemCreate) => ({
            name: item.name,
            presentation: item.presentation,
            laboratory: item.laboratory,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return new Response(JSON.stringify(shoppingList), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error al crear lista de compras:", error);
    return new Response(
      JSON.stringify({
        error: "Error al crear lista de compras",
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
