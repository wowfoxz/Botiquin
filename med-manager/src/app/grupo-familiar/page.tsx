import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Users, UserCheck, User } from "lucide-react";
import Link from "next/link";

export default async function GrupoFamiliarPage() {
  const session = await getServerSession();
  
  if (!session?.userId) {
    redirect("/login");
  }

  // Obtener el usuario con su grupo familiar y todos los integrantes
  const usuario = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      grupo: {
        include: {
          integrantes: {
            select: {
              id: true,
              name: true,
              email: true,
              dni: true,
              rol: true,
              fechaNacimiento: true,
            },
          },
          perfilesMenores: {
            select: {
              id: true,
              nombre: true,
              dni: true,
              fechaNacimiento: true,
            },
          },
        },
      },
    },
  });

  if (!usuario?.grupo) {
    redirect("/botiquin");
  }

  const { grupo } = usuario;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grupo Familiar</h1>
          <p className="text-muted-foreground">
            Gestiona los integrantes de tu familia
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/grupo-familiar/agregar-adulto">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Adulto
            </Button>
          </Link>
          <Link href="/grupo-familiar/agregar-menor">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Menor
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {grupo.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Adultos y Menores con cuenta */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Usuarios con Cuenta ({grupo.integrantes.length})
            </h3>
            <div className="grid gap-3">
              {grupo.integrantes.map((integrante) => (
                <div
                  key={integrante.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{integrante.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {integrante.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        DNI: {integrante.dni}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={integrante.rol === "ADULTO" ? "default" : "secondary"}>
                      {integrante.rol === "ADULTO" ? "Adulto" : "Menor"}
                    </Badge>
                    {integrante.id === usuario.id && (
                      <Badge variant="outline">Tú</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Perfiles de menores sin cuenta */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfiles de Menores ({grupo.perfilesMenores.length})
            </h3>
            <div className="grid gap-3">
              {grupo.perfilesMenores.map((perfil) => (
                <div
                  key={perfil.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{perfil.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        DNI: {perfil.dni}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Perfil</Badge>
                </div>
              ))}
            </div>
          </div>

          {grupo.perfilesMenores.length === 0 && grupo.integrantes.length === 1 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay otros integrantes en el grupo familiar.</p>
              <p className="text-sm">
                Agrega familiares para gestionar sus medicamentos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
