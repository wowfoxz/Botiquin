import React from 'react';
import MedicationCard from '@/components/medication-card';
import prisma from '@/lib/prisma';
import Link from 'next/link';

const ArchivedMedicationsPage = async () => {
  const medications = await prisma.medication.findMany({
    where: {
      archived: true,
    },
    orderBy: {
      commercialName: 'asc',
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Medicamentos Archivados</h1>
            <Link href="/" className="hover:underline" style={{ color: 'var(--color-primary-soft-blue)' }}>
                &larr; Volver al Stock
            </Link>
        </div>

        {medications.length === 0 ? (
            <div className="text-center py-12">
                <p style={{ color: 'var(--color-text-secondary)' }}>No tienes medicamentos archivados.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((med) => (
                <MedicationCard key={med.id} medication={med} />
            ))}
            </div>
        )}
      </div>
    </main>
  );
};

export default ArchivedMedicationsPage;
