"use client";

import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4 text-color-primario" />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Cambiar modo claro/oscuro"
      />
      <Moon className="h-4 w-4 text-color-primario" />
    </div>
  );
}