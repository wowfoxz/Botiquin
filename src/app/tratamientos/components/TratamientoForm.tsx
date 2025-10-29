"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { PatientSelector } from "@/components/ui/patient-selector";
import { MedicationSelector } from "@/components/ui/medication-selector";
import { TreatmentImageUploader } from "@/components/ui/treatment-image-uploader";
import { toast } from "sonner";
import { Cardio } from "ldrs/react";
import { Plus, Save } from "lucide-react";
import 'ldrs/react/Cardio.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { treatmentSchema, type TreatmentFormData, type TreatmentMedicationFormData } from '@/lib/validations';

interface TreatmentImage {
  id: string;
  file: File;
  imageType: "receta" | "instrucciones";
  imageUrl: string;
  extractedText?: string;
  aiAnalysis?: string;
  isAnalyzing?: boolean;
}

interface TratamientoFormProps {
  onSubmit: (tratamiento: {
    name: string;
    patient: string;
    patientId?: string;
    patientType?: string;
    symptoms?: string;
    medications: TreatmentMedicationFormData[];
    images?: TreatmentImage[];
    userId: string;
  }) => Promise<void>;
  onCancel: () => void;
  medicinas: Medicamento[];
  userId: string;
  initialData?: Partial<Tratamiento>;
}

export function TratamientoForm({ onSubmit, onCancel, medicinas, userId, initialData }: TratamientoFormProps) {
  console.log('🟣 TratamientoForm - Componente renderizado/re-renderizado');
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData; // Determinar si está en modo edición
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
    type: "usuario" | "perfil";
    rol?: string;
  } | null>(null);
  const [medications, setMedications] = useState<TreatmentMedicationFormData[]>([]);
  const [images, setImages] = useState<TreatmentImage[]>([]);

  // ✅ Log para detectar montaje/desmontaje del componente
  useEffect(() => {
    console.log('✅ TratamientoForm - Componente MONTADO');
    return () => {
      console.log('❌ TratamientoForm - Componente DESMONTADO');
    };
  }, []);

  // ✅ Log para debug: detectar cambios en images
  useEffect(() => {
    console.log('🔴 TratamientoForm - Estado images cambió:', images.length);
  }, [images]);

  // Inicializar datos cuando se está editando
  useEffect(() => {
    console.log('🟡 TratamientoForm - useEffect initialData disparado:', !!initialData);
    if (initialData) {
      // Configurar paciente seleccionado
      if (initialData.patientId && initialData.patientType) {
        setSelectedPatient({
          id: initialData.patientId,
          name: initialData.patient || '',
          type: initialData.patientType as "usuario" | "perfil"
        });
      }

      // Configurar medicamentos (convertir de la estructura de BD a la del formulario)
      if (initialData.medications) {
        const formMedications: TreatmentMedicationFormData[] = initialData.medications.map(med => ({
          medicationId: med.medicationId,
          dosage: med.dosage,
          frequencyHours: med.frequencyHours.toString(),
          durationDays: med.durationDays.toString(),
          startOption: med.startAtSpecificTime ? "specific" : "now",
          specificDate: med.specificStartTime ? new Date(med.specificStartTime).toISOString().slice(0, 16) : undefined
        }));
        setMedications(formMedications);
      }

      // Configurar imágenes
      if (initialData.images) {
        const formImages: TreatmentImage[] = initialData.images.map(img => ({
          id: img.id,
          file: new File([], 'existing-image.jpg', { type: 'image/jpeg' }), // Archivo ficticio para imágenes existentes
          imageUrl: img.imageUrl,
          imageType: img.imageType as "receta" | "instrucciones",
          extractedText: img.extractedText || "",
          aiAnalysis: img.aiAnalysis || "",
          isAnalyzing: false
        }));
        setImages(formImages);
      }
    }
  }, [initialData]);


  const form = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      name: initialData?.name || "",
      patient: initialData?.patient || "",
      patientId: initialData?.patientId || "",
      patientType: (initialData?.patientType as "usuario" | "perfil") || undefined,
      symptoms: initialData?.symptoms || "",
      medications: [],
    },
  });

  const handleSubmit = async (data: TreatmentFormData) => {
    
    // Evitar envíos duplicados
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Validar datos básicos
      if (!data.name.trim()) {
        throw new Error("El nombre del tratamiento es requerido");
      }

      if (!selectedPatient) {
        throw new Error("Debe seleccionar un paciente del grupo familiar");
      }

      // Validar que haya al menos un medicamento
      if (medications.length === 0) {
        throw new Error("Debe agregar al menos un medicamento al tratamiento");
      }

      // Validar cada medicamento
      for (let i = 0; i < medications.length; i++) {
        const medication = medications[i];
        
        if (!medication.medicationId) {
          throw new Error(`Medicamento ${i + 1}: Debe seleccionar un medicamento`);
        }

        if (!medication.dosage || Number(medication.dosage) <= 0) {
          throw new Error(`Medicamento ${i + 1}: La dosis debe ser mayor a 0`);
        }

        if (!medication.frequencyHours || Number(medication.frequencyHours) <= 0) {
          throw new Error(`Medicamento ${i + 1}: La frecuencia debe ser mayor a 0`);
        }

        if (!medication.durationDays || Number(medication.durationDays) <= 0) {
          throw new Error(`Medicamento ${i + 1}: La duración debe ser mayor a 0`);
        }

        const medicina = medicinas.find(m => m.id === medication.medicationId);
        if (!medicina) {
          throw new Error(`Medicamento ${i + 1}: Medicamento no encontrado`);
        }

        const dosisNecesarias = Math.ceil(
          Number(medication.durationDays) * (24 / Number(medication.frequencyHours))
        );

        if (medicina.currentQuantity < dosisNecesarias) {
          throw new Error(
            `Medicamento ${i + 1} (${medicina.commercialName}): ` +
            `Stock insuficiente. Se necesitan ${dosisNecesarias} ${medicina.unit} pero solo hay ${medicina.currentQuantity} disponibles.`
          );
        }
      }

      await onSubmit({
        name: data.name,
        patient: selectedPatient.name,
        patientId: selectedPatient.id,
        patientType: selectedPatient.type,
        symptoms: data.symptoms,
        medications: medications,
        images: images,
        userId: userId,
      });

      // Si llegamos aquí, el tratamiento se creó exitosamente
      // El componente padre manejará la redirección
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      const errorMessage = error instanceof Error ? error.message : "Error al procesar el formulario";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            {/* Nombre del tratamiento */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Tratamiento *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Tratamiento para hipertensión"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selección de paciente */}
            <PatientSelector
              onSelectPatient={setSelectedPatient}
              selectedPatientId={selectedPatient?.id}
              disabled={isSubmitting}
            />

            {/* Síntomas */}
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Síntomas del Paciente (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe los síntomas que presenta el paciente..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medicamentos */}
            <MedicationSelector
              medicinas={medicinas}
              medications={medications}
              onMedicationsChange={setMedications}
              disabled={isSubmitting}
            />

            {/* Carga de imágenes */}
            <TreatmentImageUploader
              images={images}
              onImagesChange={(newImages) => {
                console.log('🟢 TratamientoForm - setImages llamado desde TreatmentImageUploader, de', images.length, 'a', newImages.length);
                console.trace('🔍 Stack trace de setImages');
                setImages(newImages);
              }}
              disabled={isSubmitting}
            />

            {/* Resumen del tratamiento */}
            {medications.length > 0 && (
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-2">Resumen del Tratamiento</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Medicamentos:</span> {medications.length}
                  </div>
                  <div>
                    <span className="font-medium">Imágenes:</span> {images.length}
                  </div>
                  <div>
                    <span className="font-medium">Paciente:</span> {selectedPatient ? selectedPatient.name : "No seleccionado"}
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de error - Posicionado al final para que sea visible */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
                <div className="flex items-start gap-2">
                  <div className="text-destructive">⚠️</div>
                  <div>
                    <p className="font-medium">Error al crear el tratamiento</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button 
                type="button" 
                disabled={isSubmitting || medications.length === 0}
                className="min-w-[160px]"
                onClick={async (e) => {
                  
                  // Prevenir el comportamiento por defecto del submit
                  e.preventDefault();
                  
                  // Si hay medicamentos, llamar directamente a handleSubmit
                  if (medications.length > 0) {
                    // Obtener los datos del formulario
                    const formData = form.getValues();
                    
                    // Llamar directamente a handleSubmit
                    await handleSubmit(formData);
                  } else {
                  }
                }}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Cardio size={20} stroke={3} speed={1.5} color="var(--color-info)" />
                    <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span>{isEditing ? 'Actualizar Tratamiento' : 'Crear Tratamiento'}</span>
                  </div>
                )}
              </Button>
            </div>

            {/* Mensaje de ayuda */}
            {medications.length === 0 && (
              <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded-md">
                <div className="flex items-start gap-2">
                  <div className="text-warning">💡</div>
                  <div>
                    <p className="font-medium">Información requerida</p>
                    <p className="text-sm mt-1">
                      Para crear el tratamiento, debes agregar al menos un medicamento. 
                      Haz clic en &quot;Agregar Medicamento&quot; para continuar.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}