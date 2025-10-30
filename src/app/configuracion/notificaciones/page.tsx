"use client";

import { useState, useEffect } from "react";
import { NotificacionesTab } from "../components/NotificacionesTab";
import { usePreferenciasNotificaciones } from "@/hooks/useTratamientos";
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
    if (!authLoading && !loadingPreferencias) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, loadingPreferencias]);

  if (authLoading || loadingPreferencias || initialLoading) {
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
        <div className="text-[var(--color-error)]">
          Error: {errorPreferencias?.toString()}
        </div>
      </div>
    );
  }

  if (!user) return null;

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
        onUpdatePreferencias={updatePreferencias}
      />
    </div>
  );
}

