'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { processUploadedImage } from '@/app/actions';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const searchParams = useSearchParams();

  useEffect(() => {
    const errorMessage = searchParams.get('error');
    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
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
      await processUploadedImage(pureBase64, file.type);
      // The server action will handle the redirect. If it fails,
      // it will redirect back here with an error. If it succeeds,
      // it will redirect to the new medication form.
      // We might not hit the finally block if redirect happens.
    } catch (err) {
        // This catch block is a safeguard for unexpected client-side errors.
        setError('Ocurrió un error inesperado al enviar la imagen.');
        console.error(err);
        setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Agregar con Foto</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-6">
            <label htmlFor="image-upload" className="block text-gray-700 text-sm font-bold mb-2">
              Sube una foto de la caja del medicamento
            </label>
            <p className="text-gray-600 text-xs italic mb-4">En tu teléfono, podrás usar la cámara directamente.</p>
            <input
              id="image-upload"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {file && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Vista previa:</p>
              <img src={URL.createObjectURL(file)} alt="Vista previa de la imagen seleccionada" className="mt-2 rounded-md max-h-48 mx-auto" />
            </div>
          )}

          {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

          <div className="flex items-center justify-center mt-6">
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isSubmitting ? 'Analizando con IA...' : 'Analizar Imagen'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
