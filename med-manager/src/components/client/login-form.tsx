'use client';

import { useState } from 'react';
import Link from 'next/link';
import { loginUser } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { Cardio } from 'ldrs/react';
import 'ldrs/react/Cardio.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations';

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Limpiar error anterior
    setError(null);
    setIsLoading(true);

    try {
      // Crear FormData para mantener compatibilidad con la acción del servidor
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);

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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  Ingresar
                </Button>
              </form>
            </Form>
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