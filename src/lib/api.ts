// Helper para manejar llamadas API con basePath
import { config } from './config';

/**
 * Helper para hacer fetch agregando automáticamente el basePath
 */
export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${config.BASE_PATH}${path}`;
  return fetch(url, options);
}

/**
 * Obtiene la URL completa con basePath
 */
export function getApiUrl(path: string): string {
  return `${config.BASE_PATH}${path}`;
}

