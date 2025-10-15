'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Plus } from 'lucide-react';
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
  const [screenClass, setScreenClass] = useState('screen-large');
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousWidthRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      // Limpiar timeout anterior si existe
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Usar un timeout para evitar múltiples llamadas rápidas
      resizeTimeoutRef.current = setTimeout(() => {
        const width = window.innerWidth;

        // Solo actualizar si el ancho realmente cambió
        if (previousWidthRef.current !== width) {
          let newScreenClass;
          if (width >= 1920) {
            newScreenClass = 'screen-extra-large';
          } else if (width > 1366) {
            newScreenClass = 'screen-large';
          } else if (width <= 1366) {
            newScreenClass = 'screen-medium';
          } else {
            newScreenClass = 'screen-small';
          }

          if (newScreenClass !== screenClass) {
            setScreenClass(newScreenClass);
          }

          previousWidthRef.current = width;
        }
      }, 150); // Pequeño debounce para mejorar el rendimiento
    };

    // Establecer el tamaño inicial
    handleResize();

    // Agregar event listener para cambios de tamaño
    window.addEventListener('resize', handleResize);

    // Forzar una verificación adicional después de un tiempo para manejar cambios de pantalla
    const screenChangeCheck = setTimeout(() => {
      handleResize();
    }, 500);

    // Limpiar los event listeners y timeouts al desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      clearTimeout(screenChangeCheck);
    };
  }, [screenClass]);

  // Función para obtener clases CSS según el tamaño de pantalla
  const getResponsiveClasses = () => {
    switch (screenClass) {
      case 'screen-extra-large':
        return {
          tableText: 'text-lg',
          headerText: 'text-base',
          cellPadding: 'px-4 py-4',
          badgeSize: 'text-base',
          buttonSize: 'p-3 h-10 w-10',
          // Ancho proporcional para cada columna
          colMedicamento: 'w-5/12',
          colPresentacion: 'w-3/12',
          colPrecio: 'w-2/12',
          colAccion: 'w-2/12',
          // Altura máxima para diferentes tamaños de pantalla
          maxHeight: 'max-h-[55vh]'
        };
      case 'screen-large':
        return {
          tableText: 'text-base',
          headerText: 'text-sm',
          cellPadding: 'px-3 py-3',
          badgeSize: 'text-sm',
          buttonSize: 'p-2 h-9 w-9',
          // Ancho proporcional para cada columna
          colMedicamento: 'w-5/12',
          colPresentacion: 'w-3/12',
          colPrecio: 'w-2/12',
          colAccion: 'w-2/12',
          // Altura máxima para diferentes tamaños de pantalla
          maxHeight: 'max-h-[50vh]'
        };
      case 'screen-medium':
        return {
          tableText: 'text-xs',
          headerText: 'text-xs',
          cellPadding: 'px-2 py-2',
          badgeSize: 'text-xs',
          buttonSize: 'p-1.5 h-8 w-8',
          // Ancho proporcional para cada columna
          colMedicamento: 'w-5/12',
          colPresentacion: 'w-3/12',
          colPrecio: 'w-2/12',
          colAccion: 'w-2/12',
          // Altura máxima para diferentes tamaños de pantalla
          maxHeight: 'max-h-[40vh]'
        };
      case 'screen-small':
        return {
          tableText: 'text-[0.6rem]',
          headerText: 'text-[0.6rem]',
          cellPadding: 'px-1.5 py-1.5',
          badgeSize: 'text-[0.6rem]',
          buttonSize: 'p-1 h-7 w-7',
          // Ancho proporcional para cada columna
          colMedicamento: 'w-5/12',
          colPresentacion: 'w-3/12',
          colPrecio: 'w-2/12',
          colAccion: 'w-2/12',
          // Altura máxima para diferentes tamaños de pantalla
          maxHeight: 'max-h-[30vh]'
        };
      default:
        return {
          tableText: 'text-sm',
          headerText: 'text-xs',
          cellPadding: 'px-2 py-2',
          badgeSize: 'text-xs',
          buttonSize: 'p-1.5 h-8 w-8',
          // Ancho proporcional para cada columna
          colMedicamento: 'w-5/12',
          colPresentacion: 'w-3/12',
          colPrecio: 'w-2/12',
          colAccion: 'w-2/12',
          // Altura máxima para diferentes tamaños de pantalla
          maxHeight: 'max-h-[45vh]'
        };
    }
  };

  const classes = getResponsiveClasses();

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
          <div className={`${classes.maxHeight} overflow-y-auto`}>
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className={`${classes.cellPadding} ${classes.colMedicamento} text-left font-medium text-muted-foreground uppercase tracking-wider ${classes.headerText}`}>
                    Medicamento
                  </TableHead>
                  <TableHead
                    className={`${classes.cellPadding} ${classes.colPresentacion} text-left font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors ${classes.headerText}`}
                    onClick={() => handleSort('presentacion')}
                  >
                    <span className="flex items-center">
                      Presentación {getSortIcon('presentacion')}
                    </span>
                  </TableHead>
                  <TableHead
                    className={`${classes.cellPadding} ${classes.colPrecio} text-left font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors ${classes.headerText}`}
                    onClick={() => handleSort('precio')}
                  >
                    <span className="flex items-center">
                      Precio {getSortIcon('precio')}
                    </span>
                  </TableHead>
                  <TableHead className={`${classes.cellPadding} ${classes.colAccion} text-left font-medium text-muted-foreground uppercase tracking-wider ${classes.headerText}`}>
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
                    <TableCell className={`${classes.cellPadding} ${classes.colMedicamento} ${classes.tableText}`}>
                      <div className="font-medium text-foreground break-words leading-tight">
                        {med.NOMBRE}
                      </div>
                      {med.DROGA && med.DROGA !== med.NOMBRE && (
                        <div className="text-muted-foreground mt-1 break-words leading-tight">
                          ({med.DROGA})
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={`${classes.cellPadding} ${classes.colPresentacion} text-foreground ${classes.tableText} break-words leading-tight`}>
                      {med.PRESENTACION}
                    </TableCell>
                    <TableCell className={`${classes.cellPadding} ${classes.colPrecio} text-foreground font-medium`}>
                      <Badge variant="secondary" className={`bg-success/10 text-success ${classes.badgeSize}`}>
                        ${med.PRECIO}
                      </Badge>
                    </TableCell>
                    <TableCell className={`${classes.cellPadding} ${classes.colAccion}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToShoppingList(med)}
                        className={classes.buttonSize}
                      >
                        <Plus className="h-3 w-3" />
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