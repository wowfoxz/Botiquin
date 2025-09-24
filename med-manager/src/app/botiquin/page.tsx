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
      (session.expires && new Date(session.expires) < new Date())
    ) {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  const notifications = await getNotifications();

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Mi Botiquín
          </h1>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Notifications */}
            <NotificationPanel notifications={notifications} />

            <Link href="/medications/archived">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                <span className="hidden sm:inline">Ver Archivados</span>
              </Button>
            </Link>

            <Link href="/medications/new">
              <Button size="sm" className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600">
                <PackagePlus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar Medicamento</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <Search placeholder="Buscar por nombre comercial o principio activo..." />
        </div>

        {/* Medication list */}
        <div className="mt-6 md:mt-8">
          <MedicationList query={query} />
        </div>
      </div>
    </main>
  );
}
