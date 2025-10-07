"use client";

import { useState, useEffect } from "react";
import {
  useTratamientos,
  useMedicinas,
  useNotificaciones,
  usePreferenciasNotificaciones
} from "@/hooks/useTratamientos";
import { useAuth } from "@/hooks/useAuth";
import { Tratamiento, PreferenciasNotificaciones } from "@/types/tratamientos";
import { CrearTratamientoDialog } from "./components/CrearTratamientoDialog";
import { TratamientosActivos } from "./components/TratamientosActivos";
import { TratamientosHistoricos } from "./components/TratamientosHistoricos";
import { NotificacionesTab } from "./components/NotificacionesTab";
import { useRouter } from "next/navigation";
import {
  Pill,
  History,
  Bell
} from 'lucide-react';
import { Dock, DockItem, DockLabel, DockIcon } from '@/components/ui/dock';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function TratamientosPage() {
  const [activeTab, setActiveTab] = useState<"activos" | "historicos" | "notificaciones">("activos");
  const router = useRouter();
  
  // Obtener el usuario autenticado
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const { 
    tratamientos, 
    loading: loadingTratamientos, 
    error: errorTratamientos, 
    createTratamiento, 
    updateTratamiento, 
    deleteTratamiento 
  } = useTratamientos();
  
  const { 
    medicinas, 
    loading: loadingMedicinas, 
    error: errorMedicinas 
  } = useMedicinas();
  
  const { 
    notificaciones 
  } = useNotificaciones();
  
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

  if (authLoading || loadingTratamientos || loadingMedicinas || loadingPreferencias) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  if (errorTratamientos || errorMedicinas || errorPreferencias) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-error">
          Error: {errorTratamientos?.toString() || errorMedicinas?.toString() || errorPreferencias?.toString()}
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Filtrar tratamientos por usuario
  const tratamientosUsuario = tratamientos.filter(t => t.userId === user.id);
  const tratamientosActivos = tratamientosUsuario.filter(t => t.isActive === true);
  const tratamientosHistoricos = tratamientosUsuario.filter(t => t.isActive === false);

  // Obtener nombre de medicamento por ID
  const obtenerNombreMedicamento = (id: string) => {
    const medicina = medicinas.find(m => m.id === id);
    return medicina ? medicina.commercialName : "Medicamento no encontrado";
  };
  // Datos para el dock
  const dockItems: { title: string; icon: React.ReactNode; id: "activos" | "historicos" | "notificaciones" }[] = [
    {
      title: 'Activos',
      icon: (
        <Pill className='h-full w-full text-primary-foreground dark:text-primary-foreground' />
      ),
      id: 'activos'
    },
    {
      title: 'Historial',
      icon: (
        <History className='h-full w-full text-primary-foreground dark:primary-foreground' />
      ),
      id: 'historicos'
    },
    {
      title: 'Notificaciones',
      icon: (
        <Bell className='h-full w-full text-primary-foreground dark:text-primary-foreground' />
      ),
      id: 'notificaciones'
    }
  ];

  return (
    <div className="container mx-auto py-15">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Gestión de Tratamientos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Tratamientos</h1>
        {activeTab !== "notificaciones" && (
          <CrearTratamientoDialog
            onCreate={createTratamiento}
            medicinas={medicinas}
            userId={user.id}
          />
        )}
      </div>

      {/* Contenido según la pestaña activa */}
      <div className="mb-24">
        {activeTab === "activos" && (
          <TratamientosActivos
            tratamientos={tratamientosActivos}
            medicinas={medicinas}
            userId={user.id}
            onUpdate={updateTratamiento}
            onFinalizar={(id) => updateTratamiento(id, { isActive: false })}
            obtenerNombreMedicamento={obtenerNombreMedicamento}
          />
        )}

        {activeTab === "historicos" && (
          <TratamientosHistoricos
            tratamientos={tratamientosHistoricos}
            medicinas={medicinas}
            userId={user.id}
            onDelete={deleteTratamiento}
            obtenerNombreMedicamento={obtenerNombreMedicamento}
          />
        )}

        {activeTab === "notificaciones" && (
          <NotificacionesTab
            preferencias={preferencias}
            notificaciones={notificaciones}
            tratamientos={tratamientosUsuario}
            onUpdatePreferencias={updatePreferencias}
          />
        )}
      </div>

      {/* Dock de navegación */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <Dock className="items-end pb-3">
          {dockItems.map((item) => (
            <DockItem
              key={item.id}
              className={`aspect-square rounded-full bg-primary dark:bg-primary cursor-pointer transition-all duration-200 flex items-center justify-center ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-info hover:text-accent-foreground text-neutral-foreground dark:text-neutral-foreground'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon className={activeTab === item.id ? 'text-primary-foreground' : 'text-neutral-foreground dark:text-neutral-foreground'}>{item.icon}</DockIcon>
            </DockItem>
          ))}
        </Dock>
      </div>
    </div>
  );
}