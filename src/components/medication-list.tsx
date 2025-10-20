import React from 'react';
import MedicationCard from './medication-card';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Medication } from '@prisma/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const MedicationList = async ({ query }: { query: string }) => {
  // Verificar si el usuario está autenticado
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) {
    redirect('/login');
  }

  // Para evitar problemas con el parámetro 'mode', hacemos una consulta más simple
  // y filtramos los resultados manualmente si es necesario
  let medications: Medication[] = [];
  try {
    // Construimos la clausula "where" de manera dinámica para soportar
    // búsquedas vacías o con texto sin duplicar llamadas a la BD.
    // Usamos un Record<string, unknown> en lugar de 'any' para mantener flexibilidad
    // al construir dinámicamente la clausula WHERE sin perder toda la seguridad de tipo.
    const whereClause: Record<string, unknown> = { archived: false };
    const q = query?.trim();
    if (q) {
      whereClause.OR = [
        {
          commercialName: {
            contains: q,
          },
        },
        {
          activeIngredient: {
            contains: q,
          },
        },
      ];
    }

    medications = await prisma.medication.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    // Si ocurre un error al obtener los medicamentos, dejamos el arreglo vacío
    // para que el componente muestre el estado de "no resultados".
    medications = [];
  }

  if (medications.length === 0) {
    return (
      <Alert variant="default" className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No se encontraron medicamentos</AlertTitle>
        <AlertDescription>
          Intenta usar palabras clave diferentes
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {medications.map((medication) => (
        <MedicationCard key={medication.id} medication={medication} />
      ))}
    </div>
  );
};

export default MedicationList;