#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Preparando proyecto para producción...');

// Función para leer archivo .env
function readEnvFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return '';
  } catch (error) {
    console.error(`Error al leer ${filePath}:`, error.message);
    return '';
  }
}

// Función para escribir archivo .env
function writeEnvFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Archivo actualizado: ${filePath}`);
  } catch (error) {
    console.error(`Error al escribir ${filePath}:`, error.message);
  }
}

// Función para generar configuración de producción
function generateProductionConfig() {
  console.log('\n📝 Generando configuración de producción...');
  
  // Leer configuración actual
  const currentEnv = readEnvFile('.env');
  const currentEnvLocal = readEnvFile('.env.local');
  
  // Crear .env.production
  const productionEnv = currentEnv
    .split('\n')
    .filter(line => !line.startsWith('NODE_ENV'))
    .join('\n') + '\nNODE_ENV=production';
  
  writeEnvFile('.env.production', productionEnv);
  
  // Crear .env.local.production
  const productionEnvLocal = currentEnvLocal
    .split('\n')
    .filter(line => !line.startsWith('NODE_ENV'))
    .join('\n') + '\nNODE_ENV=production';
  
  writeEnvFile('.env.local.production', productionEnvLocal);
}

// Función para crear Dockerfile
function createDockerfile() {
  const dockerfileContent = `# Dockerfile para Botilyx
FROM node:18-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependencias basadas en el gestor de paquetes preferido
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Reconstruir el código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar basepath si está definido
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=\${NEXT_PUBLIC_BASE_PATH}

# Construir la aplicación
RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Configurar automáticamente el basepath
RUN if [ -n "$NEXT_PUBLIC_BASE_PATH" ]; then \\
    mkdir -p .next/static; \\
    cp -r .next/static/* .next/static/ 2>/dev/null || true; \\
    fi

# Copiar archivos de construcción
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
`;

  writeEnvFile('Dockerfile', dockerfileContent);
}

// Función para crear docker-compose
function createDockerCompose() {
  const dockerComposeContent = `version: '3.8'

services:
  botilyx:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_BASE_PATH: \${NEXT_PUBLIC_BASE_PATH:-}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - SESSION_SECRET=\${SESSION_SECRET}
      - GOOGLE_API_KEY=\${GOOGLE_API_KEY}
      - VAPID_PUBLIC_KEY=\${VAPID_PUBLIC_KEY}
      - VAPID_PRIVATE_KEY=\${VAPID_PRIVATE_KEY}
      - NOTIFICATION_PROCESSOR_SECRET=\${NOTIFICATION_PROCESSOR_SECRET}
      - NEXT_PUBLIC_BASE_PATH=\${NEXT_PUBLIC_BASE_PATH:-}
      - NEXT_PUBLIC_VAPID_PUBLIC_KEY=\${NEXT_PUBLIC_VAPID_PUBLIC_KEY}
    volumes:
      - ./prisma/dev.db:/app/prisma/dev.db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
`;

  writeEnvFile('docker-compose.yml', dockerComposeContent);
}

// Función para crear script de despliegue
function createDeployScript() {
  const deployScript = `#!/bin/bash

# Script de despliegue para Botilyx
set -e

echo "🚀 Iniciando despliegue de Botilyx..."

# Verificar variables de entorno requeridas
required_vars=(
  "DATABASE_URL"
  "SESSION_SECRET"
  "VAPID_PUBLIC_KEY"
  "VAPID_PRIVATE_KEY"
  "NOTIFICATION_PROCESSOR_SECRET"
)

for var in "\${required_vars[@]}"; do
  if [ -z "\${!var}" ]; then
    echo "❌ Error: La variable de entorno \$var no está definida"
    exit 1
  fi
done

# Construir imagen Docker
echo "📦 Construyendo imagen Docker..."
docker build -t botilyx:latest .

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down || true

# Iniciar nuevos contenedores
echo "▶️ Iniciando nuevos contenedores..."
docker-compose up -d

# Verificar salud del servicio
echo "🔍 Verificando salud del servicio..."
sleep 10

if curl -f http://localhost:3000/api/health; then
  echo "✅ Despliegue completado exitosamente!"
  echo "🌐 Aplicación disponible en: http://localhost:3000"
else
  echo "❌ Error: El servicio no está respondiendo"
  docker-compose logs
  exit 1
fi
`;

  writeEnvFile('deploy.sh', deployScript);
  
  // Hacer el script ejecutable
  try {
    fs.chmodSync('deploy.sh', '755');
  } catch (error) {
    console.log('⚠️ No se pudo hacer ejecutable el script deploy.sh (esto es normal en Windows)');
  }
}

// Función para crear endpoint de salud
function createHealthEndpoint() {
  const healthEndpoint = `import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Verificar conexión a base de datos
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$queryRaw\`SELECT 1\`;
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Botilyx',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      { status: 500 }
    );
  }
}
`;

  writeEnvFile('src/app/api/health/route.ts', healthEndpoint);
}

// Función para actualizar package.json
function updatePackageJson() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Agregar scripts de producción
    packageJson.scripts = {
      ...packageJson.scripts,
      'build:prod': 'NODE_ENV=production npm run build',
      'start:prod': 'NODE_ENV=production npm start',
      'deploy': 'chmod +x deploy.sh && ./deploy.sh',
      'docker:build': 'docker build -t botilyx:latest .',
      'docker:run': 'docker run -p 3000:3000 --env-file .env.production botilyx:latest'
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json actualizado con scripts de producción');
  } catch (error) {
    console.error('Error al actualizar package.json:', error.message);
  }
}

// Ejecutar todas las funciones
async function main() {
  try {
    generateProductionConfig();
    createDockerfile();
    createDockerCompose();
    createDeployScript();
    createHealthEndpoint();
    updatePackageJson();
    
    console.log('\n🎉 ¡Proyecto preparado para producción!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Configura las variables de entorno en tu servidor');
    console.log('2. Ejecuta: npm run deploy');
    console.log('3. O usa Docker: docker-compose up -d');
    console.log('\n📁 Archivos creados:');
    console.log('- .env.production');
    console.log('- .env.local.production');
    console.log('- Dockerfile');
    console.log('- docker-compose.yml');
    console.log('- deploy.sh');
    console.log('- src/app/api/health/route.ts');
    
  } catch (error) {
    console.error('❌ Error durante la preparación:', error.message);
    process.exit(1);
  }
}

main();
