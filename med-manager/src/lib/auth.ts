import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

export async function getServerSession() {
  const sessionCookie = (await cookies()).get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = await decrypt(sessionCookie);

    // Verificar si la sesión ha expirado
    if (session?.expires) {
      const expiresAt = new Date(session.expires);
      const now = new Date();

      if (expiresAt < now) {
        return null;
      }
    }

    return session;
  } catch {
    return null;
  }
}
