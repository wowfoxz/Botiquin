import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Función auxiliar para manejar las clases ring
export function getRingClasses() {
  return {
    ring: "ring-ring",
    ring50: "ring-ring/50",
    ringFocus: "focus:ring-ring focus:ring-ring/50",
    ringFocusVisible: "focus-visible:ring-ring focus-visible:ring-ring/50",
  };
}