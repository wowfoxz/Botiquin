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

  // Filtrar tratamientos por usuario autenticado
  const tratamientosUsuario = user ? tratamientos.filter(t => t.userId === user.id) : [];
  
  const handleCreateTratamiento = async (tratamientoData: Omit<Tratamiento, "id" | "createdAt" | "updatedAt">) => {
    if (!user) return;
    
    try {
      await createTratamiento({
        ...tratamientoData,
        userId: user.id
      });
    } catch (error) {
      console.error("Error al crear tratamiento:", error);
    }
  };

  const handleUpdateTratamiento = async (id: string, tratamientoData: Partial<Tratamiento>) => {
    try {
      await updateTratamiento(id, tratamientoData);
    } catch (error) {
      console.error("Error al actualizar tratamiento:", error);
    }
  };

  const handleDeleteTratamiento = async (id: string) => {
    try {
      await deleteTratamiento(id);
    } catch (error) {
      console.error("Error al eliminar tratamiento:", error);
    }
  };

  const handleFinalizarTratamiento = async (id: string) => {
    try {
      await updateTratamiento(id, { isActive: false });
    } catch (error) {
      console.error("Error al finalizar tratamiento:", error);
    }
  };

  const handleUpdatePreferencias = async (preferenciasData: Partial<PreferenciasNotificaciones>) => {
    if (!user) return;
    
    try {
      await updatePreferencias({
        ...preferenciasData,
        userId: user.id
      });
    } catch (error) {
      console.error("Error al actualizar preferencias:", error);
    }
  };

  const obtenerNombreMedicamento = (medicinaId: string) => {
    const medicina = medicinas.find(m => m.id === medicinaId);
    return medicina ? medicina.commercialName : "Medicamento desconocido";
  };

  // Mostrar estado de carga
  if (authLoading || loadingTratamientos || loadingMedicinas || loadingPreferencias) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Verificar autenticación
  if (!isAuthenticated || !user) {
    return null; // El efecto redirigirá al login
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Tratamientos</h1>
        <CrearTratamientoDialog 
          onCreate={handleCreateTratamiento}
          medicinas={medicinas}
          userId={user.id}
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("activos")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "activos"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Tratamientos Activos
          </button>
          <button
            onClick={() => setActiveTab("historicos")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "historicos"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setActiveTab("notificaciones")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "notificaciones"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Notificaciones
          </button>
        </nav>
      </div>

      {/* Contenido de las tabs */}
      {activeTab === "activos" && (
        <TratamientosActivos 
          tratamientos={tratamientosUsuario.filter(t => t.isActive)}
          medicinas={medicinas}
          userId={user.id}
          onUpdate={handleUpdateTratamiento}
          onFinalizar={handleFinalizarTratamiento}
          obtenerNombreMedicamento={obtenerNombreMedicamento}
        />
      )}

      {activeTab === "historicos" && (
        <TratamientosHistoricos 
          tratamientos={tratamientosUsuario.filter(t => !t.isActive)}
          medicinas={medicinas}
          userId={user.id}
          onDelete={handleDeleteTratamiento}
          obtenerNombreMedicamento={obtenerNombreMedicamento}
        />
      )}

      {activeTab === "notificaciones" && (
        <NotificacionesTab 
          notificaciones={notificaciones}
          tratamientos={tratamientosUsuario}
          preferencias={preferencias}
          onUpdatePreferencias={handleUpdatePreferencias}
        />
      )}
    </div>
  );
}