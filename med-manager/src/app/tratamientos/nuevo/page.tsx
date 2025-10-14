"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { TratamientoForm } from "../components/TratamientoForm";
import { useMedicinas } from "@/hooks/useTratamientos";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function NuevoTratamientoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { medicinas, loading: loadingMedicinas, error: errorMedicinas } = useMedicinas();
  const { createTratamiento } = useTratamientos();

  const handleCreate = async (tratamiento: {
    name: string;
    patient: string;
    patientId?: string;
    patientType?: string;
    symptoms?: string;
    medications: any[];
    images?: any[];
    userId: string;
  }) => {
    try {
      console.log("Iniciando creación de tratamiento:", tratamiento);
      
      // Procesar imágenes para serialización
      const processedImages = tratamiento.images?.map(img => ({
        imageUrl: img.imageUrl,
        imageType: img.imageType,
        extractedText: img.extractedText,
        aiAnalysis: img.aiAnalysis
      })) || [];
      
      const processedTreatment = {
        ...tratamiento,
        images: processedImages
      };
      
      console.log("Tratamiento procesado:", processedTreatment);
      
      await createTratamiento(processedTreatment);
      console.log("Tratamiento creado exitosamente");
      
      toast.success("Tratamiento creado exitosamente");
      
      // Redirigir a la lista de tratamientos usando setTimeout para asegurar que se ejecute
      setTimeout(() => {
        console.log("Redirigiendo a /tratamientos después de crear...");
        router.push("/tratamientos");
      }, 100);
    } catch (error) {
      console.error("Error al crear tratamiento:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al crear tratamiento: ${errorMessage}`);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push("/tratamientos");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Cardio size={50} stroke={3} speed={1} color="var(--color-info)" />
      </div>
    );
  }

  if (loadingMedicinas) {
    return (
      <div className="flex justify-center items-center h-64">
        <Cardio size={50} stroke={3} speed={1} color="var(--color-info)" />
        <span className="ml-3 text-muted-foreground">Cargando medicamentos...</span>
      </div>
    );
  }

  if (errorMedicinas) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error al cargar medicamentos</p>
          <p className="text-sm text-muted-foreground mb-4">{errorMedicinas}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/tratamientos">
                Tratamientos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Nuevo Tratamiento</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Tratamiento</h1>
          <p className="text-muted-foreground">
            Crea un nuevo tratamiento médico con múltiples medicamentos
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Información del Tratamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TratamientoForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            medicinas={medicinas}
            userId={user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
