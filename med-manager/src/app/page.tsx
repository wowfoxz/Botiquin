import MedicationList from '@/components/medication-list';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Medication Stock</h1>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Medication
        </button>
      </div>

      <div className="mt-12">
        <MedicationList />
      </div>
    </main>
  );
}
