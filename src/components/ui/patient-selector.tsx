"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";
import { useConsumidoresGrupo, Consumidor } from "@/hooks/useConsumidoresGrupo";
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css';

interface PatientSelectorProps {
  onSelectPatient: (patient: {
    id: string;
    name: string;
    type: "usuario" | "perfil";
    rol?: string;
  } | null) => void;
  selectedPatientId?: string;
  disabled?: boolean;
}

export function PatientSelector({ 
  onSelectPatient, 
  selectedPatientId, 
  disabled = false 
}: PatientSelectorProps) {
  const { consumidores, loading, error } = useConsumidoresGrupo();
  const [showSelector, setShowSelector] = useState(false);

  const selectedPatient = consumidores.find(c => c.id === selectedPatientId);

  const handlePatientSelect = (patient: Consumidor | null) => {
    if (patient) {
      onSelectPatient({
        id: patient.id,
        name: patient.name,
        type: patient.tipo,
        rol: patient.rol,
      });
    } else {
      onSelectPatient(null);
    }
    setShowSelector(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Cardio size={30} stroke={3} speed={1} color="var(--color-info)" />
        <span className="ml-2 text-sm text-muted-foreground">Cargando pacientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md">
        <p className="text-sm text-destructive">Error: {error}</p>
        <p className="text-xs text-destructive/70 mt-1">
          No se pudieron cargar los pacientes del grupo familiar
        </p>
      </div>
    );
  }

  if (consumidores.length === 0) {
    return (
      <div className="p-4 border border-warning/20 bg-warning/10 rounded-md">
        <p className="text-sm text-warning-foreground">
          No hay pacientes disponibles en el grupo familiar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Paciente *</label>
        {selectedPatient && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handlePatientSelect(null)}
            disabled={disabled}
            className="text-xs"
          >
            Limpiar selección
          </Button>
        )}
      </div>

      {selectedPatient ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                {selectedPatient.foto && (
                  <AvatarImage 
                    src={selectedPatient.foto} 
                    alt={selectedPatient.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary flex-shrink-0">
                  {selectedPatient.tipo === "usuario" ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedPatient.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={selectedPatient.tipo === "usuario" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {selectedPatient.tipo === "usuario" ? "Usuario" : "Perfil"}
                  </Badge>
                  {selectedPatient.rol && (
                    <Badge variant="outline" className="text-xs">
                      {selectedPatient.rol === "ADULTO" ? "Adulto" : "Menor"}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSelector(true)}
                disabled={disabled}
              >
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSelector(true)}
            disabled={disabled}
            className="w-full justify-start"
          >
            <Users className="h-4 w-4 mr-2" />
            Seleccionar paciente del grupo familiar
          </Button>
          <p className="text-xs text-muted-foreground">
            Debe seleccionar un paciente del grupo familiar para continuar
          </p>
        </div>
      )}

      {showSelector && (
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Seleccionar Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {consumidores.map((consumidor) => (
              <div
                key={consumidor.id}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedPatientId === consumidor.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
                onClick={() => handlePatientSelect(consumidor)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    {consumidor.foto && (
                      <AvatarImage 
                        src={consumidor.foto} 
                        alt={consumidor.name}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary flex-shrink-0">
                      {consumidor.tipo === "usuario" ? (
                        <User className="h-6 w-6" />
                      ) : (
                        <Users className="h-6 w-6" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{consumidor.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={consumidor.tipo === "usuario" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {consumidor.tipo === "usuario" ? "Usuario" : "Perfil"}
                      </Badge>
                      {consumidor.rol && (
                        <Badge variant="outline" className="text-xs">
                          {consumidor.rol === "ADULTO" ? "Adulto" : "Menor"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
