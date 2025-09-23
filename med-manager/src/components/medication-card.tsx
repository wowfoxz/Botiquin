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
    <div
      className="rounded-lg shadow-md p-6 border-l-4"
      style={{
        backgroundColor: 'var(--color-surface-secondary)',
        borderColor: isExpired ? 'var(--color-error)' : 'var(--color-success)',
        color: 'var(--color-text-primary)'
      }}
    >
      <h2 className="text-xl font-bold mb-2">{commercialName}</h2>

      <div className="mb-4">
        <p>
          Quedan: <span className="font-semibold">{currentQuantity} {unit}</span>
        </p>
        <form action={updateMedicationQuantity} className="flex items-center gap-2 mt-2">
            <input type="hidden" name="id" value={id} />
            <input
              type="number"
              name="newQuantity"
              defaultValue={currentQuantity}
              step="any"
              className="appearance-none block rounded py-2 px-3 leading-tight focus:outline-none"
              style={{
                backgroundColor: 'var(--color-surface-tertiary)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-primary)'
              }}
            />
            <button
              type="submit"
              className="font-bold py-2 px-3 rounded text-sm"
              style={{
                backgroundColor: 'var(--color-surface-interactive)',
                color: 'var(--color-text-inverse)'
              }}
            >
              Actualizar
            </button>
        </form>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Para qué se usa:</h3>
        <p>{description || 'No especificado'}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Recomendaciones de Ingesta:</h3>
        <p>{intakeRecommendations || 'No especificado'}</p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="text-sm">
          Vence el: <span className={isExpired ? 'font-bold' : ''} style={{ color: isExpired ? 'var(--color-error)' : 'inherit' }}>{expirationDateFormatted}</span>
        </div>
        <form action={toggleMedicationArchiveStatus}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="text-sm font-medium hover:opacity-80"
              style={{ color: 'var(--color-error)' }}
            >
              {archived ? 'Desarchivar' : 'Archivar'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default MedicationCard;
