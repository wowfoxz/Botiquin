"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Camera, X, User } from "lucide-react";
import { toast } from "sonner";

interface PhotoUploadProps {
  currentPhoto?: string | null;
  onPhotoChange: (photo: string | null) => void;
  disabled?: boolean;
}

export function PhotoUpload({ currentPhoto, onPhotoChange, disabled = false }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setPreview(currentPhoto || null);
  }, [currentPhoto]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreview(result);
          onPhotoChange(result);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Por favor selecciona un archivo de imagen válido');
      }
    }
  };

  const handleCameraClick = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      // Esperar un poco para que el modal se abra completamente
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      toast.error('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Aplicar transformación para desespejar la imagen capturada
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0);
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(dataURL);
        onPhotoChange(dataURL);
        closeCamera();
      }
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const removePhoto = () => {
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Foto de Perfil</Label>
      
      {/* Vista previa de la foto */}
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
          {preview ? (
            <img 
              src={preview} 
              alt="Foto de perfil" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Botón para subir archivo */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Subir
          </Button>
          
          {/* Botón para tomar foto */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCameraClick}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Cámara
          </Button>
          
          {/* Botón para eliminar foto */}
          {preview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removePhoto}
              disabled={disabled}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>
      
      {/* Input oculto para archivos */}
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {/* Modal de cámara */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => !open && closeCamera()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tomar Foto</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-80 object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeCamera}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={capturePhoto}
                className="flex items-center gap-2"
                disabled={!stream}
              >
                <Camera className="w-4 h-4" />
                Capturar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
