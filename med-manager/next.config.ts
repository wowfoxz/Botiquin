import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    SESSION_SECRET:
      process.env.SESSION_SECRET
  },
  // Configurar basePath si está definido en las variables de entorno
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  // Configuración para mejorar la seguridad en producción
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
