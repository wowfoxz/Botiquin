"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { TratamientoForm } from "./TratamientoForm";
import { toast } from "sonner";

interface EditarTratamientoDialogProps {
  tratamiento: Tratamiento;
  onUpdate: (id: string, tratamiento: Partial<Tratamiento>) => Promise<void>;
  medicinas: Medicamento[];
  userId: string;
}

export function EditarTratamientoDialog({ tratamiento, onUpdate, medicinas, userId }: EditarTratamientoDialogProps) {
  const [open, setOpen] = useState(false);

  const handleUpdate = async (tratamientoData: Omit<Tratamiento, "id" | "createdAt" | "updatedAt">) => {
    try {
      await onUpdate(tratamiento.id, tratamientoData);
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
        <Button variant="outline" size="sm">Editar</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Tratamiento</DialogTitle>
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