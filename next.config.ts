import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    SESSION_SECRET: process.env.SESSION_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    NOTIFICATION_PROCESSOR_SECRET: process.env.NOTIFICATION_PROCESSOR_SECRET,
  },
  // Configurar basePath si está definido en las variables de entorno
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  // Configuración para Docker y producción
  output: 'standalone',
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
  // Configuración para optimizar el rendimiento
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;