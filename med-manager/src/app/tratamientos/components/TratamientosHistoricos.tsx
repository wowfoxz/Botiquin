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
import { Badge } from "@/components/ui/badge";
import { Tratamiento, Medicamento } from "@/types/tratamientos";

interface TratamientosHistoricosProps {
  tratamientos: Tratamiento[];
  medicinas: Medicamento[];
  userId: string;
  onDelete: (id: string) => Promise<void>;
  obtenerNombreMedicamento: (id: string) => string;
}

export function TratamientosHistoricos({ 
  tratamientos, 
  medicinas,
  userId,
  onDelete, 
  obtenerNombreMedicamento 
}: TratamientosHistoricosProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Tratamientos</CardTitle>
      </CardHeader>
      <CardContent>
        {tratamientos.length === 0 ? (
          <p className="text-gray-500">No hay tratamientos en el historial</p>
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
                <TableHead>Estado</TableHead>
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
                    <Badge variant="secondary">Finalizado</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(tratamiento.id)}
                    >
                      Eliminar
                    </Button>
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