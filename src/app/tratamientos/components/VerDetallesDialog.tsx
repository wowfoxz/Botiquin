"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tratamiento, Medicamento } from "@/types/tratamientos";
import { Eye, Pill, User, FileImage, MessageSquare, ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

interface VerDetallesDialogProps {
  tratamiento: Tratamiento;
  medicinas: Medicamento[];
}

export function VerDetallesDialog({ tratamiento, medicinas }: VerDetallesDialogProps) {
  // Evitar warning por prop no utilizada actualmente
  void medicinas;
  const [open, setOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null && tratamiento.images) {
      setSelectedImageIndex((selectedImageIndex + 1) % tratamiento.images.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex !== null && tratamiento.images) {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? tratamiento.images.length - 1 : selectedImageIndex - 1
      );
    }
  };

  const selectedImage = selectedImageIndex !== null && tratamiento.images ? tratamiento.images[selectedImageIndex] : null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Ver Detalles
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col" aria-describedby="treatment-details-description">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {tratamiento.name}
            </DialogTitle>
          </DialogHeader>
          <p id="treatment-details-description" className="sr-only">
            Detalles completos del tratamiento incluyendo información del paciente, medicamentos, síntomas e imágenes adjuntas
          </p>

          <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
              <TabsTrigger value="info" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Información</span>
              </TabsTrigger>
              <TabsTrigger value="medications" className="gap-2">
                <Pill className="h-4 w-4" />
                <span className="hidden sm:inline">Medicamentos</span>
                <Badge variant="secondary" className="ml-1">{tratamiento.medications?.length || 0}</Badge>
              </TabsTrigger>
              <TabsTrigger value="images" className="gap-2">
                <FileImage className="h-4 w-4" />
                <span className="hidden sm:inline">Recetas</span>
                <Badge variant="secondary" className="ml-1">{tratamiento.images?.length || 0}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Información General */}
            <TabsContent value="info" className="flex-1 overflow-y-auto mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Paciente</label>
                      <p className="text-sm mt-1">{tratamiento.patient}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tratamiento</label>
                      <p className="text-sm mt-1">{tratamiento.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Inicio</label>
                      <p className="text-sm mt-1">{new Date(tratamiento.startDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Finalización</label>
                      <p className="text-sm mt-1">{new Date(tratamiento.endDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {tratamiento.symptoms && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Síntomas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{tratamiento.symptoms}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Medicamentos */}
            <TabsContent value="medications" className="flex-1 overflow-y-auto mt-4 space-y-3">
              {tratamiento.medications && tratamiento.medications.length > 0 ? (
                tratamiento.medications.map((med, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base truncate">{med.medication?.commercialName || "Medicamento"}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {med.medication?.activeIngredient || "Principio activo no especificado"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="flex-shrink-0">
                            {med.medication?.unit || "unidades"}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <label className="font-medium text-muted-foreground block mb-1">Dosis</label>
                            <p className="font-semibold">{med.dosage} {med.medication?.unit || "u"}</p>
                          </div>
                          <div>
                            <label className="font-medium text-muted-foreground block mb-1">Frecuencia</label>
                            <p className="font-semibold">c/ {med.frequencyHours}h</p>
                          </div>
                          <div>
                            <label className="font-medium text-muted-foreground block mb-1">Duración</label>
                            <p className="font-semibold">{med.durationDays} días</p>
                          </div>
                        </div>

                        {med.startAtSpecificTime === true && med.specificStartTime && (
                          <div className="bg-muted/50 p-3 rounded-md">
                            <label className="font-medium text-muted-foreground text-sm">⏰ Inicio Programado</label>
                            <p className="text-sm mt-1">
                              {new Date(med.specificStartTime).toLocaleString('es-AR', { 
                                day: '2-digit', 
                                month: 'short', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay medicamentos registrados</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Imágenes y Recetas */}
            <TabsContent value="images" className="flex-1 overflow-y-auto mt-4 space-y-4">
              {tratamiento.images && tratamiento.images.length > 0 ? (
                tratamiento.images.map((image, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={image.imageType === "receta" ? "default" : "secondary"}>
                          {image.imageType === "receta" ? "📋 Receta Médica" : "📖 Instrucciones"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleImageClick(index)}
                          className="gap-2"
                        >
                          <ZoomIn className="h-4 w-4" />
                          Ampliar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Imagen preview */}
                      <div 
                        className="relative w-full aspect-video bg-muted rounded-lg border overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(index)}
                      >
                        <Image
                          src={image.imageUrl}
                          alt={`${image.imageType} del tratamiento`}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Texto extraído y análisis en accordion */}
                      <Accordion type="multiple" className="w-full">
                        {image.extractedText && (
                          <AccordionItem value="extracted-text">
                            <AccordionTrigger className="text-sm font-medium">
                              📄 Texto Extraído por OCR
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="bg-muted/50 p-4 rounded-md max-h-60 overflow-y-auto">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{image.extractedText}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}

                        {image.aiAnalysis && (
                          <AccordionItem value="ai-analysis">
                            <AccordionTrigger className="text-sm font-medium">
                              🤖 Análisis con Inteligencia Artificial
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="bg-[var(--color-info)]/10 p-4 rounded-md max-h-60 overflow-y-auto border border-[var(--color-info)]/20">
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{image.aiAnalysis}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <FileImage className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay imágenes adjuntas</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal fullscreen para ver imágenes */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen p-0 overflow-hidden bg-black/95 border-0" aria-describedby="image-viewer-description">
          <DialogTitle className="sr-only">
            Visor de imágenes - {selectedImage?.imageType === "receta" ? "Receta Médica" : "Instrucciones"}
          </DialogTitle>
          <p id="image-viewer-description" className="sr-only">
            Vista ampliada de {selectedImage?.imageType === "receta" ? "la receta médica" : "las instrucciones"} del tratamiento. Use las flechas para navegar entre imágenes.
          </p>
          
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
            {selectedImage && (
              <Badge variant={selectedImage.imageType === "receta" ? "default" : "secondary"}>
                {selectedImage.imageType === "receta" ? "📋 Receta Médica" : "📖 Instrucciones"}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setImageViewerOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Imagen - ocupa toda la pantalla */}
          <div className="absolute inset-0 flex items-center justify-center">
            {selectedImage && (
              <div className="relative w-full h-full">
                <Image
                  src={selectedImage.imageUrl}
                  alt={`${selectedImage.imageType} del tratamiento`}
                  fill
                  className="object-contain p-4"
                  priority
                  sizes="100vw"
                />
              </div>
            )}
          </div>

          {/* Navegación entre imágenes */}
          {tratamiento.images && tratamiento.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12 backdrop-blur-sm"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-12 w-12 backdrop-blur-sm"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} / {tratamiento.images.length}
              </div>
            </>
          )}

          {/* Texto extraído (footer colapsable) */}
          {selectedImage && (selectedImage.extractedText || selectedImage.aiAnalysis) && (
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-8">
              <Accordion type="single" collapsible className="px-4 pb-4">
                {selectedImage.extractedText && (
                  <AccordionItem value="text" className="border-white/20">
                    <AccordionTrigger className="text-white hover:no-underline text-sm font-medium">
                      📄 Texto Extraído
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-md max-h-32 overflow-y-auto">
                        <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{selectedImage.extractedText}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                {selectedImage.aiAnalysis && (
                  <AccordionItem value="ai" className="border-white/20">
                    <AccordionTrigger className="text-white hover:no-underline text-sm font-medium">
                      🤖 Análisis IA
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-[var(--color-primary-soft-blue)]/40 backdrop-blur-md p-4 rounded-md max-h-32 overflow-y-auto border border-[var(--color-primary-soft-blue)]/30">
                        <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{selectedImage.aiAnalysis}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
