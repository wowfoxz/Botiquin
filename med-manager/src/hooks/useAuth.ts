import { useState, useEffect, useCallback } from "react";

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
      const response = await fetch("/api/auth", { method: "GET" });
      
      if (response.ok) {
        const { user, session }: { user: User; session: Session } = await response.json();
        setUser(user);
      } else {
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
  }, [fetchUser]);

  const logout = async () => {
    try {
      // Llamar a la acción de logout del servidor
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setUser(null);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  };
};