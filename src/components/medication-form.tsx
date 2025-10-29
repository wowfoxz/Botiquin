'use client';

import { addMedication } from '@/app/actions';
import { toast } from 'sonner';

interface MedicationFormProps {
  children: React.ReactNode;
}

export default function MedicationForm({ children }: MedicationFormProps) {

  const handleSubmit = async (formData: FormData) => {
    try {
      await addMedication(formData);
      // La redirección se maneja en la acción del servidor
    } catch (error) {
      console.error('Error al agregar medicamento:', error);
      toast.error('Error al agregar el medicamento');
    }
  };

  return (
    <form action={handleSubmit}>
      {children}
    </form>
  );
}
