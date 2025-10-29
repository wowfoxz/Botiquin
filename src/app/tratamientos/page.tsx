"use client";

import { useState, useEffect } from "react";
import {
  useTratamientos,
  useMedicinas
} from "@/hooks/useTratamientos";
import { useAuth } from "@/hooks/useAuth";
import { CrearTratamientoDialog } from "./components/CrearTratamientoDialog";
import { TratamientosActivos } from "./components/TratamientosActivos";
import { TratamientosHistoricos } from "./components/TratamientosHistoricos";
import { useRouter } from "next/navigation";
import {
  Pill,
  History
} from 'lucide-react';
import { Dock, DockItem, DockLabel, DockIcon } from '@/components/ui/dock';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css'

export default function TratamientosPage() {
  const [activeTab, setActiveTab] = useState<"activos" | "historicos">("activos");
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  // Obtener el usuario autenticado
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const {
    tratamientos,
    loading: loadingTratamientos,
    error: errorTratamientos,
    updateTratamiento,
    deleteTratamiento
  } = useTratamientos();

  const {
    medicinas,
    loading: loadingMedicinas,
    error: errorMedicinas
  } = useMedicinas();

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Controlar el estado de carga inicial
  useEffect(() => {
    if (!authLoading && !loadingTratamientos && !loadingMedicinas) {
      // Pequeño delay para evitar parpadeos
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading, loadingTratamientos, loadingMedicinas]);

  if (authLoading || loadingTratamientos || loadingMedicinas || initialLoading) {
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

  if (errorTratamientos || errorMedicinas) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-error">
          Error: {errorTratamientos?.toString() || errorMedicinas?.toString()}
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Filtrar tratamientos por usuario
  const tratamientosUsuario = tratamientos.filter(t => t.userId === user.id);
  const tratamientosActivos = tratamientosUsuario.filter(t => t.isActive === true);
  const tratamientosHistoricos = tratamientosUsuario.filter(t => t.isActive === false);

  // Datos para el dock
  const dockItems: { title: string; icon: React.ReactNode; id: "activos" | "historicos" }[] = [
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
        <CrearTratamientoDialog />
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
          />
        )}

        {activeTab === "historicos" && (
          <TratamientosHistoricos
            tratamientos={tratamientosHistoricos}
            medicinas={medicinas}
            userId={user.id}
            onDelete={deleteTratamiento}
          />
        )}
      </div>

      {/* Dock de navegación */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <Dock 
          className="items-end pb-3" 
          panelHeight={64} 
          magnification={72} 
          distance={120}
          spring={{ mass: 0.1, stiffness: 150, damping: 20 }}
        >
          {dockItems.map((item) => (
            <DockItem
              key={item.id}
              className="cursor-pointer"
              onClick={() => setActiveTab(item.id)}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon className={`aspect-square rounded-full flex items-center justify-center ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {item.icon}
              </DockIcon>
            </DockItem>
          ))}
        </Dock>
      </div>
    </div>
  );
}