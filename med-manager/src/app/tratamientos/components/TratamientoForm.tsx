"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { toast } from "sonner";
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { treatmentSchema, type TreatmentFormData } from '@/lib/validations';

interface TratamientoFormProps {
  onSubmit: (tratamiento: Omit<Tratamiento, "id" | "createdAt" | "updatedAt" | "startDate" | "endDate" | "isActive" | "medication">) => Promise<void>;
  onCancel: () => void;
  medicinas: Medicamento[];
  userId: string;
  initialData?: Partial<Tratamiento>;
}

export function TratamientoForm({ onSubmit, onCancel, medicinas, userId, initialData }: TratamientoFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      name: initialData?.name || "",
      medicationId: initialData?.medicationId || "",
      frequencyHours: initialData?.frequencyHours?.toString() || "8",
      durationDays: initialData?.durationDays?.toString() || "7",
      patient: initialData?.patient || "",
      dosage: initialData?.dosage || "",
      startOption: initialData?.startAtSpecificTime ? "specific" : "now",
      specificDate: initialData?.specificStartTime
        ? new Date(initialData.specificStartTime).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    },
  });

  const handleSubmit = async (data: TreatmentFormData) => {
    // Evitar envíos duplicados
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const frecuenciaNum = Number(data.frequencyHours);
      const duracionNum = Number(data.durationDays);

      // Verificar stock disponible
      const dosisPorTratamiento = Math.ceil(duracionNum * (24 / frecuenciaNum));
      const medicina = medicinas.find(m => m.id === data.medicationId);

      if (medicina && medicina.currentQuantity < dosisPorTratamiento) {
        throw new Error(`Stock insuficiente. Se necesitan ${dosisPorTratamiento} unidades pero solo hay ${medicina.currentQuantity} disponibles.`);
      }

      await onSubmit({
        name: data.name,
        medicationId: data.medicationId,
        frequencyHours: frecuenciaNum,
        durationDays: duracionNum,
        patient: data.patient,
        dosage: data.dosage,
        userId: userId,
        startAtSpecificTime: data.startOption === "specific",
        specificStartTime: data.startOption === "specific" ? new Date(data.specificDate!) : undefined
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al procesar el formulario";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular dosis totales
  const watchedValues = form.watch(['frequencyHours', 'durationDays']);
  const frecuenciaNum = Number(watchedValues[0]) || 8;
  const duracionNum = Number(watchedValues[1]) || 7;
  const dosisTotales = Math.ceil(duracionNum * (24 / frecuenciaNum));

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-md">
                {error}
              </div>
            )}

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

            <FormField
              control={form.control}
              name="patient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre del paciente"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="medicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicamento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar medicamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medicinas
                          .filter(m => !m.archived)
                          .map((medicina) => (
                            <SelectItem key={medicina.id} value={medicina.id}>
                              {medicina.commercialName} (Stock: {medicina.currentQuantity})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosis por toma *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Cantidad"
                          className="pr-16"
                          {...field}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-sm">
                          unidades
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequencyHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia (horas) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          className="pr-16"
                          {...field}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-sm">
                          horas
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración (días) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          className="pr-16"
                          {...field}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-sm">
                          días
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Inicio del Tratamiento *</FormLabel>
              <FormField
                control={form.control}
                name="startOption"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="now" id="now" />
                          <FormLabel htmlFor="now">Iniciar tratamiento ahora</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="specific" id="specific" />
                          <FormLabel htmlFor="specific">Iniciar en una fecha y hora específica</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('startOption') === "specific" && (
                <FormField
                  control={form.control}
                  name="specificDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha y Hora de Inicio</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          min={new Date().toISOString().slice(0, 16)}
                          {...field}
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Seleccione la fecha y hora en que desea que comience la primera toma
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Dosis totales estimadas:</span> {dosisTotales} unidades
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Basado en {duracionNum} días con una frecuencia cada {frecuenciaNum} horas
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Cardio size={20} stroke={3} speed={1.5} color="var(--color-info)" />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  initialData ? "Actualizar Tratamiento" : "Crear Tratamiento"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}