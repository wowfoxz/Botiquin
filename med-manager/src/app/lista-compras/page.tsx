'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  ArrowUpDown, 
  Plus, 
  Save, 
  History, 
  Copy, 
  FileText, 
  Image as ImageIcon
} from 'lucide-react';
import Loader from '@/components/Loader_lupa';

// Interfaces
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

interface ShoppingItem {
  id: string;
  name: string;
  presentation?: string;
  laboratory?: string;
  price: number;
  quantity: number;
}

interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  total: number;
  createdAt: string;
}

const ListaComprasPage = () => {
  // Estados para la búsqueda de medicamentos
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para la lista de compras actual
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [listName, setListName] = useState<string>('');
  
  // Estados para el historial de listas
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  // Estados para ordenamiento
  const [sortField, setSortField] = useState<'precio' | 'presentacion' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Cargar historial de listas desde la API
  useEffect(() => {
    loadShoppingLists();
  }, []);

  const loadShoppingLists = async () => {
    try {
      const response = await fetch('/api/lista-compras', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setShoppingLists(data);
      }
    } catch (err) {
      console.error('Error al cargar historial de listas:', err);
    }
  };

  // Calcular total de la lista de compras actual
  const totalAmount = useMemo(() => {
    return shoppingItems.reduce((sum: number, item: ShoppingItem) => sum + (item.price * item.quantity), 0);
  }, [shoppingItems]);

  // Buscar medicamentos
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/medicamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchdata: searchTerm }),
      });

      const data = await response.json();
      const medicamentosArray = Array.isArray(data) ? data : data?.medicamentos || [];
      setMedicamentos(medicamentosArray);
    } catch (err) {
      setError('Error al buscar medicamentos. Por favor, intente nuevamente.');
      console.error(err);
      setMedicamentos([]);
    } finally {
      setLoading(false);
    }
  };

  // Agregar medicamento a la lista de compras
  const addToShoppingList = (medicamento: Medicamento) => {
    // Convertir precio a número
    const priceString = medicamento.PRECIO.toString().replace('$', '').replace(/[, ]+/g, '');
    const price = parseFloat(priceString) || 0;
    
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: medicamento.NOMBRE,
      presentation: medicamento.PRESENTACION,
      laboratory: medicamento.LABORATORIO,
      price: price,
      quantity: 1
    };
    
    setShoppingItems(prev => [...prev, newItem]);
    toast.success('Producto agregado a la lista de compras');
  };

  // Actualizar cantidad de un item
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setShoppingItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Eliminar item de la lista
  const removeItem = (id: string) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  // Guardar lista de compras
  const saveShoppingList = async () => {
    if (shoppingItems.length === 0) {
      toast.error('La lista de compras está vacía');
      return;
    }
    
    if (!listName.trim()) {
      toast.error('Por favor, ingrese un nombre para la lista');
      return;
    }
    
    try {
      const response = await fetch('/api/lista-compras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: listName,
          items: shoppingItems,
          total: totalAmount
        }),
      });
      
      if (response.ok) {
        toast.success('Lista de compras guardada exitosamente');
        setShoppingItems([]);
        setListName('');
        loadShoppingLists(); // Recargar historial
      } else {
        toast.error('Error al guardar la lista de compras');
      }
    } catch (err) {
      console.error('Error al guardar lista de compras:', err);
      toast.error('Error al guardar la lista de compras');
    }
  };

  // Exportar lista de compras
  const exportList = async (format: 'image' | 'pdf' | 'text') => {
    try {
      switch (format) {
        case 'text':
          // Copiar al portapapeles
          const textContent = `Lista de Compras: ${listName || 'Sin nombre'}\n\n${shoppingItems.map(item => 
            `${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
          ).join('\n')}\n\nTotal: $${totalAmount.toFixed(2)}`;
          
          await navigator.clipboard.writeText(textContent);
          toast.success('Contenido copiado al portapapeles');
          break;
          
        case 'image':
        case 'pdf':
          toast.info(`Exportación a ${format === 'image' ? 'imagen' : 'PDF'} no implementada aún`);
          break;
      }
    } catch (err) {
      console.error('Error al exportar lista:', err);
      toast.error('Error al exportar la lista');
    }
  };

  // Ordenar medicamentos
  const sortedMedicamentos = useMemo(() => {
    if (!sortField) return medicamentos;

    return [...medicamentos].sort((a: Medicamento, b: Medicamento) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case 'precio': {
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

  const getSortIcon = (field: 'precio' | 'presentacion' | null) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 inline" />;
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleSort = (field: 'precio' | 'presentacion' | null) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Lista de Compras</h1>
        <div className="flex gap-2">
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setShowHistory(true)}>
                <History className="mr-2 h-4 w-4" />
                Historial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
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
                              <h3 className="font-semibold text-foreground">{list.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(list.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                ${list.total.toFixed(2)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {list.items.length} items
                              </p>
                            </div>
                          </div>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de búsqueda de medicamentos */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Buscar Medicamentos</h2>
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
                  className="w-full sm:w-auto px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
                  disabled={loading || !searchTerm.trim()}
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resultados de búsqueda */}
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
        </div>

        {/* Panel de lista de compras */}
        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  );
};

export default ListaComprasPage;