// Helper para manejar llamadas API con basePath
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * Helper para hacer fetch agregando automáticamente el basePath
 */
export async function apiFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = `${basePath}${path}`;
  return fetch(url, options);
}

/**
 * Obtiene la URL completa con basePath
 */
export function getApiUrl(path: string): string {
  return `${basePath}${path}`;
}

