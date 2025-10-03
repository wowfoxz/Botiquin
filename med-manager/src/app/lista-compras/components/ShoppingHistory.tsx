'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { History, Copy, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ShoppingList as ShoppingListType } from '../types';

interface ShoppingHistoryProps {
  shoppingLists: ShoppingListType[];
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  exportList: (list: ShoppingListType, format: 'image' | 'pdf' | 'text') => void;
  onDeleteList?: (id: string) => void;
}

const ShoppingHistory: React.FC<ShoppingHistoryProps> = ({
  shoppingLists,
  showHistory,
  setShowHistory,
  exportList,
  onDeleteList
}) => {
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [screenClass, setScreenClass] = useState('screen-large');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<ShoppingListType | null>(null);
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
          maxHeight: 'max-h-[58vh]'
        };
      case 'screen-large':
        return {
          tableText: 'text-base',
          headerText: 'text-sm',
          cellPadding: 'px-3 py-3',
          badgeSize: 'text-sm',
          buttonSize: 'p-2 h-9 w-9',
          maxHeight: 'max-h-[54vh]'
        };
      case 'screen-medium':
        return {
          tableText: 'text-xs',
          headerText: 'text-xs',
          cellPadding: 'px-2 py-2',
          badgeSize: 'text-xs',
          buttonSize: 'p-1.5 h-8 w-8',
          maxHeight: 'max-h-[45vh]'
        };
      case 'screen-small':
        return {
          tableText: 'text-[0.6rem]',
          headerText: 'text-[0.6rem]',
          cellPadding: 'px-1.5 py-1.5',
          badgeSize: 'text-[0.6rem]',
          buttonSize: 'p-1 h-7 w-7',
          maxHeight: 'max-h-[40vh]'
        };
      default:
        return {
          tableText: 'text-sm',
          headerText: 'text-xs',
          cellPadding: 'px-2 py-2',
          badgeSize: 'text-xs',
          buttonSize: 'p-1.5 h-8 w-8',
          maxHeight: 'max-h-[45vh]'
        };
    }
  };

  const classes = getResponsiveClasses();

  const toggleExpandList = (listId: string) => {
    setExpandedListId(expandedListId === listId ? null : listId);
  };

  const handleDeleteClick = (list: ShoppingListType) => {
    setListToDelete(list);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (listToDelete && onDeleteList) {
      onDeleteList(listToDelete.id);
      toast.success('Lista eliminada correctamente');
      setDeleteConfirmOpen(false);
      setListToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <History className="mr-2 h-4 w-4" />
            Historial
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Historial de Listas de Compras</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {shoppingLists.length > 0 ? (
              <div className="space-y-4">
                {shoppingLists.map((list) => (
                  <Card key={list.id} className="shadow-md">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3
                            className="font-semibold text-foreground cursor-pointer hover:underline"
                            onClick={() => toggleExpandList(list.id)}
                          >
                            {list.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(list.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Opciones
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => exportList(list, 'text')}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar como Texto
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => exportList(list, 'image')}
                              >
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Exportar como Imagen
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => exportList(list, 'pdf')}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Exportar como PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(list)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar Lista
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ${list.total.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {list.items.length} items
                            </p>
                          </div>
                        </div>
                      </div>

                      {expandedListId === list.id && (
                        <div className={`mt-4 border rounded-md ${classes.maxHeight} overflow-y-auto`}>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted">
                                <TableHead className={`${classes.cellPadding} ${classes.headerText} font-medium text-muted-foreground uppercase tracking-wider`}>
                                  Producto
                                </TableHead>
                                <TableHead className={`${classes.cellPadding} ${classes.headerText} font-medium text-muted-foreground uppercase tracking-wider`}>
                                  Cantidad
                                </TableHead>
                                <TableHead className={`${classes.cellPadding} ${classes.headerText} font-medium text-muted-foreground uppercase tracking-wider`}>
                                  Precio
                                </TableHead>
                                <TableHead className={`${classes.cellPadding} ${classes.headerText} font-medium text-muted-foreground uppercase tracking-wider`}>
                                  Total
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {list.items.map((item) => (
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
                                    <span className={classes.tableText}>{item.quantity}</span>
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
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay listas de compras guardadas</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar la lista &quot;{listToDelete?.name}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShoppingHistory;