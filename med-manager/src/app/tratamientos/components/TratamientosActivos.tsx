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
import { CheckCircle, XCircle, Eye } from "lucide-react";
import { VerDetallesDialog } from "./VerDetallesDialog";

interface TratamientosActivosProps {
  tratamientos: Tratamiento[];
  medicinas: Medicamento[];
  userId: string;
  onUpdate: (id: string, tratamiento: Partial<Tratamiento>) => Promise<void>;
  onFinalizar: (id: string) => Promise<void>;
}

export function TratamientosActivos({
  tratamientos,
  medicinas,
  userId,
  onUpdate,
  onFinalizar
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
                  <TableHead>Paciente</TableHead>
                  <TableHead>Medicamentos</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tratamientos.map((tratamiento) => (
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
                      <div className="space-y-1">
                        <div className="text-sm">
                          {new Date(tratamiento.startDate).toLocaleDateString()} - {new Date(tratamiento.endDate).toLocaleDateString()}
                        </div>
                        {(() => {
                          const now = new Date();
                          const endDate = new Date(tratamiento.endDate);
                          const diffTime = endDate.getTime() - now.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays > 0) {
                            return (
                              <Badge variant="secondary" className="text-xs">
                                {diffDays} día{diffDays !== 1 ? 's' : ''} restante{diffDays !== 1 ? 's' : ''}
                              </Badge>
                            );
                          } else if (diffDays === 0) {
                            return (
                              <Badge variant="destructive" className="text-xs">
                                Finaliza hoy
                              </Badge>
                            );
                          } else {
                            return (
                              <Badge variant="outline" className="text-xs">
                                Finalizado hace {Math.abs(diffDays)} día{Math.abs(diffDays) !== 1 ? 's' : ''}
                              </Badge>
                            );
                          }
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <VerDetallesDialog
                          tratamiento={tratamiento}
                          medicinas={medicinas}
                        />
                        <EditarTratamientoDialog
                          tratamiento={tratamiento}
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