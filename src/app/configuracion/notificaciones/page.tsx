"use client";

import { useState, useEffect } from "react";
import { NotificacionesTab } from "../components/NotificacionesTab";
import { useNotificaciones, usePreferenciasNotificaciones } from "@/hooks/useTratamientos";
import { useTratamientos } from "@/hooks/useTratamientos";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { config } from "@/lib/config";
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css';

export default function NotificacionesPage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  // Obtener el usuario autenticado
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const { tratamientos, loading: loadingTratamientos } = useTratamientos();
  const { notificaciones } = useNotificaciones();
  const {
    preferencias,
    loading: loadingPreferencias,
    error: errorPreferencias,
    updatePreferencias
  } = usePreferenciasNotificaciones();

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Controlar el estado de carga inicial
  useEffect(() => {
    if (!authLoading && !loadingTratamientos && !loadingPreferencias) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, loadingTratamientos, loadingPreferencias]);

  if (authLoading || loadingTratamientos || loadingPreferencias || initialLoading) {
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

  if (errorPreferencias) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-error">
          Error: {errorPreferencias?.toString()}
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Filtrar tratamientos por usuario
  const tratamientosUsuario = tratamientos.filter(t => t.userId === user.id);

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`${config.BASE_PATH}/configuracion`}>
                Configuración
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Preferencias de Notificaciones</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <NotificacionesTab
        preferencias={preferencias}
        notificaciones={notificaciones}
        tratamientos={tratamientosUsuario}
        onUpdatePreferencias={updatePreferencias}
      />
    </div>
  );
}

