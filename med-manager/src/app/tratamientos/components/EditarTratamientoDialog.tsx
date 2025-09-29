"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { TratamientoForm } from "./TratamientoForm";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

interface EditarTratamientoDialogProps {
  tratamiento: Tratamiento;
  onUpdate: (id: string, tratamiento: Partial<Tratamiento>) => Promise<void>;
  medicinas: Medicamento[];
  userId: string;
}

export function EditarTratamientoDialog({ tratamiento, onUpdate, medicinas, userId }: EditarTratamientoDialogProps) {
  const [open, setOpen] = useState(false);

  const handleUpdate = async (tratamientoData: Omit<Tratamiento, "id" | "createdAt" | "updatedAt" | "startDate" | "endDate" | "isActive" | "medication">) => {
    try {
      // Convertir el objeto parcial a las propiedades correctas
      const updateData: Partial<Tratamiento> = {
        ...tratamientoData,
        startDate: tratamientoData.frequencyHours ? new Date() : undefined,
        endDate: tratamientoData.durationDays ? new Date(Date.now() + (tratamientoData.durationDays * 24 * 60 * 60 * 1000)) : undefined,
        isActive: true
      };

      await onUpdate(tratamiento.id, updateData);
      setOpen(false);
      toast.success("Tratamiento actualizado exitosamente");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar el tratamiento";
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Tratamiento</DialogTitle>
        </DialogHeader>
        <TratamientoForm
          initialData={tratamiento}
          onSubmit={handleUpdate}
          onCancel={() => setOpen(false)}
          medicinas={medicinas}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  );
}