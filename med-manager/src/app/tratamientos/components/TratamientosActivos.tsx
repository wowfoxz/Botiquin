"use client";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { EditarTratamientoDialog } from "./EditarTratamientoDialog";
import { Tratamiento, Medicamento } from "@/types/tratamientos";

interface TratamientosActivosProps {
  tratamientos: Tratamiento[];
  medicinas: Medicamento[];
  userId: string;
  onUpdate: (id: string, tratamiento: Partial<Tratamiento>) => Promise<void>;
  onFinalizar: (id: string) => Promise<void>;
  obtenerNombreMedicamento: (id: string) => string;
}

export function TratamientosActivos({ 
  tratamientos, 
  medicinas,
  userId,
  onUpdate, 
  onFinalizar,
  obtenerNombreMedicamento
}: TratamientosActivosProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tratamientos Activos</CardTitle>
      </CardHeader>
      <CardContent>
        {tratamientos.length === 0 ? (
          <p className="text-gray-500">No hay tratamientos activos</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Medicamento</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Dosis</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tratamientos.map((tratamiento) => (
                <TableRow key={tratamiento.id}>
                  <TableCell>{tratamiento.name}</TableCell>
                  <TableCell>{obtenerNombreMedicamento(tratamiento.medicationId)}</TableCell>
                  <TableCell>Cada {tratamiento.frequencyHours} horas</TableCell>
                  <TableCell>{tratamiento.durationDays} días</TableCell>
                  <TableCell>{tratamiento.patient}</TableCell>
                  <TableCell>{tratamiento.dosage}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <EditarTratamientoDialog
                        tratamiento={tratamiento}
                        onUpdate={onUpdate}
                        medicinas={medicinas}
                        userId={userId}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFinalizar(tratamiento.id)}
                      >
                        Finalizar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}