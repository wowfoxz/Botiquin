"use client";

import { Button } from "@/components/ui/button";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

interface EditarTratamientoDialogProps {
  tratamiento: Tratamiento;
  onUpdate: (id: string, tratamiento: Partial<Tratamiento>) => Promise<void>;
  medicinas: Medicamento[];
  userId: string;
}

export function EditarTratamientoDialog({ tratamiento }: EditarTratamientoDialogProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/tratamientos/editar/${tratamiento.id}`);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2"
      onClick={handleEdit}
    >
      <Pencil className="h-4 w-4" />
      Editar
    </Button>
  );
}