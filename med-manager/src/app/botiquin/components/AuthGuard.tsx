"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Mostrar loader mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div style={{ display: 'grid', placeContent: 'center', height: '100vh' }}>
        <Cardio
          size={70}
          stroke={5}
          speed={1}
          color="var(--color-info)"
        />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}