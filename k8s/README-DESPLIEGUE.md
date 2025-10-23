# 🚀 Guía de Despliegue de Botilyx en Kubernetes

## 📋 Requisitos Previos

- ✅ MySQL desplegado en Kubernetes (puerto 30002)
- ✅ Base de datos `botilyx_db` creada y sincronizada
- ✅ Imagen Docker creada y subida a DockerHub
- ✅ MicroK8s configurado y funcionando

---

## 🔧 PASO 1: Crear la Imagen Docker

### Opción A: Usando el script `Crear_Proyecto.sh`

1. **Navegar a la carpeta del proyecto:**
   ```bash
   cd ~/Servidor/proyectos/botilyx/Botiquin
   ```

2. **Ejecutar el script:**
   ```bash
   bash ~/KUBERNETES/Crear_Proyecto.sh
   ```

3. **Responder las preguntas:**
   - Tipo de proyecto: `2) Actualización`
   - Seleccionar carpeta: `botilyx/`
   - Seleccionar subcarpeta: `Botiquin/`
   - Rama: `main`
   - Nombre de imagen: `dev-web-botilyx`
   - Versión: `0.1.0` (incrementar según corresponda)
   - **IMPORTANTE:** Cuando pregunte por `Base path`, ingresar: `/botilyx`

### Opción B: Manualmente

```bash
# Navegar al proyecto
cd ~/Servidor/proyectos/botilyx/Botiquin

# Construir la imagen con build-args
docker build \
  --build-arg NEXT_PUBLIC_BASE_PATH="/botilyx" \
  --build-arg NEXT_PUBLIC_API_URL="http://dev.formosa.gob.ar/botilyx" \
  --build-arg NEXT_PUBLIC_AUTH_USER="admin" \
  --build-arg NEXT_PUBLIC_AUTH_PASS="admin123" \
  --build-arg NEXT_PUBLIC_APP_VERSION="0.1.0" \
  -t upsti/dev-web-botilyx:v0.1.0 .

# Subir a DockerHub
docker push upsti/dev-web-botilyx:v0.1.0

# Limpiar imagen local
docker rmi upsti/dev-web-botilyx:v0.1.0
```

---

## 🎯 PASO 2: Desplegar en Kubernetes

### 2.1 Crear directorio en el servidor

```bash
# En el servidor de Kubernetes
sudo mkdir -p /mnt/dev-web-botilyx/medications
sudo mkdir -p /mnt/dev-web-botilyx/treatment-images
sudo chown -R 1001:1001 /mnt/dev-web-botilyx
sudo chmod -R 755 /mnt/dev-web-botilyx
```

### 2.2 Aplicar los archivos YAML

**IMPORTANTE:** Los archivos deben aplicarse en orden:

```bash
# Navegar a la carpeta k8s
cd ~/Servidor/proyectos/botilyx/Botiquin/k8s

# 1. Namespace (si no existe)
microk8s kubectl apply -f 00-namespace.yaml

# 2. PersistentVolume
microk8s kubectl apply -f 01-pv-botilyx.yaml

# 3. PersistentVolumeClaim
microk8s kubectl apply -f 02-pvc-botilyx.yaml

# 4. Secret (variables de entorno)
microk8s kubectl apply -f 03-secret-botilyx.yaml

# 5. Deployment
microk8s kubectl apply -f 04-deployment-botilyx.yaml

# 6. Service
microk8s kubectl apply -f 05-service-botilyx.yaml

# 7. Ingress
microk8s kubectl apply -f 06-ingress-botilyx.yaml

# 8. HPA (Horizontal Pod Autoscaler)
microk8s kubectl apply -f 07-hpa-botilyx.yaml
```

### 2.3 Aplicar todos a la vez (alternativa)

```bash
microk8s kubectl apply -f ~/Servidor/proyectos/botilyx/Botiquin/k8s/
```

---

## ✅ PASO 3: Verificar el Despliegue

### 3.1 Verificar recursos creados

```bash
# Ver todos los recursos
microk8s kubectl get all -n aplicaciones | grep botilyx

# Ver PersistentVolume
microk8s kubectl get pv | grep botilyx

# Ver PersistentVolumeClaim
microk8s kubectl get pvc -n aplicaciones | grep botilyx

# Ver Secret
microk8s kubectl get secret -n aplicaciones | grep botilyx

# Ver Ingress
microk8s kubectl get ingress -n aplicaciones | grep botilyx

# Ver HPA
microk8s kubectl get hpa -n aplicaciones | grep botilyx
```

### 3.2 Verificar el estado del Pod

```bash
# Ver pods
microk8s kubectl get pods -n aplicaciones | grep botilyx

# Ver logs del pod
microk8s kubectl logs -f -n aplicaciones deployment/dev-web-botilyx

# Describir el pod (útil para debugging)
microk8s kubectl describe pod -n aplicaciones -l k8s-app=dev-web-botilyx
```

### 3.3 Verificar health check

```bash
# Desde dentro del cluster
microk8s kubectl exec -n aplicaciones -it deployment/dev-web-botilyx -- curl http://localhost:3000/api/health

# Desde fuera (una vez desplegado)
curl http://dev.formosa.gob.ar/web-botilyx/api/health
```

---

## 🌐 PASO 4: Acceder a la Aplicación

Una vez desplegado, la aplicación estará disponible en:

**Desarrollo:**
- URL: `http://dev.formosa.gob.ar/web-botilyx/`
- Login: `http://dev.formosa.gob.ar/web-botilyx/login`
- Health: `http://dev.formosa.gob.ar/web-botilyx/api/health`

**Producción** (cuando se despliegue):
- URL: `http://web.formosa.gob.ar/botilyx/`
- Login: `http://web.formosa.gob.ar/botilyx/login`

---

## 🔄 PASO 5: Actualizar la Aplicación

### 5.1 Crear nueva versión

```bash
# 1. Crear nueva imagen (incrementar versión)
bash ~/KUBERNETES/Crear_Proyecto.sh
# Versión: 0.1.1 (ejemplo)

# 2. Actualizar el deployment
microk8s kubectl set image deployment/dev-web-botilyx \
  dev-web-botilyx=upsti/dev-web-botilyx:v0.1.1 \
  -n aplicaciones

# 3. Verificar el rollout
microk8s kubectl rollout status deployment/dev-web-botilyx -n aplicaciones
```

### 5.2 Rollback (si algo sale mal)

```bash
# Ver historial de despliegues
microk8s kubectl rollout history deployment/dev-web-botilyx -n aplicaciones

# Hacer rollback a la versión anterior
microk8s kubectl rollout undo deployment/dev-web-botilyx -n aplicaciones

# Rollback a una versión específica
microk8s kubectl rollout undo deployment/dev-web-botilyx -n aplicaciones --to-revision=2
```

---

## 🗑️ PASO 6: Eliminar el Despliegue (si es necesario)

```bash
# Eliminar todos los recursos
microk8s kubectl delete -f ~/Servidor/proyectos/botilyx/Botiquin/k8s/

# O eliminar uno por uno
microk8s kubectl delete deployment dev-web-botilyx -n aplicaciones
microk8s kubectl delete service dev-web-botilyx -n aplicaciones
microk8s kubectl delete ingress dev-web-botilyx -n aplicaciones
microk8s kubectl delete pvc pvc-dev-web-botilyx -n aplicaciones
microk8s kubectl delete pv pv-dev-web-botilyx
microk8s kubectl delete secret secret-dev-web-botilyx -n aplicaciones
microk8s kubectl delete hpa dev-web-botilyx-hpa -n aplicaciones
```

---

## 🐛 Troubleshooting

### Problema: Pod no inicia

```bash
# Ver eventos del pod
microk8s kubectl describe pod -n aplicaciones -l k8s-app=dev-web-botilyx

# Ver logs
microk8s kubectl logs -n aplicaciones -l k8s-app=dev-web-botilyx --previous
```

### Problema: No se puede acceder a la aplicación

```bash
# Verificar el servicio
microk8s kubectl get svc -n aplicaciones dev-web-botilyx

# Verificar el ingress
microk8s kubectl describe ingress -n aplicaciones dev-web-botilyx

# Verificar que nginx-ingress esté funcionando
microk8s kubectl get pods -n ingress
```

### Problema: Imágenes no se guardan

```bash
# Verificar que el PVC esté bound
microk8s kubectl get pvc -n aplicaciones pvc-dev-web-botilyx

# Verificar permisos del directorio
ls -la /mnt/dev-web-botilyx/

# Entrar al pod y verificar
microk8s kubectl exec -it -n aplicaciones deployment/dev-web-botilyx -- sh
ls -la /app/public/medications/
ls -la /app/public/treatment-images/
```

### Problema: Variables de entorno no cargan

```bash
# Verificar el secret
microk8s kubectl get secret secret-dev-web-botilyx -n aplicaciones -o yaml

# Ver variables en el pod
microk8s kubectl exec -n aplicaciones deployment/dev-web-botilyx -- env | grep -E '(DATABASE|GOOGLE|VAPID)'
```

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
# CPU y memoria del pod
microk8s kubectl top pod -n aplicaciones -l k8s-app=dev-web-botilyx

# Estado del HPA
microk8s kubectl get hpa -n aplicaciones dev-web-botilyx-hpa
```

### Ver métricas

```bash
# Eventos recientes
microk8s kubectl get events -n aplicaciones --sort-by='.lastTimestamp' | grep botilyx

# Logs en tiempo real
microk8s kubectl logs -f -n aplicaciones deployment/dev-web-botilyx
```

---

## 🔐 Notas de Seguridad

- ⚠️ El archivo `03-secret-botilyx.yaml` contiene información sensible
- ⚠️ NO subir este archivo a Git
- ⚠️ En producción, considerar usar Sealed Secrets o HashiCorp Vault
- ⚠️ Cambiar todas las contraseñas y secrets antes de producción

---

## 📝 Checklist de Despliegue

- [ ] Base de datos MySQL creada y sincronizada
- [ ] Imagen Docker creada con la versión correcta
- [ ] Directorio `/mnt/dev-web-botilyx` creado con permisos correctos
- [ ] Namespace `aplicaciones` existe
- [ ] PV y PVC creados y bound
- [ ] Secret aplicado con las variables correctas
- [ ] Deployment, Service e Ingress aplicados
- [ ] Pod en estado `Running`
- [ ] Health check responde correctamente
- [ ] Aplicación accesible desde el navegador
- [ ] Login funciona correctamente
- [ ] Subida de imágenes funciona y se persisten

---

## 🆘 Soporte

Para problemas o dudas:
1. Revisar logs del pod
2. Verificar eventos de Kubernetes
3. Revisar documentación en `docs/`
4. Contactar al equipo de desarrollo

