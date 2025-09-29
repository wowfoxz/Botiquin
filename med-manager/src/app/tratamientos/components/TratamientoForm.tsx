"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { toast } from "sonner";

interface TratamientoFormProps {
  onSubmit: (tratamiento: Omit<Tratamiento, "id" | "createdAt" | "updatedAt" | "startDate" | "endDate" | "isActive" | "medication">) => Promise<void>;
  onCancel: () => void;
  medicinas: Medicamento[];
  userId: string;
  initialData?: Partial<Tratamiento>;
}

export function TratamientoForm({ onSubmit, onCancel, medicinas, userId, initialData }: TratamientoFormProps) {
  const [nombre, setNombre] = useState(initialData?.name || "");
  const [medicamentoId, setMedicamentoId] = useState(initialData?.medicationId || "");
  const [frecuenciaHoras, setFrecuenciaHoras] = useState(initialData?.frequencyHours?.toString() || "8");
  const [duracionDias, setDuracionDias] = useState(initialData?.durationDays?.toString() || "7");
  const [paciente, setPaciente] = useState(initialData?.patient || "");
  const [dosis, setDosis] = useState(initialData?.dosage || "");
  const [startOption, setStartOption] = useState<"now" | "specific">(
    initialData?.startAtSpecificTime ? "specific" : "now"
  );
  const [specificDate, setSpecificDate] = useState<string>(
    initialData?.specificStartTime
      ? new Date(initialData.specificStartTime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validaciones básicas
      if (!nombre || !medicamentoId || !paciente || !dosis) {
        throw new Error("Por favor, complete todos los campos obligatorios");
      }

      const frecuenciaNum = Number(frecuenciaHoras);
      const duracionNum = Number(duracionDias);

      if (frecuenciaNum <= 0) {
        throw new Error("La frecuencia debe ser mayor que 0 horas");
      }

      if (duracionNum <= 0) {
        throw new Error("La duración debe ser mayor que 0 días");
      }

      if (Number(dosis) <= 0) {
        throw new Error("La dosis debe ser mayor que 0");
      }

      // Validar fecha específica si se seleccionó esa opción
      if (startOption === "specific") {
        if (!specificDate) {
          throw new Error("Por favor, seleccione una fecha y hora de inicio");
        }

        const selectedDate = new Date(specificDate);
        // Ajustar la fecha para que sea interpretada en la zona horaria local
        const now = new Date();
        // Ajustar now a la zona horaria local para comparación correcta
        const nowAdjusted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

        if (selectedDate < nowAdjusted) {
          throw new Error("La fecha de inicio debe ser en el futuro");
        }
      }

      // Verificar stock disponible
      const dosisPorTratamiento = Math.ceil(duracionNum * (24 / frecuenciaNum));
      const medicina = medicinas.find(m => m.id === medicamentoId);

      if (medicina && medicina.currentQuantity < dosisPorTratamiento) {
        throw new Error(`Stock insuficiente. Se necesitan ${dosisPorTratamiento} unidades pero solo hay ${medicina.currentQuantity} disponibles.`);
      }

      await onSubmit({
        name: nombre,
        medicationId: medicamentoId,
        frequencyHours: frecuenciaNum,
        durationDays: duracionNum,
        patient: paciente,
        dosage: dosis,
        userId: userId,
        startAtSpecificTime: startOption === "specific",
        specificStartTime: startOption === "specific" ? new Date(specificDate) : undefined
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al procesar el formulario";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Calcular dosis totales
  const frecuenciaNum = Number(frecuenciaHoras) || 8;
  const duracionNum = Number(duracionDias) || 7;
  const dosisTotales = Math.ceil(duracionNum * (24 / frecuenciaNum));

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Tratamiento *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Tratamiento para hipertensión"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paciente">Paciente *</Label>
            <Input
              id="paciente"
              value={paciente}
              onChange={(e) => setPaciente(e.target.value)}
              placeholder="Nombre del paciente"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicamento">Medicamento *</Label>
              <Select value={medicamentoId} onValueChange={setMedicamentoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar medicamento" />
                </SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosis">Dosis por toma *</Label>
              <div className="relative">
                <Input
                  id="dosis"
                  type="number"
                  value={dosis}
                  onChange={(e) => setDosis(e.target.value)}
                  placeholder="Cantidad"
                  className="pr-16"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-sm">
                  unidades
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frecuencia">Frecuencia (horas) *</Label>
              <div className="relative">
                <Input
                  id="frecuencia"
                  type="number"
                  value={frecuenciaHoras}
                  onChange={(e) => setFrecuenciaHoras(e.target.value)}
                  min="1"
                  className="pr-16"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-sm">
                  horas
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracion">Duración (días) *</Label>
              <div className="relative">
                <Input
                  id="duracion"
                  type="number"
                  value={duracionDias}
                  onChange={(e) => setDuracionDias(e.target.value)}
                  min="1"
                  className="pr-16"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-sm">
                  días
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Inicio del Tratamiento *</Label>
            <RadioGroup
              value={startOption}
              onValueChange={(value: "now" | "specific") => setStartOption(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="now" id="now" />
                <Label htmlFor="now">Iniciar tratamiento ahora</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="specific" id="specific" />
                <Label htmlFor="specific">Iniciar en una fecha y hora específica</Label>
              </div>
            </RadioGroup>

            {startOption === "specific" && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="specific-date">Fecha y Hora de Inicio</Label>
                <Input
                  id="specific-date"
                  type="datetime-local"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                />
                <p className="text-sm text-muted-foreground">
                  Seleccione la fecha y hora en que desea que comience la primera toma
                </p>
              </div>
            )}
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm">
              <span className="font-medium">Dosis totales estimadas:</span> {dosisTotales} unidades
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Basado en {duracionDias} días con una frecuencia cada {frecuenciaHoras} horas
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Actualizar Tratamiento" : "Crear Tratamiento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}