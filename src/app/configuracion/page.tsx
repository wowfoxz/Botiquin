import prisma from '@/lib/prisma';
// import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/session';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';
import AuthWrapper from './components/AuthWrapper';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import UrlNotifications from "@/components/url-notifications";
import NotificationSettingsForm from './components/NotificationSettingsForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, History, Bell } from "lucide-react";
import Link from "next/link";
import { config } from "@/lib/config";

export default async function SettingsPage() {
  // Verificar si el usuario está autenticado
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) {
    redirect('/login');
  }

  // Verificar si la sesión ha expirado
  let userId: string | null = null;
  try {
    const session = await decrypt(sessionCookie);
    // Comparar fechas teniendo en cuenta la zona horaria local
    const nowLocal = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000);
    if (!session?.userId || (session.expires && new Date(session.expires) < nowLocal)) {
      redirect('/login');
    }
    userId = session.userId;
  } catch {
    redirect('/login');
  }

  let settings: {
    userId: string;
    id: string;
    daysBeforeExpiration: number;
    lowStockThreshold: number;
  } | null = null;
  if (userId) {
    settings = await prisma.notificationSettings.findUnique({
      where: { userId: userId },
    });
  }

  // Default values if no settings are found
  const daysBeforeExpiration = settings?.daysBeforeExpiration ?? 30;
  const lowStockThreshold = settings?.lowStockThreshold ?? 10;

  return (
    <AuthWrapper>
      <UrlNotifications />
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-24">
        <div className="w-full max-w-2xl">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Configuración</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuración</h1>
          </div>

          {/* Secciones de configuración */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Configuración de notificaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationSettingsForm 
                  daysBeforeExpiration={daysBeforeExpiration}
                  lowStockThreshold={lowStockThreshold}
                />
              </CardContent>
            </Card>

            {/* Preferencias de notificaciones push */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notificaciones Push
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Configura notificaciones push, recordatorios por email y preferencias de sonido.
                </p>
                <Link href={`${config.BASE_PATH}/configuracion/notificaciones`}>
                  <Button className="w-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Gestionar Preferencias
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Grupo familiar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Grupo Familiar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Gestiona los integrantes de tu familia y sus medicamentos.
                </p>
                <Link href="/configuracion/grupo-familiar">
                  <Button className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Administrar Grupo Familiar
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Historial de actividades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Historial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Revisa el historial completo de actividades y cambios en tu cuenta.
                </p>
                <Link href="/historial">
                  <Button className="w-full">
                    <History className="w-4 h-4 mr-2" />
                    Ver Historial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </AuthWrapper>
  );
}