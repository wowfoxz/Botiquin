import { updateNotificationSettings } from '@/app/actions';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default async function SettingsPage() {
  const session = await getSession();
  const userId = session?.userId;

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
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-24">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuración</h1>
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Volver al Stock</span>
            </Button>
          </Link>
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
                  defaultValue={daysBeforeExpiration}
                  className="bg-background text-foreground border-input"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Recibirás una alerta cuando a un medicamento le queden estos días o menos para vencer.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold" className="text-foreground">
                  Umbral de stock bajo (unidades)
                </Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  step="any"
                  defaultValue={lowStockThreshold}
                  className="bg-background text-foreground border-input"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Recibirás una alerta cuando la cantidad de un medicamento sea igual o inferior a este número.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Guardar Cambios
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
