import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  const basePath = config.BASE_PATH;
  
  const manifest = {
    name: "Botilyx - Gestor de Medicamentos",
    short_name: "Botilyx",
    description: "Sistema de gestión de medicamentos y tratamientos médicos",
    start_url: `${basePath}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    scope: `${basePath}/`,
    display_override: ["window-controls-overlay"],
    lang: "es",
    categories: ["health", "medical", "productivity"],
    icons: [
      {
        src: `${basePath}/icons/favicon.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: `${basePath}/icons/favicon.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    shortcuts: [
      {
        name: "Ver Tratamientos",
        short_name: "Tratamientos",
        description: "Ver tratamientos activos",
        url: `${basePath}/tratamientos`,
        icons: [{ src: `${basePath}/icons/favicon.png`, sizes: "96x96" }]
      },
      {
        name: "Mi Botiquín",
        short_name: "Botiquín",
        description: "Ver medicamentos en botiquín",
        url: `${basePath}/botiquin`,
        icons: [{ src: `${basePath}/icons/favicon.png`, sizes: "96x96" }]
      }
    ],
    prefer_related_applications: false
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}

