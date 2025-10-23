import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
}

interface Session {
  userId: string;
  expires: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      
      // Hacer una llamada a la API para obtener la información de la sesión
      const response = await apiFetch("/api/auth", { 
        method: "GET",
        credentials: 'include' // Asegurar que se incluyan las cookies
      });
      
      if (response.ok) {
        const { user, session }: { user: User; session: Session } = await response.json();
        setUser(user);
      } else if (response.status === 401) {
        // Sesión expirada o no válida, limpiar usuario
        setUser(null);
      } else {
        console.error("Error inesperado al obtener la sesión:", response.status);
        setUser(null);
      }
    } catch (error) {
      console.error("Error al obtener la sesión:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Escuchar el evento de login para actualizar el usuario
    const handleUserLogin = () => {
      fetchUser();
    };

    window.addEventListener('user-login', handleUserLogin);

    return () => {
      window.removeEventListener('user-login', handleUserLogin);
    };
  }, [fetchUser]);

  const logout = async () => {
    try {
      // Llamar a la acción de logout del servidor
      const response = await apiFetch("/api/auth/logout", { 
        method: "POST",
        credentials: 'include' // Asegurar que se incluyan las cookies
      });
      if (response.ok) {
        setUser(null);
        // Redirigir al login después del logout
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        window.location.href = basePath + '/login';
      } else {
        console.error("Error al cerrar sesión:", response.status);
        // Aún así limpiar el usuario local
        setUser(null);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Aún así limpiar el usuario local
      setUser(null);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };
};