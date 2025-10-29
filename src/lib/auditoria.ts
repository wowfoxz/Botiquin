import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

// Tipos para el sistema de auditoría
export interface MetadataAuditoria {
  ip?: string;
  userAgent?: string;
  dispositivo?: string;
  ubicacion?: string;
  [key: string]: unknown;
}

export interface DatosAuditoria {
  usuarioId: string;
  tipoAccion: TipoAccion;
  entidadTipo: TipoEntidad;
  entidadId?: string;
  datosPrevios?: unknown;
  datosPosteriores?: unknown;
  metadata?: MetadataAuditoria;
}

// Enums para tipos de acción y entidad
export enum TipoAccion {
  LOGIN = "login",
  LOGIN_FALLIDO = "login_fallido",
  LOGOUT = "logout",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  SEARCH = "search",
  VIEW = "view",
  EXPORT = "export",
  IMPORT = "import",
  ARCHIVE = "archive",
  UNARCHIVE = "unarchive",
}

export enum TipoEntidad {
  USUARIO = "usuario",
  PERFIL = "perfil",
  MEDICAMENTO = "medicamento",
  TOMA = "toma",
  LISTA_COMPRA = "lista_compra",
  TRATAMIENTO = "tratamiento",
  NOTIFICACION = "notificacion",
  GRUPO_FAMILIAR = "grupo_familiar",
  SESION = "sesion",
}

/**
 * Registra una acción en el historial de auditoría
 */
export async function registrarAuditoria(datos: DatosAuditoria): Promise<void> {
  try {
    await prisma.historial.create({
      data: {
        usuarioId: datos.usuarioId,
        tipoAccion: datos.tipoAccion,
        entidadTipo: datos.entidadTipo,
        entidadId: datos.entidadId || null,
        datosPrevios: datos.datosPrevios ? JSON.stringify(datos.datosPrevios) : null,
        datosPosteriores: datos.datosPosteriores ? JSON.stringify(datos.datosPosteriores) : null,
        metadata: datos.metadata ? JSON.stringify(datos.metadata) : null,
      },
    });
  } catch (error) {
    console.error("Error al registrar auditoría:", error);
    // No lanzamos el error para no interrumpir la operación principal
  }
}

/**
 * Extrae metadata del request
 */
export function extraerMetadataRequest(request: NextRequest): MetadataAuditoria {
  const userAgent = request.headers.get("user-agent") || "";
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  // Determinar IP (considerando proxies)
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";
  
  // Detectar dispositivo básico del user-agent
  const esMovil = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const dispositivo = esMovil ? "móvil" : "desktop";
  
  return {
    ip,
    userAgent: userAgent.substring(0, 500), // Limitar tamaño
    dispositivo,
  };
}

/**
 * Helper para registrar acciones de CRUD
 */
export async function registrarAccionCRUD(
  usuarioId: string,
  tipoAccion: TipoAccion,
  entidadTipo: TipoEntidad,
  entidadId: string,
  datosPrevios?: unknown,
  datosPosteriores?: unknown,
  metadata?: MetadataAuditoria
): Promise<void> {
  await registrarAuditoria({
    usuarioId,
    tipoAccion,
    entidadTipo,
    entidadId,
    datosPrevios,
    datosPosteriores,
    metadata,
  });
}

/**
 * Helper para registrar acciones de autenticación
 */
export async function registrarAccionAuth(
  usuarioId: string | null,
  tipoAccion: TipoAccion,
  metadata?: MetadataAuditoria
): Promise<void> {
  if (!usuarioId) {
    // Para login fallido, no tenemos usuarioId
    // En este caso, no registramos nada ya que no podemos asociar el evento a un usuario
    console.log("Login fallido detectado:", { tipoAccion, metadata });
    return;
  }

  await registrarAuditoria({
    usuarioId,
    tipoAccion,
    entidadTipo: TipoEntidad.SESION,
    metadata,
  });
}

/**
 * Helper para registrar búsquedas
 */
export async function registrarBusqueda(
  usuarioId: string,
  termino: string,
  entidadTipo: TipoEntidad,
  resultados: number,
  metadata?: MetadataAuditoria
): Promise<void> {
  await registrarAuditoria({
    usuarioId,
    tipoAccion: TipoAccion.SEARCH,
    entidadTipo,
    metadata: {
      ...metadata,
      terminoBusqueda: termino,
      cantidadResultados: resultados,
    },
  });
}

/**
 * Helper para registrar visualizaciones de detalles
 */
export async function registrarVisualizacion(
  usuarioId: string,
  entidadTipo: TipoEntidad,
  entidadId: string,
  metadata?: MetadataAuditoria
): Promise<void> {
  await registrarAuditoria({
    usuarioId,
    tipoAccion: TipoAccion.VIEW,
    entidadTipo,
    entidadId,
    metadata,
  });
}
