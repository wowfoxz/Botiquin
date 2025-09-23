'use client';

import { useState } from 'react';

interface Medicamento {
  NOMBRE: string;
  PRESENTACION: string;
  LABORATORIO: string;
  PRECIO: string;
  DROGA: string;
  ACCION: string;
  VIA: string;
  FECHA: string;
  C_BARRA: string;
}

export default function PreciosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      // Usar API route en lugar de llamar directamente a la API externa para evitar CORS
      const response = await fetch('/api/medicamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchdata: searchTerm }),
      });

      const data = await response.json();

      // Asegurarse de que siempre tengamos un array de medicamentos
      const medicamentosArray = Array.isArray(data)
        ? data
        : data?.medicamentos || [];

      setMedicamentos(medicamentosArray);
    } catch (err) {
      setError('Error al buscar medicamentos. Por favor, intente nuevamente.');
      console.error(err);
      // En caso de error, aseguramos que la lista de medicamentos esté vacía
      setMedicamentos([]);
    } finally {
      setLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Consulta de Precios de Medicamentos</h1>

      <div className="rounded-lg shadow-md p-6 mb-8" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar medicamento..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--color-surface-secondary)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border-primary)'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg disabled:opacity-50 font-medium"
            style={{
              backgroundColor: 'var(--color-primary-soft-blue)',
              color: 'var(--color-text-inverse)'
            }}
            disabled={loading || !searchTerm.trim()}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p style={{ color: 'var(--color-text-secondary)' }}>Buscando medicamentos...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg shadow-md p-6 mb-8" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
          <p className="text-center" style={{ color: 'var(--color-error)' }}>{error}</p>
        </div>
      )}

      {medicamentos.length > 0 && (
        <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: 'var(--color-surface-secondary)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Medicamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Presentación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Laboratorio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border-secondary)' }}>
                {medicamentos.map((med, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'var(--color-surface-primary)' : 'var(--color-surface-secondary)' }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {med.NOMBRE}
                      {med.DROGA && med.DROGA !== med.NOMBRE && (
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          ({med.DROGA})
                        </div>
                      )}
                      {med.ACCION && (
                        <div className="text-xs italic" style={{ color: 'var(--color-text-tertiary)' }}>
                          {med.ACCION} - {med.VIA}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {med.PRESENTACION}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {med.LABORATORIO}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      ${med.PRECIO}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {med.FECHA}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {medicamentos.length === 0 && !loading && !error && (
        <div className="rounded-lg shadow-md p-8 text-center" style={{ backgroundColor: 'var(--color-surface-primary)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {searchTerm ? 'No se encontraron medicamentos para su búsqueda.' : 'Ingrese el nombre de un medicamento en el campo de búsqueda para consultar sus precios.'}
          </p>
        </div>
      )}
    </div>
  );
}