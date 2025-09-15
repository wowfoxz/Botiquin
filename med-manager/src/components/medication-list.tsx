import React from 'react';
import MedicationCard from './medication-card';
import prisma from '@/lib/prisma';

const MedicationList = async () => {
  const medications = await prisma.medication.findMany({
    where: {
      archived: false,
    },
    orderBy: {
      expirationDate: 'asc',
    },
  });

  if (medications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay medicamentos en tu stock.</p>
        <p className="text-gray-500">¡Agrega uno para empezar!</p>
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
