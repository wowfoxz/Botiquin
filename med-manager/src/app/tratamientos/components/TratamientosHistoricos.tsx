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
import { XCircle, Calendar } from "lucide-react";
import { History } from "lucide-react";

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
    <Card className="border-0 shadow-none pl-5 pr-5">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Historial de Tratamientos</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {tratamientos.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No hay tratamientos en el historial</h3>
            <p className="mt-2 text-muted-foreground">
              Los tratamientos finalizados aparecerán aquí
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
                  <TableHead>Finalizado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tratamientos.map((tratamiento) => {
                  // Ajuste para comparar correctamente la fecha actual con la fecha de fin
                  // tomando en cuenta el desfase de zona horaria del cliente.
                  const isExpired =
                    new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000) >
                    new Date(tratamiento.endDate);

                  return (
                    <TableRow key={tratamiento.id}>
                      <TableCell className="font-medium">{tratamiento.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{obtenerNombreMedicamento(tratamiento.medicationId)}</span>
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {tratamiento.endDate
                              ? new Date(tratamiento.endDate).toLocaleDateString()
                              : 'N/A'}
                          </span>
                          <Badge className="ml-2">{isExpired ? 'Finalizado' : 'Activo'}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => onDelete(tratamiento.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}