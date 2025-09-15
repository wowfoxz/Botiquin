import { Medication } from '@prisma/client';
import React from 'react';
import { updateMedicationQuantity, toggleMedicationArchiveStatus } from '@/app/actions';

type MedicationCardProps = {
  medication: Medication;
};

const MedicationCard = ({ medication }: MedicationCardProps) => {
  const { id, commercialName, currentQuantity, unit, description, intakeRecommendations, expirationDate, archived } = medication;

  const isExpired = new Date() > new Date(expirationDate);
  const expirationDateFormatted = new Date(expirationDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${isExpired ? 'border-red-500' : 'border-green-500'}`}>
      <h2 className="text-xl font-bold mb-2">{commercialName}</h2>

      <div className="mb-4">
        <p className="text-gray-700">
          Quedan: <span className="font-semibold">{currentQuantity} {unit}</span>
        </p>
        <form action={updateMedicationQuantity} className="flex items-center gap-2 mt-2">
            <input type="hidden" name="id" value={id} />
            <input
              type="number"
              name="newQuantity"
              defaultValue={currentQuantity}
              step="any"
              className="w-24 appearance-none block bg-gray-200 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none focus:bg-white"
            />
            <button type="submit" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-3 rounded text-sm">
              Actualizar
            </button>
        </form>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-800">Para qué se usa:</h3>
        <p className="text-gray-600">{description || 'No especificado'}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-800">Recomendaciones de Ingesta:</h3>
        <p className="text-gray-600">{intakeRecommendations || 'No especificado'}</p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500">
          Vence el: <span className={isExpired ? 'text-red-600 font-bold' : ''}>{expirationDateFormatted}</span>
        </div>
        <form action={toggleMedicationArchiveStatus}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
              {archived ? 'Desarchivar' : 'Archivar'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default MedicationCard;
