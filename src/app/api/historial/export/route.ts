import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que el usuario es adulto
    const usuario = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { grupo: true },
    });

    if (!usuario || usuario.rol !== "ADULTO") {
      return NextResponse.json(
        { error: "Acceso denegado. Solo adultos pueden exportar el historial." },
        { status: 403 }
      );
    }

    // Obtener parámetros de query para filtros
    const { searchParams } = new URL(request.url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtros: any = {}; // Prisma HistorialWhereInput type

    // Solo mostrar eventos del grupo familiar del usuario
    if (usuario.grupoId) {
      filtros.usuario = {
        grupoId: usuario.grupoId,
      };
    } else {
      filtros.usuarioId = session.userId;
    }

    // Aplicar filtros opcionales
    if (searchParams.get("usuario_id")) {
      filtros.usuarioId = searchParams.get("usuario_id");
    }

    if (searchParams.get("tipo_accion")) {
      filtros.tipoAccion = searchParams.get("tipo_accion");
    }

    if (searchParams.get("entidad_tipo")) {
      filtros.entidadTipo = searchParams.get("entidad_tipo");
    }

    if (searchParams.get("fecha_desde") || searchParams.get("fecha_hasta")) {
      filtros.createdAt = {};
      if (searchParams.get("fecha_desde")) {
        filtros.createdAt.gte = new Date(searchParams.get("fecha_desde")!);
      }
      if (searchParams.get("fecha_hasta")) {
        filtros.createdAt.lte = new Date(searchParams.get("fecha_hasta")!);
      }
    }

    // Obtener todos los registros (sin paginación para exportar)
    const historial = await prisma.historial.findMany({
      where: filtros,
      include: {
        usuario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Generar CSV
    const csvHeaders = [
      "Fecha y Hora",
      "Usuario",
      "Email Usuario",
      "Tipo de Acción",
      "Entidad",
      "ID Entidad",
      "Datos Previos",
      "Datos Posteriores",
      "Metadata",
    ];

    const csvRows = historial.map((item) => {
      const datosPrevios = item.datosPrevios ? JSON.stringify(JSON.parse(item.datosPrevios), null, 2) : "";
      const datosPosteriores = item.datosPosteriores ? JSON.stringify(JSON.parse(item.datosPosteriores), null, 2) : "";
      const metadata = item.metadata ? JSON.stringify(JSON.parse(item.metadata), null, 2) : "";

      return [
        item.createdAt.toISOString(),
        item.usuario.name || "Sin nombre",
        item.usuario.email,
        item.tipoAccion,
        item.entidadTipo,
        item.entidadId || "",
        datosPrevios.replace(/"/g, '""'), // Escapar comillas para CSV
        datosPosteriores.replace(/"/g, '""'),
        metadata.replace(/"/g, '""'),
      ];
    });

    // Convertir a CSV
    const csvContent = [
      csvHeaders.map(header => `"${header}"`).join(","),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n");

    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `historial-${timestamp}.csv`;

    // Retornar archivo CSV
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Error al exportar historial:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
