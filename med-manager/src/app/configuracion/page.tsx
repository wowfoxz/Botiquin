import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
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
import UrlNotifications from "@/components/url-notifications";
import NotificationSettingsForm from './components/NotificationSettingsForm';

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

          <NotificationSettingsForm 
            daysBeforeExpiration={daysBeforeExpiration}
            lowStockThreshold={lowStockThreshold}
          />
        </div>
      </main>
    </AuthWrapper>
  );
}