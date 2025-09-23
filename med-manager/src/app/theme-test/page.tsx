'use client';

import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '@/components/providers/theme-toggle';
import { useState, useEffect } from 'react';

export default function ThemeTestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Cargando...</div>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Prueba de Tema</h1>
          <ThemeToggle />
        </div>
        <div className="space-y-4">
          <p>Esta es una página de prueba para verificar el botón de cambio de tema.</p>
          <p>El botón debería aparecer en la esquina superior derecha.</p>
        </div>
      </div>
    </ThemeProvider>
  );
}