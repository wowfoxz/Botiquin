import React from 'react';
import MedicationCard from './medication-card';
import prisma from '@/lib/prisma';

const MedicationList = async ({ query }: { query: string }) => {
  const medications = await prisma.medication.findMany({
    where: {
      archived: false,
      OR: [
        {
          commercialName: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          activeIngredient: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
    orderBy: {
      expirationDate: 'asc',
    },
  });

  if (medications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron medicamentos.</p>
        <p className="text-gray-500">Intenta con otra búsqueda o agrega un nuevo medicamento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {medications.map((med) => (
        <MedicationCard key={med.id} medication={med} />
      ))}
    </div>
  );
};

export default MedicationList;
