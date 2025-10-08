'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loginUser } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Cardio } from 'ldrs/react';
import 'ldrs/react/Cardio.css';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Limpiar error anterior
    setError(null);
    setIsLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      // Llamar a la acción del servidor para iniciar sesión
      await loginUser(formData);

      // Enviar un evento personalizado para notificar que el usuario ha iniciado sesión
      window.dispatchEvent(new CustomEvent('user-login'));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Credenciales no válidas.');
      } else {
        setError('Credenciales no válidas.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
      {/* Loader overlay centered on the screen when isLoading */}
      {isLoading && (
        <div
          style={{
            display: 'grid',
            placeContent: 'center',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 50,
            background: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Cardio size={70} stroke={5} speed={1} color="var(--color-info)" />
        </div>
      )}

      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <Image
                src="/Botilyx_color_2.svg"
                alt="Logo de la aplicación"
                width={64}
                height={64}
                className="w-64 h-30 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Correo Electrónico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Contraseña
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                Ingresar
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Regístrate aquí
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}