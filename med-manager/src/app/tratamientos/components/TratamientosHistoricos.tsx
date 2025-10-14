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
import { XCircle, Calendar, Eye } from "lucide-react";
import { History } from "lucide-react";
import { VerDetallesDialog } from "./VerDetallesDialog";

interface TratamientosHistoricosProps {
  tratamientos: Tratamiento[];
  medicinas: Medicamento[];
  userId: string;
  onDelete: (id: string) => Promise<void>;
}

export function TratamientosHistoricos({
  tratamientos,
  medicinas,
  userId,
  onDelete
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
                  <TableHead>Paciente</TableHead>
                  <TableHead>Medicamentos</TableHead>
                  <TableHead>Duración</TableHead>
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
                                    <div className="font-medium">{tratamiento.patient}</div>
                                  </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {tratamiento.medications?.map((med, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{med.commercialName || med.medication?.commercialName || "Medicamento"}</div>
                              <div className="text-muted-foreground">
                                {med.dosage} {med.unit || med.medication?.unit || "unidades"} - Cada {med.frequencyHours}h
                              </div>
                            </div>
                          )) || "Sin medicamentos"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(tratamiento.startDate).toLocaleDateString()} - {new Date(tratamiento.endDate).toLocaleDateString()}
                        </div>
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
                        <div className="flex justify-end gap-2">
                          <VerDetallesDialog
                            tratamiento={tratamiento}
                            medicinas={medicinas}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => onDelete(tratamiento.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
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