#!/bin/bash

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

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: La variable de entorno $var no está definida"
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
