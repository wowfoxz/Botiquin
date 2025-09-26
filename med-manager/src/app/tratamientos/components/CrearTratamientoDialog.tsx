"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { TratamientoForm } from "./TratamientoForm";
import { toast } from "sonner";

interface CrearTratamientoDialogProps {
  onCreate: (tratamiento: Omit<Tratamiento, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  medicinas: Medicamento[];
  userId: string;
}

export function CrearTratamientoDialog({ onCreate, medicinas, userId }: CrearTratamientoDialogProps) {
  const [open, setOpen] = useState(false);

  const handleCreate = async (tratamiento: Omit<Tratamiento, "id" | "createdAt" | "updatedAt">) => {
    try {
      await onCreate(tratamiento);
      setOpen(false);
      toast.success("Tratamiento creado exitosamente");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear el tratamiento";
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nuevo Tratamiento</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Tratamiento</DialogTitle>
        </DialogHeader>
        <TratamientoForm
          onSubmit={handleCreate}
          onCancel={() => setOpen(false)}
          medicinas={medicinas}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  );
}