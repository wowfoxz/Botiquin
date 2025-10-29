"use client";

import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Tratamiento } from "@/types/tratamientos";
import { useMedicinas, useTratamientos } from "@/hooks/useTratamientos";
import { TratamientoForm } from "../../components/TratamientoForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cardio } from "ldrs/react";
import { ArrowLeft, Pencil } from "lucide-react";
import { toast } from "sonner";
import { config } from "@/lib/config";
import 'ldrs/react/Cardio.css';

export default function EditarTratamientoPage() {
  const router = useRouter();
  const params = useParams();
  const tratamientoId = params.id as string;
  
  const { user, isAuthenticated } = useAuth();
  const { medicinas, loading: loadingMedicinas, error: errorMedicinas } = useMedicinas();
  const { tratamientos, loading: loadingTratamientos, error: errorTratamientos, updateTratamiento } = useTratamientos();

  // Buscar el tratamiento a editar
  const tratamiento = tratamientos.find(t => t.id === tratamientoId);

  const handleUpdate = async (tratamientoData: {
    name: string;
    patient: string;
    patientId?: string;
    patientType?: string;
    symptoms?: string;
    medications: Array<{
      medicationId: string;
      dosage: number | string;
      frequencyHours: number | string;
      durationDays: number | string;
      startOption?: string;
      specificStartTime?: string | Date;
    }>;
    images?: Array<{
      id?: string;
      imageUrl: string;
      imageType: string;
      extractedText?: string;
      aiAnalysis?: string;
      createdAt?: Date | string;
    }>;
    userId: string;
  }) => {
    try {
      
      // Procesar imágenes para serialización
      const processedImages = tratamientoData.images?.map(img => ({
        id: img.id || '',
        treatmentId: tratamientoId,
        imageUrl: img.imageUrl,
        imageType: img.imageType,
        extractedText: img.extractedText,
        aiAnalysis: img.aiAnalysis,
        createdAt: img.createdAt || new Date(),
        updatedAt: new Date()
      })) || [];
      
      const processedTreatment = {
        ...tratamientoData,
        images: processedImages
      };
      
      
      await updateTratamiento(tratamientoId, processedTreatment as Partial<Tratamiento>);
      
      toast.success("Tratamiento actualizado exitosamente");
      
      // Redirigir a la lista de tratamientos usando setTimeout para asegurar que se ejecute
      setTimeout(() => {
        router.push("/tratamientos");
      }, 100);
    } catch (error) {
      console.error("Error al actualizar tratamiento:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al actualizar el tratamiento";
      toast.error(errorMessage);
      throw error; // Re-lanzar el error para que TratamientoForm lo capture
    }
  };

  if (loadingMedicinas || loadingTratamientos) {
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

  if (errorMedicinas || errorTratamientos) {
    return <p className="text-destructive">Error al cargar datos: {errorMedicinas || errorTratamientos}</p>;
  }

  if (!isAuthenticated || !user) {
    return <p className="text-destructive">Debe iniciar sesión para editar un tratamiento.</p>;
  }

  if (!tratamiento) {
    return <p className="text-destructive">Tratamiento no encontrado.</p>;
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`${config.BASE_PATH}/tratamientos`}>
                Tratamientos
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Editar Tratamiento</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/tratamientos")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Tratamiento</h1>
          <p className="text-muted-foreground">
            Modifica la información del tratamiento: {tratamiento.name}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Información del Tratamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TratamientoForm 
            initialData={tratamiento}
            medicinas={medicinas} 
            onSubmit={handleUpdate} 
            onCancel={() => router.push("/tratamientos")}
            userId={user.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
