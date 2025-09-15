import MedicationList from '@/components/medication-list';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Stock de Medicamentos</h1>
        <div className="flex items-center gap-4">
            <Link href="/medications/archived" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Ver Archivados
            </Link>
            <Link href="/medications/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Agregar Medicamento
            </Link>
        </div>
      </div>

      <div className="mt-12">
        <MedicationList />
      </div>
    </main>
  );
}
