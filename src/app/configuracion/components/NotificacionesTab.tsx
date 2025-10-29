"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { PreferenciasNotificaciones } from "@/types/tratamientos";
import { BellOff, Clock, Smartphone, TestTube, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface NotificacionesTabProps {
  preferencias: PreferenciasNotificaciones | null;
  notificaciones: never[];
  tratamientos: never[];
  onUpdatePreferencias: (newPreferencias: Partial<PreferenciasNotificaciones>) => Promise<void>;
}

export function NotificacionesTab({
  preferencias,
  onUpdatePreferencias
}: NotificacionesTabProps) {
  const { user } = useAuth();
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  } = useNotifications();

  const [deviceInfo, setDeviceInfo] = useState<{ isMobile: boolean; isPWA: boolean }>({
    isMobile: false,
    isPWA: false
  });

  // Detectar tipo de dispositivo
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  ('standalone' in navigator && (navigator as typeof navigator & { standalone: boolean }).standalone);
    
    setDeviceInfo({ isMobile, isPWA });
  }, []);

  // Manejar cambio en preferencias de push
  const handlePushToggle = async (checked: boolean) => {
    if (!user) return;

    try {
      if (checked) {
        // Activar notificaciones push
        await subscribeToPush(user.id);
      } else {
        // Desactivar notificaciones push
        await unsubscribeFromPush(user.id);
      }
      
      // Actualizar preferencias en la base de datos
      await onUpdatePreferencias({ push: checked });
    } catch (error) {
      console.error('Error al actualizar notificaciones push:', error);
      toast.error('Error al actualizar configuración de notificaciones');
    }
  };

  // Manejar envío de notificación de prueba
  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  return (
    <Card className="border-0 shadow-none pl-5 pr-5">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Preferencias de Notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-full ${
                  isSubscribed ? "bg-green-100" : "bg-primary/10"
                }`}
              >
                <Smartphone
                  className={`h-6 w-6 ${
                    isSubscribed ? "text-green-600" : "text-primary"
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium">Notificaciones Push</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md">
                        <div className="space-y-2">
                          {!deviceInfo.isMobile ? (
                            // Instrucciones para PC/Desktop
                            <>
                              <p className="font-medium">Configuración en Windows:</p>
                              <ul className="text-sm space-y-1">
                                <li>• <strong>Windows 10/11:</strong> Configuración → Sistema → Notificaciones y acciones</li>
                                <li>• Busca tu navegador en la lista de aplicaciones</li>
                                <li>• Activa &quot;Permitir notificaciones&quot;</li>
                                <li>• Reinicia el navegador si es necesario</li>
                              </ul>
                            </>
                          ) : deviceInfo.isPWA ? (
                            // Instrucciones para PWA en móvil
                            <>
                              <p className="font-medium">📱 Configuración en PWA (Móvil):</p>
                              <ul className="text-sm space-y-1">
                                <li>• Ve a <strong>Ajustes</strong> del dispositivo</li>
                                <li>• Busca <strong>Aplicaciones</strong> o <strong>Apps</strong></li>
                                <li>• Encuentra <strong>Botilyx</strong> en la lista</li>
                                <li>• Activa <strong>Notificaciones</strong></li>
                                <li>• Verifica que estén habilitadas: Sonido, Vibración, Pantalla de bloqueo</li>
                                <li>• Cierra y vuelve a abrir la app si es necesario</li>
                              </ul>
                            </>
                          ) : (
                            // Instrucciones para navegador móvil
                            <>
                              <p className="font-medium">📱 Configuración en Navegador Móvil:</p>
                              <ul className="text-sm space-y-1">
                                <li><strong>Chrome/Edge:</strong></li>
                                <li>• Toca los 3 puntos (⋮) → <strong>Configuración</strong></li>
                                <li>• Busca <strong>Configuración de sitios</strong></li>
                                <li>• Toca <strong>Notificaciones</strong></li>
                                <li>• Encuentra <strong>web.formosa.gob.ar</strong></li>
                                <li>• Cambia de &quot;Bloqueado&quot; a &quot;Permitido&quot;</li>
                                <li className="mt-2"><strong>Si no aparece el permiso:</strong></li>
                                <li>• Recarga esta página</li>
                                <li>• Acepta cuando aparezca el aviso de notificaciones</li>
                              </ul>
                            </>
                          )}
                          <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                            💡 Sin esta configuración, las notificaciones no aparecerán aunque estén activadas aquí.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isSubscribed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                    aria-live="polite"
                  >
                    {!isSupported 
                      ? "No compatible" 
                      : permission === 'denied'
                      ? "Denegado"
                      : isSubscribed 
                      ? "Activadas" 
                      : "Desactivadas"
                    }
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {!isSupported 
                    ? "Tu navegador no soporta notificaciones push"
                    : permission === 'denied'
                    ? "Los permisos fueron denegados. Actívalos en configuración del navegador"
                    : "Recibir notificaciones push en tu dispositivo"
                  }
                </p>
                {isSubscribed && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleTestNotification}
                    disabled={isLoading}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Enviar prueba
                  </Button>
                )}
              </div>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handlePushToggle}
              disabled={!isSupported || permission === 'denied' || isLoading}
              aria-label="Alternar notificaciones push"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-full ${
                  preferencias?.email ? "bg-green-100" : "bg-primary/10"
                }`}
              >
                <BellOff
                  className={`h-6 w-6 ${
                    preferencias?.email ? "text-green-600" : "text-primary"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-medium">Recordatorios por Email</h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      preferencias?.email
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                    aria-live="polite"
                  >
                    {preferencias?.email ? "Activados" : "Desactivados"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enviar recordatorios a tu correo electrónico
                </p>
              </div>
            </div>
            <Switch
              checked={preferencias?.email || false}
              onCheckedChange={(checked) => onUpdatePreferencias({ email: checked })}
              aria-label="Alternar recordatorios por email"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-full ${
                  preferencias?.sound ? "bg-green-100" : "bg-primary/10"
                }`}
              >
                <Clock
                  className={`h-6 w-6 ${
                    preferencias?.sound ? "text-green-600" : "text-primary"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-medium">Sonido de Notificaciones</h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      preferencias?.sound
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                    aria-live="polite"
                  >
                    {preferencias?.sound ? "Activado" : "Desactivado"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reproducir sonido al recibir notificaciones
                </p>
              </div>
            </div>
            <Switch
              checked={preferencias?.sound || false}
              onCheckedChange={(checked) => onUpdatePreferencias({ sound: checked })}
              aria-label="Alternar sonido de notificaciones"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}