import { updateNotificationSettings } from '@/app/actions';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from '@/lib/session';
import AuthWrapper from './components/AuthWrapper';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

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

  let settings = null;
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

          <Card className="shadow-sm border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground">Notificaciones</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configura cuándo deseas recibir alertas sobre tus medicamentos
              </CardDescription>
            </CardHeader>

            <form action={updateNotificationSettings}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="daysBeforeExpiration" className="text-foreground">
                    Avisar de vencimiento (días antes)
                  </Label>
                  <Input
                    id="daysBeforeExpiration"
                    name="daysBeforeExpiration"
                    type="number"
                    min="1"
                    max="365"
                    defaultValue={daysBeforeExpiration}
                    className="bg-background border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold" className="text-foreground">
                    Avisar de stock bajo (cantidad)
                  </Label>
                  <Input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    min="0"
                    step="0.5"
                    defaultValue={lowStockThreshold}
                    className="bg-background border-input"
                  />
                </div>
              </CardContent>

              <CardFooter>
                <Button type="submit" className="w-full md:w-auto">
                  Guardar Cambios
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </AuthWrapper>
  );
}