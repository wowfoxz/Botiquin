import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { TipoAccion, TipoEntidad } from "@/lib/auditoria";

// Tipos para filtros y paginación
interface FiltrosHistorial {
  usuarioId?: string;
  tipoAccion?: string;
  entidadTipo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: string;
  limit?: string;
}

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

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const filtros: FiltrosHistorial = {
      usuarioId: searchParams.get("usuario_id") || undefined,
      tipoAccion: searchParams.get("tipo_accion") || undefined,
      entidadTipo: searchParams.get("entidad_tipo") || undefined,
      fechaDesde: searchParams.get("fecha_desde") || undefined,
      fechaHasta: searchParams.get("fecha_hasta") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    };

    // Verificar que el usuario solo pueda ver historial de su grupo familiar
    const usuario = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { grupo: true },
    });

    if (!usuario || usuario.rol !== "ADULTO") {
      return NextResponse.json(
        { error: "Acceso denegado. Solo adultos pueden ver el historial." },
        { status: 403 }
      );
    }

    // Construir condiciones de filtro
    const whereConditions: any = {};

    // Solo mostrar eventos del grupo familiar del usuario
    if (usuario.grupoId) {
      whereConditions.usuario = {
        grupoId: usuario.grupoId,
      };
    } else {
      // Si no tiene grupo, solo sus propias acciones
      whereConditions.usuarioId = session.userId;
    }

    // Aplicar filtros opcionales
    if (filtros.usuarioId) {
      whereConditions.usuarioId = filtros.usuarioId;
    }

    if (filtros.tipoAccion) {
      whereConditions.tipoAccion = filtros.tipoAccion;
    }

    if (filtros.entidadTipo) {
      whereConditions.entidadTipo = filtros.entidadTipo;
    }

    if (filtros.fechaDesde || filtros.fechaHasta) {
      whereConditions.createdAt = {};
      if (filtros.fechaDesde) {
        whereConditions.createdAt.gte = new Date(filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        whereConditions.createdAt.lte = new Date(filtros.fechaHasta);
      }
    }

    // Configurar paginación
    const page = parseInt(filtros.page || "1");
    const limit = Math.min(parseInt(filtros.limit || "20"), 100); // Máximo 100 por página
    const skip = (page - 1) * limit;

    // Obtener historial con paginación
    const [historial, total] = await Promise.all([
      prisma.historial.findMany({
        where: whereConditions,
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
        skip,
        take: limit,
      }),
      prisma.historial.count({
        where: whereConditions,
      }),
    ]);

    // Procesar datos para el frontend
    const historialProcesado = historial.map((item) => ({
      id: item.id,
      usuario: {
        id: item.usuario.id,
        name: item.usuario.name,
        email: item.usuario.email,
      },
      tipoAccion: item.tipoAccion,
      entidadTipo: item.entidadTipo,
      entidadId: item.entidadId,
      datosPrevios: item.datosPrevios ? JSON.parse(item.datosPrevios) : null,
      datosPosteriores: item.datosPosteriores ? JSON.parse(item.datosPosteriores) : null,
      metadata: item.metadata ? JSON.parse(item.metadata) : null,
      createdAt: item.createdAt,
    }));

    // Calcular información de paginación
    const totalPaginas = Math.ceil(total / limit);
    const hasNextPage = page < totalPaginas;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: historialProcesado,
      pagination: {
        page,
        limit,
        total,
        totalPages: totalPaginas,
        hasNextPage,
        hasPrevPage,
      },
    });

  } catch (error) {
    console.error("Error al obtener historial:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para obtener opciones de filtros
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const usuario = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { grupo: true },
    });

    if (!usuario || usuario.rol !== "ADULTO") {
      return NextResponse.json(
        { error: "Acceso denegado. Solo adultos pueden ver el historial." },
        { status: 403 }
      );
    }

    // Obtener opciones para filtros
    const whereConditions: any = {};
    if (usuario.grupoId) {
      whereConditions.usuario = {
        grupoId: usuario.grupoId,
      };
    } else {
      whereConditions.usuarioId = session.userId;
    }

    const [usuarios, tiposAccion, tiposEntidad] = await Promise.all([
      // Usuarios del grupo
      prisma.user.findMany({
        where: usuario.grupoId ? { grupoId: usuario.grupoId } : { id: session.userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { name: "asc" },
      }),
      // Tipos de acción únicos
      prisma.historial.findMany({
        where: whereConditions,
        select: { tipoAccion: true },
        distinct: ["tipoAccion"],
        orderBy: { tipoAccion: "asc" },
      }),
      // Tipos de entidad únicos
      prisma.historial.findMany({
        where: whereConditions,
        select: { entidadTipo: true },
        distinct: ["entidadTipo"],
        orderBy: { entidadTipo: "asc" },
      }),
    ]);

    return NextResponse.json({
      usuarios: usuarios,
      tiposAccion: tiposAccion.map((item) => item.tipoAccion),
      tiposEntidad: tiposEntidad.map((item) => item.entidadTipo),
    });

  } catch (error) {
    console.error("Error al obtener opciones de filtros:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
