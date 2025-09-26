"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { toast } from "sonner";

interface TratamientoFormProps {
  onSubmit: (tratamiento: Omit<Tratamiento, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onCancel: () => void;
  medicinas: Medicamento[];
  userId: string;
  initialData?: Partial<Tratamiento>;
}

export function TratamientoForm({ onSubmit, onCancel, medicinas, userId, initialData }: TratamientoFormProps) {
  const [nombre, setNombre] = useState(initialData?.name || "");
  const [medicamentoId, setMedicamentoId] = useState(initialData?.medicationId || "");
  const [frecuenciaHoras, setFrecuenciaHoras] = useState(initialData?.frequencyHours || 8);
  const [duracionDias, setDuracionDias] = useState(initialData?.durationDays || 7);
  const [paciente, setPaciente] = useState(initialData?.patient || "");
  const [dosis, setDosis] = useState(initialData?.dosage || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Validaciones básicas
      if (!nombre || !medicamentoId || !paciente || !dosis) {
        throw new Error("Por favor, complete todos los campos obligatorios");
      }

      if (frecuenciaHoras <= 0) {
        throw new Error("La frecuencia debe ser mayor que 0 horas");
      }

      if (duracionDias <= 0) {
        throw new Error("La duración debe ser mayor que 0 días");
      }

      if (Number(dosis) <= 0) {
        throw new Error("La dosis debe ser mayor que 0");
      }

      // Verificar stock disponible
      const dosisPorTratamiento = Math.ceil(duracionDias * (24 / frecuenciaHoras));
      const medicamento = medicinas.find(m => m.id === medicamentoId);
      
      if (!medicamento) {
        throw new Error("Medicamento no encontrado");
      }

      if (Number(medicamento.currentQuantity) < dosisPorTratamiento) {
        throw new Error(`Stock insuficiente. Necesita ${dosisPorTratamiento} unidades pero solo hay ${medicamento.currentQuantity} disponibles`);
      }

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + duracionDias * 24 * 60 * 60 * 1000);

      await onSubmit({
        name: nombre,
        medicationId: medicamentoId,
        frequencyHours: frecuenciaHoras,
        durationDays: duracionDias,
        patient: paciente,
        dosage: dosis,
        userId: userId,
        isActive: true,
        startDate: startDate,
        endDate: endDate
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre del Tratamiento *</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Tratamiento para gripe"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="medicamento">Medicamento *</Label>
        <Select value={medicamentoId} onValueChange={setMedicamentoId} required>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un medicamento" />
          </SelectTrigger>
          <SelectContent>
            {medicinas.map((medicina) => (
              <SelectItem key={medicina.id} value={medicina.id}>
                {medicina.commercialName} (Stock: {medicina.currentQuantity})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frecuencia">Frecuencia (horas) *</Label>
          <Input
            id="frecuencia"
            type="number"
            min="1"
            value={frecuenciaHoras}
            onChange={(e) => setFrecuenciaHoras(Number(e.target.value))}
            placeholder="Ej: 8"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duracion">Duración (días) *</Label>
          <Input
            id="duracion"
            type="number"
            min="1"
            value={duracionDias}
            onChange={(e) => setDuracionDias(Number(e.target.value))}
            placeholder="Ej: 7"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="dosis">Dosis por toma *</Label>
        <Input
          id="dosis"
          type="number"
          min="0.1"
          step="0.1"
          value={dosis}
          onChange={(e) => setDosis(e.target.value)}
          placeholder="Cantidad de dosis"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paciente">Paciente *</Label>
        <Input
          id="paciente"
          value={paciente}
          onChange={(e) => setPaciente(e.target.value)}
          placeholder="Nombre del paciente"
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground">
          {initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}