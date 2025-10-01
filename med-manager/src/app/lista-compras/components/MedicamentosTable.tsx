'use client';

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowUpDown } from 'lucide-react';
import Loader from '@/components/Loader_lupa';
import { Medicamento } from '../types';

interface MedicamentosTableProps {
  loading: boolean;
  error: string | null;
  medicamentos: Medicamento[];
  sortedMedicamentos: Medicamento[];
  handleSort: (field: 'precio' | 'presentacion' | null) => void;
  getSortIcon: (field: 'precio' | 'presentacion' | null) => React.ReactNode;
  addToShoppingList: (medicamento: Medicamento) => void;
  searchTerm: string;
}

const MedicamentosTable: React.FC<MedicamentosTableProps> = ({
  loading,
  error,
  medicamentos,
  sortedMedicamentos,
  handleSort,
  getSortIcon,
  addToShoppingList,
  searchTerm
}) => {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-0">
        {loading && (
          <div className="p-8 text-center">
            <Loader />
            <p className="mt-2 text-muted-foreground">Buscando medicamentos...</p>
          </div>
        )}

        {error && (
          <div className="p-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <p className="text-center text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

        {medicamentos.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Medicamento
                  </TableHead>
                  <TableHead
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('presentacion')}
                  >
                    <span className="flex items-center">
                      Presentación {getSortIcon('presentacion')}
                    </span>
                  </TableHead>
                  <TableHead
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('precio')}
                  >
                    <span className="flex items-center">
                      Precio {getSortIcon('precio')}
                    </span>
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {sortedMedicamentos.map((med, index) => (
                  <TableRow
                    key={index}
                    className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'} hover:bg-muted/50`}
                  >
                    <TableCell className="px-4 py-4">
                      <div className="font-medium text-foreground">{med.NOMBRE}</div>
                      {med.DROGA && med.DROGA !== med.NOMBRE && (
                        <div className="text-sm text-muted-foreground mt-1">({med.DROGA})</div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-foreground">
                      {med.PRESENTACION}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-foreground font-medium">
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        ${med.PRECIO}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToShoppingList(med)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          medicamentos.length === 0 && !loading && !error && (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">💊</div>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm 
                  ? 'No se encontraron medicamentos para su búsqueda.' 
                  : 'Ingrese el nombre de un medicamento en el campo de búsqueda para comenzar.'}
              </p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default MedicamentosTable;