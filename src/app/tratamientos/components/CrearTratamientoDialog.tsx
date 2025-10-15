"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function CrearTratamientoDialog() {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/tratamientos/nuevo");
  };

  return (
    <Button onClick={handleCreate} className="gap-2">
      <Plus className="h-4 w-4" />
      Nuevo Tratamiento
    </Button>
  );
}