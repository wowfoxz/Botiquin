import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface Consumidor {
  id: string;
  name: string;
  tipo: "usuario" | "perfil";
  rol?: string;
  foto?: string;
}

export const useConsumidoresGrupo = () => {
  const [consumidores, setConsumidores] = useState<Consumidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchConsumidores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !user) {
        setConsumidores([]);
        return;
      }

      const response = await fetch("/api/consumidores-grupo");
      if (!response.ok) {
        throw new Error("Error al obtener consumidores del grupo");
      }
      
      const data = await response.json();
      setConsumidores(data.consumidores || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error al obtener consumidores:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchConsumidores();
  }, [fetchConsumidores]);

  return {
    consumidores,
    loading,
    error,
    fetchConsumidores,
  };
};
