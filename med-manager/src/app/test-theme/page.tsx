'use client';

import ThemeTest from '@/components/theme-test';
import { useState, useEffect } from 'react';

export default function TestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold mb-4">Página de prueba de tema</h1>
      <p className="mb-4">Esta es una página de prueba para verificar el botón de cambio de tema.</p>
      <ThemeTest />
    </div>
  );
}