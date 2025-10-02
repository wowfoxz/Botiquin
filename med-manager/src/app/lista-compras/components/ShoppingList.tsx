'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Save, Copy, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ShoppingItem } from '../types';

interface ShoppingListProps {
  listName: string;
  setListName: (name: string) => void;
  shoppingItems: ShoppingItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  totalAmount: number;
  saveShoppingList: () => void;
  exportList: (format: 'image' | 'pdf' | 'text') => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({
  listName,
  setListName,
  shoppingItems,
  updateQuantity,
  removeItem,
  totalAmount,
  saveShoppingList,
  exportList
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
          // Altura máxima para diferentes tamaños de pantalla (misma que MedicamentosTable)
          maxHeight: 'max-h-[58vh]'
        };
      case 'screen-large':
        return {
          tableText: 'text-base',
          headerText: 'text-sm',
          cellPadding: 'px-3 py-3',
          badgeSize: 'text-sm',
          buttonSize: 'p-2 h-9 w-9',
          // Altura máxima para diferentes tamaños de pantalla (misma que MedicamentosTable)
          maxHeight: 'max-h-[54vh]'
        };
      case 'screen-medium':
        return {
          tableText: 'text-xs',
          headerText: 'text-xs',
          cellPadding: 'px-2 py-2',
          badgeSize: 'text-xs',
          buttonSize: 'p-1.5 h-8 w-8',
          // Altura máxima para diferentes tamaños de pantalla (misma que MedicamentosTable)
          maxHeight: 'max-h-[45vh]'
        };
      case 'screen-small':
        return {
          tableText: 'text-[0.6rem]',
          headerText: 'text-[0.6rem]',
          cellPadding: 'px-1.5 py-1.5',
          badgeSize: 'text-[0.6rem]',
          buttonSize: 'p-1 h-7 w-7',
          // Altura máxima para diferentes tamaños de pantalla (misma que MedicamentosTable)
          maxHeight: 'max-h-[40vh]'
        };
      default:
        return {
          tableText: 'text-sm',
          headerText: 'text-xs',
          cellPadding: 'px-2 py-2',
          badgeSize: 'text-xs',
          buttonSize: 'p-1.5 h-8 w-8',
          // Altura máxima para diferentes tamaños de pantalla (misma que MedicamentosTable)
          maxHeight: 'max-h-[45vh]'
        };
    }
  };

  const classes = getResponsiveClasses();

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-foreground">Lista de Compras</h2>
          <div className="flex gap-2">
            <Input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Nombre de la lista"
              className="w-40 text-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Guardar
                </Button>
              </DropdownMenuTrigger>
              <style>{`button.text-destructive:hover{background-color:rgba(239,68,68,0.08);color:#ef4444;transition:background-color 200ms ease;border-radius:6px;}`}</style>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {
                  // Llamar a la función de guardado que maneja las validaciones
                  saveShoppingList();
                }}>
                  Guardar Lista
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportList('text')}
                  disabled={shoppingItems.length === 0}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar como Texto
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportList('image')}
                  disabled={shoppingItems.length === 0}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Exportar como Imagen
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportList('pdf')}
                  disabled={shoppingItems.length === 0}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar como PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {shoppingItems.length > 0 ? (
          <>
            <div className={`border rounded-md mb-4 ${classes.maxHeight} overflow-y-auto`}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className={`${classes.cellPadding} text-xs font-medium text-muted-foreground uppercase tracking-wider`}>
                      Producto
                    </TableHead>
                    <TableHead className={`${classes.cellPadding} text-xs font-medium text-muted-foreground uppercase tracking-wider`}>
                      Cantidad
                    </TableHead>
                    <TableHead className={`${classes.cellPadding} text-xs font-medium text-muted-foreground uppercase tracking-wider`}>
                      Precio
                    </TableHead>
                    <TableHead className={`${classes.cellPadding} text-xs font-medium text-muted-foreground uppercase tracking-wider`}>
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shoppingItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className={`${classes.cellPadding}`}>
                        <div className={`font-medium text-foreground ${classes.tableText}`}>{item.name}</div>
                        {item.presentation && (
                          <div className={`text-muted-foreground mt-1 ${classes.tableText === 'text-xs' ? 'text-[0.65rem]' : classes.tableText === 'text-[0.6rem]' ? 'text-[0.5rem]' : 'text-xs'}`}>
                            {item.presentation}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className={`${classes.cellPadding}`}>
                        <div className="flex items-center gap-2">
                          {item.quantity === 1 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className={`${classes.buttonSize} text-destructive hover:text-destructive hover:bg-destructive/10`}
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className={classes.buttonSize}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                          )}
                          <span className={`w-8 text-center ${classes.tableText}`}>{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className={classes.buttonSize}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className={`${classes.cellPadding} text-foreground`}>
                        <span className={classes.tableText}>${item.price.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className={`${classes.cellPadding} text-foreground font-medium`}>
                        <span className={classes.tableText}>${(item.price * item.quantity).toFixed(2)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-md">
              <span className="font-semibold text-foreground">Total:</span>
              <span className="text-xl font-bold text-foreground">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-md border-muted-foreground/20">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-muted-foreground">
              Su lista de compras está vacía. Agregue productos desde la búsqueda.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShoppingList;