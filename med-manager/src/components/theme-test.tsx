'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export default function ThemeTest() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeToggleButton />
    </ThemeProvider>
  );
}

function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      >
        {isDark ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}