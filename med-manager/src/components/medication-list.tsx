import React from 'react';
import MedicationCard from './medication-card';
import prisma from '@/lib/prisma';

const MedicationList = async ({ query }: { query: string }) => {
  // Primero, obtenemos todos los medicamentos activos.
  const allMedications = await prisma.medication.findMany({
    where: {
      archived: false,
    },
    orderBy: {
      expirationDate: 'asc',
    },
  });

  // Luego, filtramos los resultados en el código para permitir una búsqueda insensible a mayúsculas.
  // Esto soluciona la limitación de la base de datos SQLite.
  const filteredMedications = allMedications.filter((med) => {
    const queryLower = query.toLowerCase();
    const nameLower = med.commercialName.toLowerCase();
    const ingredientLower = med.activeIngredient?.toLowerCase() || '';

    return nameLower.includes(queryLower) || ingredientLower.includes(queryLower);
  });

  if (filteredMedications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron medicamentos.</p>
        <p className="text-gray-500">Intenta con otra búsqueda o agrega un nuevo medicamento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMedications.map((med) => (
        <MedicationCard key={med.id} medication={med} />
      ))}
    </div>
  );
};

export default MedicationList;
