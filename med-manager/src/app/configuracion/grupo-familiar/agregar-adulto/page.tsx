"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agregarAdultoSchema, type AgregarAdultoFormData } from "@/lib/validations";
import { agregarAdultoAlGrupo } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

export default function AgregarAdultoPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);

  const form = useForm<AgregarAdultoFormData>({
    resolver: zodResolver(agregarAdultoSchema),
    defaultValues: {
      name: "",
      email: "",
      dni: "",
      fechaNacimiento: "",
    },
  });

  const onSubmit = async (data: AgregarAdultoFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("dni", data.dni);
      formData.append("fechaNacimiento", data.fechaNacimiento);
      if (foto) {
        formData.append("foto", foto);
      }

      await agregarAdultoAlGrupo(formData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al agregar el adulto. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/configuracion/grupo-familiar"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Grupo Familiar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregar Adulto al Grupo Familiar</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Foto de perfil */}
              <PhotoUpload
                currentPhoto={foto}
                onPhotoChange={setFoto}
                disabled={isLoading}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Juan Pérez"
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
                        placeholder="juan@email.com"
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

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> La contraseña inicial será el DNI del usuario. 
                  El usuario podrá cambiarla después de iniciar sesión.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Cardio size={20} stroke={3} speed={1.5} color="var(--color-info)" />
                    <span>Agregando...</span>
                  </div>
                ) : (
                  "Agregar Adulto"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
