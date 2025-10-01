'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import SearchMedications from './components/SearchMedications';
import MedicamentosTable from './components/MedicamentosTable';
import ShoppingList from './components/ShoppingList';
import ShoppingHistory from './components/ShoppingHistory';
import { Medicamento, ShoppingItem, ShoppingList as ShoppingListType } from './types';

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
  const [shoppingLists, setShoppingLists] = useState<ShoppingListType[]>([]);
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
      return '↕️';
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
          <ShoppingHistory 
            shoppingLists={shoppingLists}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de búsqueda de medicamentos */}
        <div className="space-y-6">
          <SearchMedications
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
            error={error}
            medicamentos={medicamentos}
            handleSearch={handleSearch}
          />
          
          <MedicamentosTable
            loading={loading}
            error={error}
            medicamentos={medicamentos}
            sortedMedicamentos={sortedMedicamentos}
            handleSort={handleSort}
            getSortIcon={getSortIcon}
            addToShoppingList={addToShoppingList}
            searchTerm={searchTerm}
          />
        </div>

        {/* Panel de lista de compras */}
        <div className="space-y-6">
          <ShoppingList
            listName={listName}
            setListName={setListName}
            shoppingItems={shoppingItems}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            totalAmount={totalAmount}
            saveShoppingList={saveShoppingList}
            exportList={exportList}
          />
        </div>
      </div>
    </div>
  );
};

export default ListaComprasPage;