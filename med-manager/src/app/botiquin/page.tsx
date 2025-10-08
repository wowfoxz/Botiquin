import MedicationList from "@/components/medication-list";
import NotificationPanel from "@/components/notification-panel";
import Search from "@/components/search";
import { getNotifications } from "@/lib/notifications";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { PackagePlus, Archive } from "lucide-react";
import AuthWrapper from "./components/AuthWrapper";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || "";

  // Verificar si el usuario está autenticado
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) {
    redirect("/login");
  }

  // Verificar si la sesión ha expirado
  try {
    const session = await decrypt(sessionCookie);
    if (
      !session?.userId ||
      (session.expires &&
        new Date(session.expires) <
          new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000))
    ) {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  // Obtener notificaciones (asegurarse de que exista antes de renderizar)
  const notifications = await getNotifications();

  return (
    <AuthWrapper>
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-6xl">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Mi Botiquín</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Mi Botiquín
            </h1>
            <div className="flex gap-2">
              <Link href="/medications/archived">
                <Button variant="outline" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  <span className="hidden sm:inline">Ver Archivados</span>
                  <span className="sm:hidden">Archivados</span>
                </Button>
              </Link>
              <Link href="/medications/new">
                <Button className="flex items-center gap-2">
                  <PackagePlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Agregar Medicamento</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Search placeholder="Buscar medicamentos..." />
          </div>

          {/* Notifications Panel */}
          <div className="mb-6">
            <NotificationPanel notifications={notifications} />
          </div>

          {/* Medication List */}
          <MedicationList query={query} />
        </div>
      </main>
    </AuthWrapper>
  );
}