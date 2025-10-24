import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import { config } from '@/lib/config';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
    height: 50,
  },
  logo: {
    width: 100,
    height: 50,
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  itemsContainer: {
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '1 solid #e5e7eb',
  },
  itemText: {
    fontSize: 12,
    color: '#374151',
  },
  itemPrice: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 'bold',
  },
  totalContainer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '2 solid #1f2937',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#1f2937',
  },
  disclaimer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.5,
  },
});

interface ShoppingItem {
  id: string;
  name: string;
  presentation?: string;
  quantity: number;
  price: number;
}

interface ListaPDFProps {
  name: string;
  items: ShoppingItem[];
  total: number;
}

export const ListaPDF: React.FC<ListaPDFProps> = ({ name, items, total }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.logoContainer}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          src={`${config.BASE_PATH}/Botilyx_negro.png`}
          style={styles.logo}
        />
      </View>

      <Text style={styles.header}>Lista de Compras: {name || 'Sin nombre'}</Text>

      <View style={styles.itemsContainer}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemText}>
              {item.quantity} x {item.name}
              {item.presentation ? ` (${item.presentation})` : ''}
            </Text>
            <Text style={styles.itemPrice}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Precios de referencia: promedio de valores declarados por laboratorios al Vademécum Nacional de Medicamentos (VNM),
          organismo dependiente de la Administración Nacional de Medicamentos, Alimentos y Tecnología Médica (ANMAT).{'\n\n'}
          La farmacia puede cobrar igual, más o menos.{'\n'}
          Solo estimación; no es cotización ni obligación de venta.
        </Text>
      </View>
    </Page>
  </Document>
);

export async function exportAsPDF(
  name: string,
  items: ShoppingItem[],
  total: number,
  fileName: string
): Promise<void> {
  try {
    const blob = await pdf(<ListaPDF name={name} items={items} total={total} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    throw error;
  }
}
