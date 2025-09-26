"use client";

import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tratamiento, PreferenciasNotificaciones, Notificacion } from "@/types/tratamientos";

interface NotificacionesTabProps {
  preferencias: PreferenciasNotificaciones | null;
  notificaciones: Notificacion[];
  tratamientos: Tratamiento[];
  onUpdatePreferencias: (newPreferencias: Partial<PreferenciasNotificaciones>) => Promise<void>;
}

export function NotificacionesTab({ 
  preferencias, 
  notificaciones, 
  tratamientos, 
  onUpdatePreferencias 
}: NotificacionesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias de Notificaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Notificaciones Push</h3>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones en la aplicación
              </p>
            </div>
            <Switch
              checked={preferencias?.push || false}
              onCheckedChange={(checked) =>
                onUpdatePreferencias({ push: checked })
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Notificaciones por Email</h3>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones por correo electrónico
              </p>
            </div>
            <Switch
              checked={preferencias?.email || false}
              onCheckedChange={(checked) =>
                onUpdatePreferencias({ email: checked })
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Notificaciones del Navegador</h3>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones del navegador
              </p>
            </div>
            <Switch
              checked={preferencias?.browser || false}
              onCheckedChange={(checked) =>
                onUpdatePreferencias({ browser: checked })
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Alertas Sonoras</h3>
              <p className="text-sm text-muted-foreground">
                Reproducir sonido en las notificaciones
              </p>
            </div>
            <Switch
              checked={preferencias?.sound || false}
              onCheckedChange={(checked) =>
                onUpdatePreferencias({ sound: checked })
              }
            />
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <h3 className="text-lg font-medium mb-4">Próximas Notificaciones</h3>
        
        {notificaciones.filter(n => !n.sent).length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tratamiento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notificaciones.filter(n => !n.sent).map((notificacion) => {
                const tratamiento = tratamientos.find(t => t.id === notificacion.treatmentId);
                return (
                  <TableRow key={notificacion.id}>
                    <TableCell>
                      {tratamiento ? tratamiento.name : "Tratamiento desconocido"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {notificacion.type === "push" && "Push"}
                        {notificacion.type === "sound" && "Sonora"}
                        {notificacion.type === "email" && "Email"}
                        {notificacion.type === "browser" && "Navegador"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(notificacion.scheduledDate).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pendiente</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No hay notificaciones programadas
          </div>
        )}
      </CardContent>
    </Card>
  );
}