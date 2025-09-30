'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { processUploadedImage } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { IconArrowLeft } from '@tabler/icons-react';
import BookLoader from '@/components/BookLoader';
export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
      // Decode once and set to state
      setError(decodeURIComponent(errorMessage));
    }
  }, [searchParams]);

  // Cleanup function to stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setError('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefer rear camera if available
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Try to play the video if autoplay is blocked
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Por favor, selecciona una imagen.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore errors when stopping tracks
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      // Remove the stream from the video element to release resources
      try {
        // Clear srcObject in a type-safe way
        (videoRef.current as HTMLVideoElement).srcObject = null;
      } catch (e) {
        // ignore
      }
    }

    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !streamRef.current) {
      setError('La cámara no está activa.');
      return;
    }

    const videoEl = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || 640;
    canvas.height = videoEl.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('No se pudo capturar la imagen.');
      return;
    }

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('No se pudo procesar la imagen capturada.');
        return;
      }

      const capturedFile = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      setFile(capturedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(capturedFile);
    }, 'image/jpeg', 0.9);

    stopCamera();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file || !imageBase64) {
      setError('Por favor, selecciona una imagen.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const pureBase64 = imageBase64.split(',')[1];
      // No necesitamos await aquí ya que processUploadedImage manejará la redirección
      processUploadedImage(pureBase64, file.type);
      // Si llegamos aquí, significa que processUploadedImage no redirigió,
      // lo cual podría indicar un problema
    } catch (err) {
      // This catch block is a safeguard for unexpected client-side errors.
      setError('Ocurrió un error inesperado al enviar la imagen.');
      console.error(err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <Card className="shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Agregar con Foto</CardTitle>
            <CardDescription>Sube una foto de la caja del medicamento</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {!isCameraActive ? (
                  <>
                    {!file ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="image-upload" style={{ color: 'var(--foreground)' }}>
                            Selecciona una imagen
                          </Label>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Puedes subir una imagen desde tu dispositivo o usar la cámara.
                          </p>
                          <input
                            id="image-upload"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold focus:outline-none"
                            style={{
                              color: 'var(--muted-foreground)'
                            }}
                          />
                        </div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="px-2" style={{ backgroundColor: 'var(--background)', color: 'var(--muted-foreground)' }}>
                              o
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={startCamera}
                          variant="outline"
                          className="w-full"
                        >
                          Usar Cámara
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Vista previa:</p>
                          <div className="relative rounded-md max-h-48 mx-auto w-full">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt="Vista previa de la imagen seleccionada"
                              width={400}
                              height={300}
                              className="rounded-md object-contain w-full h-auto max-h-48"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setImageBase64('');
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Cambiar Imagen
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Captura con Cámara:</p>
                      <div className="relative rounded-md max-h-64 mx-auto w-full bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-auto max-h-64 object-contain"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={stopCamera}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={captureImage}
                        className="flex-1"
                      >
                        Capturar
                      </Button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="text-sm text-destructive text-center">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>

            {file && !isCameraActive && (
              <CardFooter className="flex flex-col items-center">
                {isSubmitting ? (
                  <div className="w-full flex flex-col items-center py-4">
                    <BookLoader isVisible={isSubmitting} />
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="w-full"
                  >
                    Analizar Imagen
                  </Button>
                )}
              </CardFooter>
            )}
          </form>
        </Card>
      </div>
    </main>
  );
}
