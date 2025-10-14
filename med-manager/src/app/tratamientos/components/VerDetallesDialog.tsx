"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { Eye, Pill, Calendar, User, FileImage, MessageSquare } from "lucide-react";
import Image from "next/image";

interface VerDetallesDialogProps {
  tratamiento: Tratamiento;
  medicinas: Medicamento[];
}

export function VerDetallesDialog({ tratamiento, medicinas }: VerDetallesDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Ver Detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalles del Tratamiento: {tratamiento.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre del Tratamiento</label>
                  <p className="text-sm">{tratamiento.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paciente</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{tratamiento.patient}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Inicio</label>
                  <p className="text-sm">{new Date(tratamiento.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Finalización</label>
                  <p className="text-sm">{new Date(tratamiento.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Síntomas */}
          {tratamiento.symptoms && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Síntomas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{tratamiento.symptoms}</p>
              </CardContent>
            </Card>
          )}

          {/* Medicamentos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Medicamentos ({tratamiento.medications?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tratamiento.medications && tratamiento.medications.length > 0 ? (
                <div className="space-y-4">
                  {tratamiento.medications.map((med, index) => (
                    <div key={index}>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{med.commercialName || med.medication?.commercialName || "Medicamento"}</h4>
                            <p className="text-sm text-muted-foreground">
                              {med.activeIngredient || med.medication?.activeIngredient || "Principio activo no especificado"}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {med.unit || med.medication?.unit || "unidades"}
                          </Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <label className="font-medium text-muted-foreground">Dosis</label>
                            <p>{med.dosage} {med.unit || med.medication?.unit || "unidades"}</p>
                          </div>
                          <div>
                            <label className="font-medium text-muted-foreground">Frecuencia</label>
                            <p>Cada {med.frequencyHours} horas</p>
                          </div>
                          <div>
                            <label className="font-medium text-muted-foreground">Duración</label>
                            <p>{med.durationDays} días</p>
                          </div>
                        </div>

                        {med.startAtSpecificTime && med.specificStartTime && (
                          <div>
                            <label className="font-medium text-muted-foreground text-sm">Inicio Programado</label>
                            <p className="text-sm">
                              {new Date(med.specificStartTime).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No hay medicamentos registrados</p>
              )}
            </CardContent>
          </Card>

          {/* Imágenes */}
          {tratamiento.images && tratamiento.images.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  Imágenes ({tratamiento.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tratamiento.images.map((image, index) => (
                    <div key={index} className="space-y-3">
                      <div className="relative">
                        <Badge variant={image.imageType === "receta" ? "default" : "secondary"} className="mb-2">
                          {image.imageType === "receta" ? "Receta Médica" : "Instrucciones"}
                        </Badge>
                        <div className="w-full h-48 bg-muted rounded-md border flex items-center justify-center">
                          <Image
                            src={image.imageUrl}
                            alt={`${image.imageType} del tratamiento`}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              // Solo loggear errores que no sean URLs de blob conocidas
                              if (!image.imageUrl.startsWith('blob:')) {
                                console.error('Error al cargar imagen:', image.imageUrl);
                              }
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <p class="text-sm">Imagen no disponible</p>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      {image.extractedText && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Texto Extraído</label>
                          <p className="text-xs bg-muted/50 p-2 rounded border max-h-20 overflow-y-auto">
                            {image.extractedText}
                          </p>
                        </div>
                      )}
                      
                      {image.aiAnalysis && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Análisis IA</label>
                          <p className="text-xs bg-muted/50 p-2 rounded border max-h-20 overflow-y-auto">
                            {image.aiAnalysis}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
