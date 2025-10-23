'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css';
import { apiFetch } from "@/lib/api";
import SearchMedications from './components/SearchMedications';
import MedicamentosTable from './components/MedicamentosTable';
import ShoppingList from './components/ShoppingList';
import ShoppingHistory from './components/ShoppingHistory';
import { Medicamento, ShoppingItem, ShoppingList as ShoppingListType } from './types';
import { exportAsImage } from '@/lib/export/exportImage';
import { exportAsPDF } from '@/lib/export/exportPDF';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

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

  // Estados para autenticación y carga inicial
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  // Obtener el usuario autenticado
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Controlar el estado de carga inicial
  useEffect(() => {
    if (!authLoading) {
      // Pequeño delay para evitar parpadeos
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  // Cargar historial de listas desde la API
  useEffect(() => {
    if (isAuthenticated && user) {
      loadShoppingLists();
    }
  }, [isAuthenticated, user]);

  const loadShoppingLists = async () => {
    try {
      const response = await apiFetch('/api/lista-compras', {
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
      const response = await apiFetch('/api/medicamentos', {
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

    // Verificar si el producto ya existe en la lista
    const existingItemIndex = shoppingItems.findIndex(item =>
      item.name === medicamento.NOMBRE &&
      item.presentation === medicamento.PRESENTACION &&
      item.laboratory === medicamento.LABORATORIO
    );

    if (existingItemIndex !== -1) {
      // Si el producto ya existe, incrementar la cantidad
      const updatedItems = [...shoppingItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
      setShoppingItems(updatedItems);
      toast.success('Cantidad actualizada en la lista de compras');
    } else {
      // Si es un nuevo producto, agregarlo a la lista
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
    }
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
      const response = await apiFetch('/api/lista-compras', {
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
          ).join('\n')}\n\nTotal: $${totalAmount.toFixed(2)}\n\nPrecios de referencia: promedio de valores declarados por laboratorios al Vademécum Nacional de Medicamentos (VNM), organismo dependiente de la Administración Nacional de Medicamentos, Alimentos y Tecnología Médica (ANMAT).\nLa farmacia puede cobrar igual, más o menos.\nSolo estimación; no es cotización ni obligación de venta.`;

          await navigator.clipboard.writeText(textContent);
          toast.success('Contenido copiado al portapapeles');
          break;

        case 'image':
          await exportAsImage(
            listName || 'Sin nombre',
            shoppingItems,
            totalAmount,
            `lista-compras-${listName || 'sin-nombre'}.png`
          );
          toast.success('Imagen descargada exitosamente');
          break;

        case 'pdf':
          await exportAsPDF(
            listName || 'Sin nombre',
            shoppingItems,
            totalAmount,
            `lista-compras-${listName || 'sin-nombre'}.pdf`
          );
          toast.success('PDF descargado exitosamente');
          break;
      }
    } catch (err) {
      console.error('Error al exportar lista:', err);
      toast.error('Error al exportar la lista');
    }
  };

  // Exportar una lista del historial
  const exportHistoryList = async (list: ShoppingListType, format: 'image' | 'pdf' | 'text') => {
    try {
      switch (format) {
        case 'text':
          // Copiar al portapapeles
          const textContent = `Lista de Compras: ${list.name}\n\n${list.items.map(item =>
            `${item.quantity} x ${item.name}${item.presentation ? ` (${item.presentation})` : ''} - $${(item.price * item.quantity).toFixed(2)}`
          ).join('\n')}\n\nTotal: $${list.total.toFixed(2)}\n\nPrecios de referencia: promedio de valores declarados por laboratorios al Vademécum Nacional de Medicamentos (VNM), organismo dependiente de la Administración Nacional de Medicamentos, Alimentos y Tecnología Médica (ANMAT).\nLa farmacia puede cobrar igual, más o menos.\nSolo estimación; no es cotización ni obligación de venta.`;

          await navigator.clipboard.writeText(textContent);
          toast.success('Contenido copiado al portapapeles');
          break;

        case 'image':
          await exportAsImage(
            list.name,
            list.items,
            list.total,
            `lista-compras-${list.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
          );
          toast.success('Imagen descargada exitosamente');
          break;

        case 'pdf':
          await exportAsPDF(
            list.name,
            list.items,
            list.total,
            `lista-compras-${list.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`
          );
          toast.success('PDF descargado exitosamente');
          break;
      }
    } catch (err) {
      console.error('Error al exportar lista:', err);
      toast.error('Error al exportar la lista');
    }
  };

  const deleteShoppingList = async (id: string) => {
    try {
      const response = await apiFetch(`/api/lista-compras/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Lista de compras eliminada exitosamente');
        loadShoppingLists(); // Recargar historial
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al eliminar la lista de compras');
      }
    } catch (err) {
      console.error('Error al eliminar lista de compras:', err);
      toast.error('Error al eliminar la lista de compras');
    }
  };

  // Ordenar medicamentos
  const sortedMedicamentos = useMemo(() => {
    if (!sortField) return medicamentos;

    return [...medicamentos].sort((a: Medicamento, b: Medicamento) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case 'precio': {
          const normalizePrecioRaw = (p: string | number | null | undefined) => {
            if (p == null) return '0';
            const s = typeof p === 'string' ? p : String(p);
            // Remove any currency symbols and letters, keep digits, dots, commas and minus sign
            return s.replace(/[^0-9.,-]+/g, '').trim();
          };

          const precioAraw = normalizePrecioRaw(a.PRECIO);
          const precioBraw = normalizePrecioRaw(b.PRECIO);

          const normalizeDecimal = (s: string) => {
            // If both dot and comma exist, assume comma is thousands separator: remove commas
            if (s.includes('.') && s.includes(',')) {
              return s.replace(/,/g, '');
            }
            // If only comma exists, treat comma as decimal separator
            if (s.includes(',') && !s.includes('.')) {
              return s.replace(/,/g, '.');
            }
            return s;
          };

          const precioA = normalizeDecimal(precioAraw);
          const precioB = normalizeDecimal(precioBraw);

          aValue = parseFloat(precioA) || 0;
          bValue = parseFloat(precioB) || 0;
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

  // Mostrar loader mientras se verifica la autenticación o durante la carga inicial
  if (authLoading || initialLoading) {
    return (
      <div style={{ display: 'grid', placeContent: 'center', height: '100vh' }}>
        <Cardio
          size={70}
          stroke={5}
          speed={1}
          color="var(--color-info)"
        />
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Lista de Compras</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-foreground"></h1>
        <div className="flex gap-2">
          <ShoppingHistory
            shoppingLists={shoppingLists}
            showHistory={showHistory}
            setShowHistory={setShowHistory}
            exportList={exportHistoryList}
            onDeleteList={deleteShoppingList}
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