import { Suspense } from 'react';
import MedicationForm from './components/MedicationForm';

export default function ManualMedicationPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MedicationForm />
    </Suspense>
  );
}