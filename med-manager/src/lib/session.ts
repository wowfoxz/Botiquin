import "server-only";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";

// En producción, esta clave secreta debe ser una cadena larga y aleatoria,
// guardada de forma segura en una variable de entorno.
const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

interface SessionPayload extends JWTPayload {
  userId: string;
  expires: string;
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d") // La sesión expira en 1 día
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    // Esto puede ocurrir si el token ha expirado o es inválido
    return null;
  }
}

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 1 día en milisegundos

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const sessionPayload = { userId, expires: expires.toISOString() };

  const session = await encrypt(sessionPayload);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
    sameSite: "lax",
  });
}

export async function getSession() {
  const sessionCookie = (await cookies()).get("session")?.value;
  if (!sessionCookie) return null;

  const session = await decrypt(sessionCookie);
  return session;
}

export async function deleteSession() {
  // Borra la cookie de sesión
  (await cookies()).set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
  });
}
