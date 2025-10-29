"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, FileImage, X, Eye, EyeOff, Sparkles, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css';
import { apiFetch } from "@/lib/api";

interface TreatmentImage {
  id: string;
  file: File;
  imageType: "receta" | "instrucciones";
  imageUrl: string;
  extractedText?: string;
  aiAnalysis?: string;
  isAnalyzing?: boolean;
}

interface TreatmentImageUploaderProps {
  images: TreatmentImage[];
  onImagesChange: (images: TreatmentImage[]) => void;
  disabled?: boolean;
}

export function TreatmentImageUploader({ 
  images, 
  onImagesChange, 
  disabled = false 
}: TreatmentImageUploaderProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState<{ [key: string]: boolean }>({});
  const [expandedImages, setExpandedImages] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previousImagesCount = useRef<number>(0);
  const imagesRef = useRef<TreatmentImage[]>(images); // ✅ Ref para mantener el valor actual

  // ✅ Actualizar el ref cuando cambian las imágenes
  useEffect(() => {
    imagesRef.current = images;
    console.log('📦 imagesRef actualizado:', images.length);
  }, [images]);

  // ✅ Efecto para expandir automáticamente nuevas imágenes
  useEffect(() => {
    if (images.length > previousImagesCount.current) {
      // Se agregó una nueva imagen
      const newImage = images[images.length - 1];
      console.log('🆕 Nueva imagen detectada en useEffect:', newImage.id);
      
      setExpandedImages(prev => {
        const updated = { ...prev, [newImage.id]: true };
        console.log('🔵 expandedImages actualizado desde useEffect:', updated);
        return updated;
      });
      
      setShowAnalysis(prev => {
        const updated = { ...prev, [newImage.id]: true };
        console.log('🔵 showAnalysis actualizado desde useEffect:', updated);
        return updated;
      });
    }
    previousImagesCount.current = images.length;
  }, [images]);

  const handleFileSelect = async (file: File, imageType: "receta" | "instrucciones") => {
      console.log('📸 handleFileSelect llamado:', { fileName: file.name, fileType: file.type, imageType });
      
      if (!file.type.startsWith('image/')) {
        console.error('❌ Archivo no es una imagen:', file.type);
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      console.log('✅ Archivo válido, creando imagen temporal...');

      // Crear imagen temporal para mostrar mientras se sube
      const tempImageUrl = URL.createObjectURL(file);
      const newImage: TreatmentImage = {
        id: `temp-${Date.now()}-${Math.random()}`,
        file,
        imageType,
        imageUrl: tempImageUrl,
        isAnalyzing: true,
      };

      console.log('📦 Nueva imagen creada:', { id: newImage.id, imageType, tempImageUrl });
      
      // ✅ Expandir la imagen y mostrar el análisis automáticamente
      setExpandedImages(prev => ({
        ...prev,
        [newImage.id]: true
      }));
      
      setShowAnalysis(prev => ({
        ...prev,
        [newImage.id]: true
      }));

      // ✅ CRÍTICO: Usar imagesRef.current para evitar closure stale
      console.log('📦 Array de imágenes ANTES de agregar (ref):', imagesRef.current.length);
      const updatedImages = [...imagesRef.current, newImage];
      console.log('📦 Array de imágenes DESPUÉS de agregar:', updatedImages.length);
      onImagesChange(updatedImages);
      console.log('🔵 Imagen agregada, expandedImages y showAnalysis activados para:', newImage.id);

      try {
        // Subir imagen al servidor
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        uploadFormData.append('imageType', imageType);

        const uploadResponse = await apiFetch('/api/tratamientos/upload-image', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Error al subir imagen: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log('✅ Imagen subida al servidor:', uploadResult.imageUrl); // ✅ Log

        // ✅ CRÍTICO: Usar imagesRef.current para evitar closure stale
        const updatedImages = imagesRef.current.map(img => 
          img.id === newImage.id 
            ? { 
                ...img, 
                imageUrl: uploadResult.imageUrl, // URL del servidor
                isAnalyzing: false
              }
            : img
        );
        console.log('📦 Imágenes después de actualizar URL del servidor:', updatedImages.length); // ✅ Log
        onImagesChange(updatedImages);

        // Ahora hacer el análisis con IA
        const updatedImage = { ...newImage, imageUrl: uploadResult.imageUrl };
        analyzeImageWithAI(updatedImage);

      } catch (error) {
        console.error('❌ Error al subir imagen:', error);
        
        // ✅ CRÍTICO: Usar imagesRef.current
        const errorImages = imagesRef.current.map(img => 
          img.id === newImage.id 
            ? { 
                ...img, 
                extractedText: "Error al subir la imagen",
                aiAnalysis: `No se pudo procesar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                isAnalyzing: false 
              }
            : img
        );
        onImagesChange(errorImages);
      }
    };

  const analyzeImageWithAI = async (image: TreatmentImage) => {
    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('imageType', image.imageType);


      // Llamar a la API de análisis de IA
      const response = await apiFetch('/api/tratamientos/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const analysis = await response.json();
      
      // ✅ Usar imagesRef.current para evitar closure stale
      const updatedImages = imagesRef.current.map(img => 
        img.id === image.id 
          ? { 
              ...img, 
              extractedText: analysis.extractedText || "",
              aiAnalysis: analysis.aiAnalysis || "",
              isAnalyzing: false 
            }
          : img
      );
      onImagesChange(updatedImages);
      
      // ✅ Mostrar automáticamente el análisis cuando termina
      setShowAnalysis(prev => ({
        ...prev,
        [image.id]: true
      }));
    } catch (error) {
      console.error('Error al analizar imagen:', error);
      // ✅ Usar imagesRef.current
      const errorImages = imagesRef.current.map(img => 
        img.id === image.id 
          ? { 
              ...img, 
              extractedText: "Error al analizar la imagen",
              aiAnalysis: `No se pudo procesar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`,
              isAnalyzing: false 
            }
          : img
      );
      onImagesChange(errorImages);
    }
  };

  const removeImage = (imageId: string) => {
    // ✅ Usar imagesRef.current
    const updatedImages = imagesRef.current.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const toggleImageExpansion = (imageId: string) => {
    setExpandedImages(prev => ({
      ...prev,
      [imageId]: !prev[imageId]
    }));
  };

  const toggleAnalysis = (imageId: string) => {
    setShowAnalysis(prev => ({
      ...prev,
      [imageId]: !prev[imageId]
    }));
  };

  const startCamera = async () => {
    console.log('📷 startCamera llamado');
    try {
      setIsCameraActive(true);
      console.log('📷 Solicitando permiso de cámara...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      console.log('✅ Permiso de cámara concedido, stream:', stream);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
        console.log('✅ Video iniciado');
      }
    } catch (err) {
      console.error('❌ Error accessing camera:', err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = (imageType: "receta" | "instrucciones") => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `captured-${imageType}-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        handleFileSelect(file, imageType);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Imágenes del Tratamiento</Label>
        <Badge variant="outline" className="text-xs">
          Recetas e Instrucciones
        </Badge>
      </div>

      {/* Resumen de imágenes */}
      {images.length > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              <span className="text-sm font-medium">
                Imágenes cargadas: {images.length}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>
                Recetas: {images.filter(img => img.imageType === "receta").length}
              </span>
              <span>
                Instrucciones: {images.filter(img => img.imageType === "instrucciones").length}
              </span>
              <span>
                Analizadas: {images.filter(img => !img.isAnalyzing && img.extractedText).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botones de carga */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cargar Receta */}
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                <FileImage className="text-primary" size={20} />
              </div>
              <div>
                <h4 className="font-medium">Receta Médica</h4>
                <p className="text-xs text-muted-foreground">
                  Foto de la receta del médico
                </p>
                {images.filter(img => img.imageType === "receta").length > 0 && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {images.filter(img => img.imageType === "receta").length} cargada(s)
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🔴 Botón "Subir Receta" clickeado');
                    console.log('fileInputRef.current:', fileInputRef.current);
                    fileInputRef.current?.click();
                  }}
                  disabled={disabled}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Subir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('📷 Botón "Foto Receta" clickeado');
                    startCamera();
                  }}
                  disabled={disabled}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Foto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cargar Instrucciones */}
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="mx-auto bg-secondary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                <FileImage className="text-secondary-foreground" size={20} />
              </div>
              <div>
                <h4 className="font-medium">Instrucciones</h4>
                <p className="text-xs text-muted-foreground">
                  Instrucciones de toma del médico
                </p>
                {images.filter(img => img.imageType === "instrucciones").length > 0 && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {images.filter(img => img.imageType === "instrucciones").length} cargada(s)
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('🟡 Botón "Subir Instrucciones" clickeado');
                    console.log('cameraInputRef.current:', cameraInputRef.current);
                    cameraInputRef.current?.click();
                  }}
                  disabled={disabled}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Subir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('📷 Botón "Foto Instrucciones" clickeado');
                    startCamera();
                  }}
                  disabled={disabled}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Foto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cámara */}
      {isCameraActive && (
        <Card className="border-2 border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tomar Foto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-md"
                autoPlay
                playsInline
                muted
              />
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="default"
                onClick={() => captureImage("receta")}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Capturar Receta
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => captureImage("instrucciones")}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Capturar Instrucciones
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Imágenes cargadas */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Imágenes Cargadas ({images.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((image) => {
              const isExpanded = expandedImages[image.id];
              const showAnalysisFor = showAnalysis[image.id];
              console.log(`🔍 Renderizando imagen ${image.id}:`, {
                isExpanded,
                showAnalysisFor,
                isAnalyzing: image.isAnalyzing,
                hasExtractedText: !!image.extractedText,
                hasAiAnalysis: !!image.aiAnalysis
              });
              
              return (
                <Card key={image.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => toggleImageExpansion(image.id)}
                      >
                        <Badge variant={image.imageType === "receta" ? "default" : "secondary"}>
                          {image.imageType === "receta" ? "Receta" : "Instrucciones"}
                        </Badge>
                        {image.isAnalyzing && (
                          <Badge variant="outline" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            Analizando
                          </Badge>
                        )}
                        {!image.isAnalyzing && image.extractedText && (
                          <Badge variant="secondary" className="gap-1">
                            <Eye className="h-3 w-3" />
                            Analizada
                          </Badge>
                        )}
                        <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(image.id)}
                        disabled={disabled}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                
                {isExpanded && (
                <CardContent className="space-y-4">
                  {/* Imagen */}
                  <div className="relative">
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
                    {image.isAnalyzing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                        <div className="text-center text-white">
                          <Cardio size={30} stroke={3} speed={1} color="white" />
                          <p className="text-sm mt-2">Analizando con IA...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Análisis de IA */}
                  {image.extractedText && !image.isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Análisis con IA</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAnalysis(image.id)}
                          className="gap-1"
                        >
                          {showAnalysisFor ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          {showAnalysisFor ? "Ocultar" : "Ver"}
                        </Button>
                      </div>
                      
                      {showAnalysisFor && (
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Texto Extraído</Label>
                            <Textarea
                              value={image.extractedText}
                              onChange={(e) => {
                                // ✅ CRÍTICO: Usar imagesRef.current
                                const updatedImages = imagesRef.current.map(img => 
                                  img.id === image.id 
                                    ? { ...img, extractedText: e.target.value }
                                    : img
                                );
                                onImagesChange(updatedImages);
                              }}
                              className="min-h-[100px] text-sm"
                              placeholder="Texto extraído por IA..."
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Puedes editar este texto si encuentras algún error
                            </p>
                          </div>
                          {image.aiAnalysis && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Análisis Estructurado</Label>
                              <Textarea
                                value={image.aiAnalysis}
                                onChange={(e) => {
                                  // ✅ CRÍTICO: Usar imagesRef.current
                                  const updatedImages = imagesRef.current.map(img => 
                                    img.id === image.id 
                                      ? { ...img, aiAnalysis: e.target.value }
                                      : img
                                  );
                                  onImagesChange(updatedImages);
                                }}
                                className="min-h-[80px] text-sm"
                                placeholder="Análisis estructurado por IA..."
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Puedes editar este análisis si necesitas corregir algo
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                )}
              </Card>
            );
            })}
          </div>
        </div>
      )}

      {/* Inputs ocultos para archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          console.log('🔵 Input file (receta) onChange disparado');
          const file = e.target.files?.[0];
          if (file) {
            console.log('✅ Archivo seleccionado (receta):', file.name);
            handleFileSelect(file, "receta");
          } else {
            console.log('❌ No se seleccionó ningún archivo (receta)');
          }
        }}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          console.log('🟢 Input file (instrucciones) onChange disparado');
          const file = e.target.files?.[0];
          if (file) {
            console.log('✅ Archivo seleccionado (instrucciones):', file.name);
            handleFileSelect(file, "instrucciones");
          } else {
            console.log('❌ No se seleccionó ningún archivo (instrucciones)');
          }
        }}
        className="hidden"
      />
    </div>
  );
}
