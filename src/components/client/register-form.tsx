'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registerUser } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image';
import { config } from '@/lib/config';
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validations';

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      dni: '',
      fechaNacimiento: '',
      password: '',
      grupoNombre: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Limpiar error anterior
    setError(null);
    setIsLoading(true);

    try {
      // Crear FormData para mantener compatibilidad con la acción del servidor
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('dni', data.dni);
      formData.append('fechaNacimiento', data.fechaNacimiento);
      formData.append('password', data.password);
      formData.append('grupoNombre', data.grupoNombre);

      // Llamar a la acción del servidor para registrar al usuario
      await registerUser(formData);

      // Enviar un evento personalizado para notificar que el usuario se ha registrado
      window.dispatchEvent(new CustomEvent('user-login'));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error al registrar el usuario. Por favor, inténtalo de nuevo.');
      } else {
        setError('Error al registrar el usuario. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <Image
                src={`${config.BASE_PATH}/Botilyx_color_2.svg`}
                alt="Logo de la aplicación"
                width={64}
                height={64}
                className="w-64 h-30 object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold">Crear una Cuenta</CardTitle>
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Tu nombre completo"
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
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="12345678"
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
                  name="fechaNacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
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

                <FormField
                  control={form.control}
                  name="grupoNombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Grupo Familiar</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Familia García"
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
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Cardio size={20} stroke={3} speed={1.5} color="var(--color-info)" />
                      <span>Registrando...</span>
                    </div>
                  ) : (
                    'Registrarse'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}