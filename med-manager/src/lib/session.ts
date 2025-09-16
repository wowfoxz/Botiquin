import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// IMPORTANTE: En una aplicación real, esta clave secreta debe ser una cadena
// larga y aleatoria, guardada de forma segura en una variable de entorno.
const secretKey = 'una-clave-secreta-muy-larga-y-dificil-de-adivinar-para-el-desarrollo';
const key = new TextEncoder().encode(secretKey);
<<<<<<< HEAD
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas
=======
>>>>>>> main

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
<<<<<<< HEAD
    .setExpirationTime('24h') // La sesión expira en 24 horas
=======
    .setExpirationTime('1d') // La sesión expira en 1 día
>>>>>>> main
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
<<<<<<< HEAD
=======
    // Esto puede ocurrir si el token ha expirado o es inválido
>>>>>>> main
    return null;
  }
}

export async function createSession(userId: string) {
<<<<<<< HEAD
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const sessionPayload = { userId, expires: expires.toISOString() };

  const session = await encrypt(sessionPayload);
=======
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 día
  const session = await encrypt({ userId, expires });
>>>>>>> main

  cookies().set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
  });
}

export async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;

  const session = await decrypt(sessionCookie);
<<<<<<< HEAD
  if (!session?.userId || !session?.expires) return null;

  // Comprobar si la sesión está a punto de expirar (ej: en la última mitad de su vida útil)
  // para refrescarla y mantener al usuario logueado si sigue activo.
  const sessionExpires = new Date(session.expires);
  const isApproachingExpiry = sessionExpires.getTime() - Date.now() < SESSION_DURATION_MS / 2;

  if (isApproachingExpiry) {
    await createSession(session.userId);
  }

  return session;
=======

  // Refresca la sesión para que no expire mientras el usuario está activo
  if (session?.userId) {
    await createSession(session.userId);
    return session;
  }

  return null;
>>>>>>> main
}

export async function deleteSession() {
  // Borra la cookie de sesión
  cookies().set('session', '', { expires: new Date(0), path: '/' });
}
