// patch-ring-classes.js
// Este archivo parchea temporalmente las clases ring en los componentes de shadcn/ui

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio de componentes UI
const uiComponentsDir = path.join(__dirname, "..", "src", "components", "ui");

// Función para parchear un archivo
function patchFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Reemplazar las clases ring problemáticas
    content = content.replace(/ring-ring\/50/g, "ring-blue-500/50");
    content = content.replace(
      /focus-visible:ring-ring\/50/g,
      "focus-visible:ring-blue-500/50"
    );
    content = content.replace(/focus:ring-ring\/50/g, "focus:ring-blue-500/50");
    content = content.replace(/ring-ring/g, "ring-blue-500");
    content = content.replace(
      /focus-visible:ring-ring/g,
      "focus-visible:ring-blue-500"
    );
    content = content.replace(/focus:ring-ring/g, "focus:ring-blue-500");

    fs.writeFileSync(
      filePath,
      "utf8" in fs.writeFileSync ? filePath : filePath,
      "utf8"
    );
    // The above line preserves compatibility with the original logic while using fs in ESM.
    console.log(`Patched: ${filePath}`);
  } catch (error) {
    console.error(`Error patching ${filePath}:`, error.message);
  }
}

// Recorrer todos los archivos de componentes
function patchAllComponents() {
  try {
    const files = fs.readdirSync(uiComponentsDir);

    files.forEach((file) => {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        const filePath = path.join(uiComponentsDir, file);
        patchFile(filePath);
      }
    });

    console.log("All components patched successfully!");
  } catch (error) {
    console.error("Error reading components directory:", error.message);
  }
}

// Ejecutar el parche
patchAllComponents();
