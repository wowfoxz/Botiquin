import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// IMPORTANTE: En una aplicación real, esta clave secreta debe ser una cadena
// larga y aleatoria, guardada de forma segura en una variable de entorno.
const secretKey = 'una-clave-secreta-muy-larga-y-dificil-de-adivinar-para-el-desarrollo';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d') // La sesión expira en 1 día
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // Esto puede ocurrir si el token ha expirado o es inválido
    return null;
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 día
  const session = await encrypt({ userId, expires });

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

  // Refresca la sesión para que no expire mientras el usuario está activo
  if (session?.userId) {
    await createSession(session.userId);
    return session;
  }

  return null;
}

export async function deleteSession() {
  // Borra la cookie de sesión
  cookies().set('session', '', { expires: new Date(0), path: '/' });
}
