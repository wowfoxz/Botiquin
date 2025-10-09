"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agregarMenorConCuentaSchema, agregarPerfilMenorSchema, type AgregarMenorConCuentaFormData, type AgregarPerfilMenorFormData } from "@/lib/validations";
import { agregarMenorConCuentaAlGrupo, agregarPerfilMenorAlGrupo } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";

export default function AgregarMenorPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tipoMenor, setTipoMenor] = useState<"con-cuenta" | "sin-cuenta">("con-cuenta");

  const formConCuenta = useForm<AgregarMenorConCuentaFormData>({
    resolver: zodResolver(agregarMenorConCuentaSchema),
    defaultValues: {
      name: "",
      email: "",
      dni: "",
      fechaNacimiento: "",
    },
  });

  const formSinCuenta = useForm<AgregarPerfilMenorFormData>({
    resolver: zodResolver(agregarPerfilMenorSchema),
    defaultValues: {
      name: "",
      dni: "",
      fechaNacimiento: "",
    },
  });

  const onSubmitConCuenta = async (data: AgregarMenorConCuentaFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("dni", data.dni);
      formData.append("fechaNacimiento", data.fechaNacimiento);

      await agregarMenorConCuentaAlGrupo(formData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al agregar el menor. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSinCuenta = async (data: AgregarPerfilMenorFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("dni", data.dni);
      formData.append("fechaNacimiento", data.fechaNacimiento);

      await agregarPerfilMenorAlGrupo(formData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al agregar el perfil. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reiniciar formularios cuando cambie el tipo de menor
  useEffect(() => {
    if (tipoMenor === "con-cuenta") {
      formSinCuenta.reset();
    } else {
      formConCuenta.reset();
    }
    setError(null);
  }, [tipoMenor, formConCuenta, formSinCuenta]);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/grupo-familiar"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Grupo Familiar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregar Menor al Grupo Familiar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Tipo de Menor</Label>
            <RadioGroup
              value={tipoMenor}
              onValueChange={(value) => {
                setTipoMenor(value as "con-cuenta" | "sin-cuenta");
                // Limpiar errores al cambiar tipo
                setError(null);
              }}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="con-cuenta" id="con-cuenta" />
                <Label htmlFor="con-cuenta">Menor con cuenta (puede iniciar sesión)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sin-cuenta" id="sin-cuenta" />
                <Label htmlFor="sin-cuenta">Perfil de menor (solo perfil, sin cuenta)</Label>
              </div>
            </RadioGroup>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {tipoMenor === "con-cuenta" ? (
            <Form {...formConCuenta} key="con-cuenta">
              <form onSubmit={formConCuenta.handleSubmit(onSubmitConCuenta)} className="space-y-4">
                <FormField
                  control={formConCuenta.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="María García"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formConCuenta.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="maria@email.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formConCuenta.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="87654321"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formConCuenta.control}
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
                    <strong>Nota:</strong> La contraseña inicial será el DNI del menor. 
                    Solo podrá registrar tomas para sí mismo.
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
                    "Agregar Menor con Cuenta"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...formSinCuenta} key="sin-cuenta">
              <form onSubmit={formSinCuenta.handleSubmit(onSubmitSinCuenta)} className="space-y-4">
                <FormField
                  control={formSinCuenta.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Carlos García"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formSinCuenta.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="11223344"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formSinCuenta.control}
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

                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> Este menor no podrá iniciar sesión. 
                    Solo los adultos podrán registrar tomas para él.
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
                    "Agregar Perfil de Menor"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
