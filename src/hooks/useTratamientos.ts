import { useState, useEffect, useCallback } from "react";
import {
  Medicamento,
  Tratamiento,
  Notificacion,
  PreferenciasNotificaciones,
} from "@/types/tratamientos";
import { useAuth } from "@/hooks/useAuth";
import { toast } from 'sonner';
import { apiFetch } from "@/lib/api";

// Hook para manejar tratamientos
export const useTratamientos = () => {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Obtener todos los tratamientos del usuario autenticado
  const fetchTratamientos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !user) {
        setTratamientos([]);
        return;
      }

      const response = await apiFetch(`/api/tratamientos?userId=${user.id}`);
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
  }, [isAuthenticated, user]);

  // Crear un nuevo tratamiento
  const createTratamiento = async (
    tratamiento: {
      name: string;
      patient: string;
      patientId?: string;
      patientType?: string;
      symptoms?: string;
      medications: unknown[];
      images?: unknown[];
      userId: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Enviando solicitud para crear tratamiento:", tratamiento);
      const response = await apiFetch("/api/tratamientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tratamiento),
      });

      console.log("Respuesta del servidor:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }

      const newTratamiento = await response.json();
      console.log("Tratamiento creado exitosamente:", newTratamiento);
      setTratamientos((prev) => [...prev, newTratamiento]);
      // No mostrar toast aquí, se maneja en la página
      return newTratamiento;
    } catch (err) {
      console.error("Error en createTratamiento:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast.error('Error al crear el tratamiento');
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
      const response = await apiFetch(`/api/tratamientos/${id}`, {
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
      // No mostrar toast aquí, se maneja en la página
      return updatedTratamiento;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error('Error al actualizar el tratamiento');
      throw err;
    }
  };

  // Eliminar un tratamiento
  const deleteTratamiento = async (id: string) => {
    try {
      const response = await apiFetch(`/api/tratamientos/${id}`, {
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
      toast.success('Tratamiento eliminado exitosamente');
    } catch (err) {
      console.error("Error en deleteTratamiento:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error('Error al eliminar el tratamiento');
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
  const { user, isAuthenticated } = useAuth();

  const fetchMedicinas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !user) {
        setMedicinas([]);
        return;
      }

      const response = await apiFetch(`/api/medicinas?userId=${user.id}`);
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
  }, [isAuthenticated, user]);

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
  const { user, isAuthenticated } = useAuth();

  const fetchNotificaciones = useCallback(async () => {
    try {
      if (!isAuthenticated || !user) {
        setNotificaciones([]);
        return;
      }

      const response = await apiFetch(`/api/notificaciones?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Error al obtener notificaciones");
      }
      const data = await response.json();
      setNotificaciones(data);
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchNotificaciones();
  }, [fetchNotificaciones]);

  return {
    notificaciones,
    fetchNotificaciones,
  };
};

// Hook para manejar preferencias de notificaciones
export const usePreferenciasNotificaciones = () => {
  const [preferencias, setPreferencias] =
    useState<PreferenciasNotificaciones | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchPreferencias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !user) {
        setPreferencias(null);
        return;
      }

      const response = await apiFetch(
        `/api/preferencias-notificaciones?userId=${user.id}`
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
  }, [isAuthenticated, user]);

  const updatePreferencias = async (
    preferenciasData: Partial<PreferenciasNotificaciones>
  ) => {
    try {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const response = await apiFetch("/api/preferencias-notificaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, ...preferenciasData }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar preferencias");
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
    fetchPreferencias();
  }, [fetchPreferencias]);

  return {
    preferencias,
    loading,
    error,
    fetchPreferencias,
    updatePreferencias,
  };
};
