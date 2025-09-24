'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpDown } from 'lucide-react';

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

type SortField = 'precio' | 'presentacion' | null;
type SortDirection = 'asc' | 'desc';

export default function PreciosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Si ya estamos ordenando por este campo, cambiamos la dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es un nuevo campo, ordenamos ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Ordenar los medicamentos según el campo y dirección seleccionados
  // Ordenar los medicamentos según el campo y dirección seleccionados
  const sortedMedicamentos = useMemo(() => {
    if (!sortField) return medicamentos;

    return [...medicamentos].sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case 'precio': {
          // Convertir a número para comparar correctamente
          // Manejar el caso en que PRECIO podría ser un número o string
          const precioA = typeof a.PRECIO === 'string' ? a.PRECIO : String(a.PRECIO);
          const precioB = typeof b.PRECIO === 'string' ? b.PRECIO : String(b.PRECIO);
          aValue = parseFloat(precioA.replace('$', '').replace(/[, ]+/g, '')) || 0;
          bValue = parseFloat(precioB.replace('$', '').replace(/[, ]+/g, '')) || 0;
          break;
        }
        case 'presentacion':
          aValue = a.PRESENTACION ? a.PRESENTACION.toLowerCase() : '';
          bValue = b.PRESENTACION ? b.PRESENTACION.toLowerCase() : '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [medicamentos, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline" />;
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-text-primary">Consulta de Precios de Medicamentos</h1>

      <Card className="mb-8 shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar medicamento..."
                className="w-full"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-primary-500 hover:bg-primary-500/90 text-text-inverse font-medium transition-all duration-200"
              disabled={loading || !searchTerm.trim()}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-text-inverse border-t-transparent rounded-full"></span>
                  Buscando...
                </span>
              ) : 'Buscar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-text-secondary">Buscando medicamentos...</p>
        </div>
      )}

      {error && (
        <Card className="mb-8 shadow-lg border border-error/20 bg-error/5">
          <CardContent className="p-6">
            <p className="text-center text-error font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {medicamentos.length > 0 ? (
        <Card className="shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-secondary">
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Medicamento
                    </TableHead>
                    <TableHead
                      className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider hidden md:table-cell cursor-pointer hover:bg-surface-interactive/30 transition-colors"
                      onClick={() => handleSort('presentacion')}
                    >
                      <span className="flex items-center">
                        Presentación {sortField === 'presentacion' && getSortIcon('presentacion')}
                      </span>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider hidden lg:table-cell">
                      Laboratorio
                    </TableHead>
                    <TableHead
                      className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider cursor-pointer hover:bg-surface-interactive/30 transition-colors"
                      onClick={() => handleSort('precio')}
                    >
                      <span className="flex items-center">
                        Precio {sortField === 'precio' && getSortIcon('precio')}
                      </span>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider hidden sm:table-cell">
                      Fecha
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-border-secondary">
                  {sortedMedicamentos.map((med, index) => (
                    <TableRow
                      key={index}
                      className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-surface-primary' : 'bg-surface-secondary'} hover:bg-surface-interactive/30`}
                    >
                      <TableCell className="px-4 py-4">
                        <div className="font-medium text-text-primary">{med.NOMBRE}</div>
                        {med.DROGA && med.DROGA !== med.NOMBRE && (
                          <div className="text-sm text-text-secondary mt-1">({med.DROGA})</div>
                        )}

                        {/* Responsive details */}
                        <div className="text-sm text-text-tertiary mt-1 md:hidden">
                          <span className="font-medium">Presentación:</span> {med.PRESENTACION}
                        </div>
                        <div className="text-sm text-text-tertiary mt-1 lg:hidden">
                          <span className="font-medium">Laboratorio:</span> {med.LABORATORIO}
                        </div>
                        <div className="text-sm text-text-tertiary mt-1 sm:hidden">
                          <span className="font-medium">Fecha:</span> {med.FECHA}
                        </div>

                        {med.ACCION && (
                          <div className="text-sm italic text-text-tertiary mt-1">{med.ACCION} - {med.VIA}</div>
                        )}
                      </TableCell>

                      <TableCell className="px-4 py-4 text-text-primary hidden md:table-cell">
                        {med.PRESENTACION}
                      </TableCell>

                      <TableCell className="px-4 py-4 text-text-primary hidden lg:table-cell">
                        {med.LABORATORIO}
                      </TableCell>

                      <TableCell className="px-4 py-4 text-text-primary font-medium">
                        <span className="bg-success/10 text-success px-2 py-1 rounded-md">
                          ${med.PRECIO}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-4 text-text-primary hidden sm:table-cell">
                        {med.FECHA}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        medicamentos.length === 0 && !loading && !error && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="text-5xl mb-4">💊</div>
              <p className="text-text-secondary max-w-md mx-auto">
                {searchTerm ? 'No se encontraron medicamentos para su búsqueda.' : 'Ingrese el nombre de un medicamento en el campo de búsqueda para consultar sus precios.'}
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}