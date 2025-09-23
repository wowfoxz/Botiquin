import MedicationList from "@/components/medication-list";
import NotificationPanel from "@/components/notification-panel";
import Search from "@/components/search";
import { getNotifications } from "@/lib/notifications";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";

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
    <main
      className="flex min-h-screen flex-col items-center p-24"
      style={{ backgroundColor: "var(--color-surface-primary)" }}
    >
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1
            className="text-4xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Botiquín
          </h1>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotificationPanel notifications={notifications} />

            <Link
              href="/medications/archived"
              className="text-sm font-medium hover:text-color-principal-oscuro"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Ver Archivados
            </Link>

            <Link
              href="/medications/new"
              className="font-bold py-2 px-4 rounded"
              style={{
                backgroundColor: "var(--color-primary-soft-blue)",
                color: "var(--color-text-inverse)",
              }}
            >
              Agregar Medicamento
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Buscar por nombre o droga..." />
        </div>

        {/* Medication list */}
        <div className="mt-12">
          <MedicationList query={query} />
        </div>
      </div>
    </main>
  );
}
