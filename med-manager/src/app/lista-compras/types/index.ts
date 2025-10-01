export interface Medicamento {
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

export interface ShoppingItem {
  id: string;
  name: string;
  presentation?: string;
  laboratory?: string;
  price: number;
  quantity: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  total: number;
  createdAt: string;
}