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

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
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
    const params = await context.params;
    const id = params.id;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID de lista no proporcionado" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verificar que la lista pertenece al usuario
    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!shoppingList) {
      return new Response(
        JSON.stringify({ error: "Lista de compras no encontrada" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Eliminar items asociados (si existen) y luego la lista dentro de una transacción
    await prisma.$transaction([
      prisma.shoppingItem.deleteMany({
        where: {
          shoppingListId: id,
        },
      }),
      prisma.shoppingList.delete({
        where: {
          id: id,
        },
      }),
    ]);

    return new Response(
      JSON.stringify({ message: "Lista de compras eliminada correctamente" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error al eliminar lista de compras:", error);
    return new Response(
      JSON.stringify({
        error: "Error al eliminar lista de compras",
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
