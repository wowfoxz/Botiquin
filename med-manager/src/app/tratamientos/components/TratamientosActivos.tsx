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
import { EditarTratamientoDialog } from "./EditarTratamientoDialog";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { CheckCircle, XCircle } from "lucide-react";

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
    <Card className="border-0 shadow-none pl-5 pr-5">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Tratamientos Activos</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {tratamientos.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-12 w-12 mx-auto text-muted-foreground flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium">No hay tratamientos activos</h3>
            <p className="mt-2 text-muted-foreground">
              Comienza creando un nuevo tratamiento para gestionar tu medicación
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Medicamento</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Dosis</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tratamientos.map((tratamiento) => (
                  <TableRow key={tratamiento.id}>
                    <TableCell className="font-medium">{tratamiento.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{obtenerNombreMedicamento(tratamiento.medicationId)}</span>
                        <Badge variant="secondary">
                          Stock: {medicinas.find(m => m.id === tratamiento.medicationId)?.currentQuantity || 0}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      Cada {tratamiento.frequencyHours} horas
                    </TableCell>
                    <TableCell>
                      {tratamiento.durationDays} días
                    </TableCell>
                    <TableCell>
                      {tratamiento.dosage} unidades
                    </TableCell>
                    <TableCell>
                      {tratamiento.patient}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <EditarTratamientoDialog
                          tratamiento={tratamiento}
                          onUpdate={onUpdate}
                          medicinas={medicinas}
                          userId={userId}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => onFinalizar(tratamiento.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Finalizar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}