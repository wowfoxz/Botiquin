#!/bin/bash

# Script de despliegue para Botilyx en Kubernetes
# Uso: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
NAMESPACE="botilyx"

echo "🚀 Iniciando despliegue de Botilyx en modo: $ENVIRONMENT"

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

# Crear namespace si no existe
echo "📦 Creando namespace..."
kubectl apply -f k8s/namespace.yaml

# Aplicar configuración
echo "⚙️ Aplicando configuración..."
kubectl apply -f k8s/configmap.yaml

# Aplicar secrets (nota: estos deben estar configurados manualmente)
echo "🔐 Aplicando secrets..."
kubectl apply -f k8s/secret.yaml

# Aplicar deployment
echo "🚀 Aplicando deployment..."
kubectl apply -f k8s/deployment.yaml

# Aplicar service
echo "🌐 Aplicando service..."
kubectl apply -f k8s/service.yaml

# Aplicar ingress
echo "🔗 Aplicando ingress..."
kubectl apply -f k8s/ingress.yaml

# Esperar a que los pods estén listos
echo "⏳ Esperando a que los pods estén listos..."
kubectl wait --for=condition=ready pod -l app=botilyx -n $NAMESPACE --timeout=300s

# Mostrar estado del despliegue
echo "📊 Estado del despliegue:"
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get ingress -n $NAMESPACE

echo "✅ Despliegue completado exitosamente!"
echo ""
echo "🔍 Para verificar el estado:"
echo "  kubectl get pods -n $NAMESPACE"
echo "  kubectl logs -l app=botilyx -n $NAMESPACE"
echo ""
echo "🌐 Para acceder a la aplicación:"
echo "  kubectl port-forward service/botilyx-service 3000:80 -n $NAMESPACE"
echo "  Luego abre http://localhost:3000 en tu navegador"
