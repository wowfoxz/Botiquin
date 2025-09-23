"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar problemas de hidratación
  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center border rounded-md bg-background">
        <Sun className="h-4 w-4 opacity-0" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Cambiar modo claro/oscuro"
      className="w-9 h-9 flex items-center justify-center border rounded-md bg-background hover:bg-accent transition-colors shadow-sm"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}