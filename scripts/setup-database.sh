#!/bin/bash

# Script para configurar la base de datos en Kubernetes
echo "🔧 Configurando base de datos para Botilyx..."

# Variables de entorno para la base de datos
export DATABASE_URL="mysql://root:mysql.botilyx2024@10.10.102.2:30002/botilyx_db"

echo "📊 Generando cliente de Prisma..."
npx prisma generate

echo "🗄️ Sincronizando esquema con la base de datos..."
npx prisma db push --accept-data-loss

echo "✅ Configuración de base de datos completada!"
echo "🔗 Base de datos: botilyx_db en 10.10.102.2:30002"
