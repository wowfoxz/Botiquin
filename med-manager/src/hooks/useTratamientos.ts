import { useState, useEffect, useCallback } from "react";
import {
  Medicamento,
  Tratamiento,
  Notificacion,
  PreferenciasNotificaciones,
} from "@/types/tratamientos";

// Hook para manejar tratamientos
export const useTratamientos = () => {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los tratamientos
  const fetchTratamientos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/tratamientos");
      if (!response.ok) {
        throw new Error("Error al obtener tratamientos");
      }
      const data = await response.json();
      setTratamientos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear un nuevo tratamiento
  const createTratamiento = async (
    tratamiento: Omit<Tratamiento, "id" | "createdAt" | "updatedAt">
  ) => {
    setLoading(true);
    try {
      console.log("Enviando solicitud para crear tratamiento:", tratamiento);
      const response = await fetch("/api/tratamientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tratamiento),
      });

      console.log(
        "Respuesta del servidor:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        // Intentar extraer un mensaje más descriptivo del body (JSON o texto)
        let serverMessage: string | null = null;
        try {
          const json = await response.json();
          if (json && typeof json === "object" && "message" in json) {
            serverMessage = String((json as { message: string }).message);
          } else {
            serverMessage = JSON.stringify(json);
          }
        } catch {
          try {
            serverMessage = await response.text();
          } catch {
            serverMessage = null;
          }
        }
        const messageDetail = serverMessage ? ` - ${serverMessage}` : "";
        console.error(
          "Error del servidor:",
          response.status,
          response.statusText,
          serverMessage ?? ""
        );
        throw new Error(
          `Error al crear tratamiento: ${response.status} ${response.statusText}${messageDetail}`
        );
      }

      const newTratamiento = await response.json();
      console.log("Tratamiento creado exitosamente:", newTratamiento);
      // Usar el callback para evitar problemas con estado desactualizado
      setTratamientos((prev) => [...prev, newTratamiento]);
      return newTratamiento;
    } catch (err) {
      console.error("Error en createTratamiento:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un tratamiento
  const updateTratamiento = async (
    id: string,
    tratamiento: Partial<Tratamiento>
  ) => {
    try {
      const response = await fetch(`/api/tratamientos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tratamiento),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar tratamiento");
      }

      const updatedTratamiento = await response.json();
      setTratamientos(
        tratamientos.map((t) => (t.id === id ? updatedTratamiento : t))
      );
      return updatedTratamiento;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    }
  };

  // Eliminar un tratamiento
  const deleteTratamiento = async (id: string) => {
    try {
      const response = await fetch(`/api/tratamientos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        throw new Error(
          `Error al eliminar tratamiento: ${response.status} ${response.statusText}`
        );
      }

      setTratamientos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error en deleteTratamiento:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    }
  };

  useEffect(() => {
    fetchTratamientos();
  }, [fetchTratamientos]);

  return {
    tratamientos,
    loading,
    error,
    fetchTratamientos,
    createTratamiento,
    updateTratamiento,
    deleteTratamiento,
  };
};

// Hook para manejar medicinas
export const useMedicinas = () => {
  const [medicinas, setMedicinas] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicinas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/medicinas");
      if (!response.ok) {
        throw new Error("Error al obtener medicinas");
      }
      const data = await response.json();
      setMedicinas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicinas();
  }, [fetchMedicinas]);

  return {
    medicinas,
    loading,
    error,
    fetchMedicinas,
  };
};

// Hook para manejar notificaciones
export const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotificaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/notificaciones");
      if (!response.ok) {
        throw new Error("Error al obtener notificaciones");
      }
      const data = await response.json();
      setNotificaciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNotificacion = async (notificacion: Omit<Notificacion, "id">) => {
    try {
      const response = await fetch("/api/notificaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificacion),
      });

      if (!response.ok) {
        throw new Error("Error al crear notificación");
      }

      const newNotificacion = await response.json();
      setNotificaciones((prev) => [...prev, newNotificacion]);
      return newNotificacion;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  return {
    notificaciones,
    loading,
    error,
    fetchNotificaciones,
    createNotificacion,
  };
};

// Hook para manejar preferencias de notificaciones
export const usePreferenciasNotificaciones = (userId: string) => {
  const [preferencias, setPreferencias] =
    useState<PreferenciasNotificaciones | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/preferencias-notificaciones/${userId}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener preferencias de notificaciones");
      }
      const data = await response.json();
      setPreferencias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updatePreferencias = async (
    preferencias: Omit<PreferenciasNotificaciones, "id" | "userId">
  ) => {
    try {
      const response = await fetch("/api/preferencias-notificaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...preferencias, userId }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar preferencias de notificaciones");
      }

      const updatedPreferencias = await response.json();
      setPreferencias(updatedPreferencias);
      return updatedPreferencias;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPreferencias();
    }
  }, [fetchPreferencias, userId]);

  return {
    preferencias,
    loading,
    error,
    fetchPreferencias,
    updatePreferencias,
  };
};
