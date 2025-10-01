'use client';

import React from 'react';
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
import { Save, Copy, FileText, Image as ImageIcon } from 'lucide-react';
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
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
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
              <DropdownMenuContent>
                <DropdownMenuItem onClick={saveShoppingList}>
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
            <div className="border rounded-md mb-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Producto
                    </TableHead>
                    <TableHead className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Cantidad
                    </TableHead>
                    <TableHead className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Precio
                    </TableHead>
                    <TableHead className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </TableHead>
                    <TableHead className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acción
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shoppingItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="px-4 py-2">
                        <div className="font-medium text-foreground">{item.name}</div>
                        {item.presentation && (
                          <div className="text-xs text-muted-foreground">{item.presentation}</div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-foreground">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-foreground font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Eliminar
                        </Button>
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