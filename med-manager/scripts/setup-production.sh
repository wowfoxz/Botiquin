#!/bin/bash

# Script para configurar el entorno de producción de Botilyx
# Uso: ./scripts/setup-production.sh [domain]

set -e

DOMAIN=${1:-"botilyx.example.com"}
NAMESPACE="botilyx"

echo "🚀 Configurando entorno de producción para Botilyx"
echo "🌐 Dominio: $DOMAIN"

# Verificar que kubectl está disponible
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl no está instalado o no está en el PATH"
    exit 1
fi

# Verificar conexión al cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ No se puede conectar al cluster de Kubernetes"
    exit 1
fi

echo "✅ Conexión al cluster verificada"

# Crear namespace
echo "📦 Creando namespace..."
kubectl apply -f k8s/namespace.yaml

# Instalar cert-manager si no está instalado
echo "🔐 Verificando cert-manager..."
if ! kubectl get crd clusterissuers.cert-manager.io &> /dev/null; then
    echo "📦 Instalando cert-manager..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
    echo "⏳ Esperando a que cert-manager esté listo..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager --timeout=300s
else
    echo "✅ cert-manager ya está instalado"
fi

# Aplicar configuración de cert-manager
echo "🔐 Configurando Let's Encrypt..."
sed "s/admin@example.com/admin@$DOMAIN/g" k8s/cert-manager.yaml | kubectl apply -f -

# Actualizar configuración con el dominio correcto
echo "⚙️ Configurando ingress con dominio $DOMAIN..."
sed "s/botilyx.example.com/$DOMAIN/g" k8s/ingress.yaml | kubectl apply -f -

# Crear secrets de ejemplo (deben ser configurados manualmente)
echo "🔐 Creando secrets de ejemplo..."
echo "⚠️ IMPORTANTE: Debes configurar los secrets reales antes del despliegue"
kubectl create secret generic botilyx-secrets \
  --from-literal=DATABASE_URL="postgresql://username:password@postgres-service:5432/botilyx_prod" \
  --from-literal=SESSION_SECRET="$(openssl rand -base64 32)" \
  --from-literal=GEMINI_API_KEY="your-gemini-api-key" \
  --from-literal=VAPID_PUBLIC_KEY="your-vapid-public-key" \
  --from-literal=VAPID_PRIVATE_KEY="your-vapid-private-key" \
  --from-literal=NOTIFICATION_PROCESSOR_SECRET="$(openssl rand -base64 32)" \
  --namespace=$NAMESPACE \
  --dry-run=client -o yaml > k8s/secret-template.yaml

echo "📋 Template de secrets creado en k8s/secret-template.yaml"
echo "📝 Edita este archivo con tus valores reales y aplícalo con:"
echo "   kubectl apply -f k8s/secret-template.yaml"

# Aplicar configuración
echo "⚙️ Aplicando configuración..."
kubectl apply -f k8s/configmap.yaml

echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita k8s/secret-template.yaml con tus valores reales"
echo "2. Aplica los secrets: kubectl apply -f k8s/secret-template.yaml"
echo "3. Despliega la aplicación: ./scripts/deploy.sh"
echo ""
echo "🔍 Para verificar el estado:"
echo "   kubectl get pods -n $NAMESPACE"
echo "   kubectl get ingress -n $NAMESPACE"
