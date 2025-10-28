"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, UserCheck, User, Edit } from "lucide-react";
import Link from "next/link";
import { eliminarUsuarioGrupo, eliminarPerfilMenor } from "@/app/actions";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import UrlNotifications from "@/components/url-notifications";
import { Cardio } from "ldrs/react";
import "ldrs/react/Cardio.css";
import { apiFetch } from "@/lib/api";
import { config } from "@/lib/config";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface Usuario {
  id: string;
  name: string;
  email: string;
  dni: string;
  rol: string;
  fechaNacimiento: Date;
  foto?: string;
}

interface Perfil {
  id: string;
  nombre: string;
  dni: string;
  fechaNacimiento: Date;
  foto?: string;
}

interface Grupo {
  id: string;
  nombre: string;
  integrantes: Usuario[];
  perfilesMenores: Perfil[];
}

interface GrupoFamiliarData {
  grupo: Grupo;
  usuarioActual: Usuario;
}

export default function GrupoFamiliarPage() {
  const [data, setData] = useState<GrupoFamiliarData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await apiFetch('/api/grupo-familiar');
      if (response.ok) {
        const grupoData = await response.json();
        setData(grupoData);
      }
    } catch (error) {
      console.error('Error al cargar datos del grupo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Cardio size={40} stroke={3} speed={1.5} color="var(--color-primary)" />
            <p className="text-muted-foreground">Cargando grupo familiar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <p className="text-destructive">Error al cargar los datos del grupo familiar.</p>
        </div>
      </div>
    );
  }

  const { grupo, usuarioActual } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <UrlNotifications />
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`${config.BASE_PATH}/configuracion`}>Configuración</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Grupo Familiar</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grupo Familiar</h1>
          <p className="text-muted-foreground">
            Gestiona los integrantes de tu familia
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/configuracion/grupo-familiar/agregar-adulto">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Adulto
            </Button>
          </Link>
          <Link href="/configuracion/grupo-familiar/agregar-menor">
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
                    <Avatar className="w-10 h-10">
                      {integrante.foto && (
                        <AvatarImage 
                          src={integrante.foto} 
                          alt={integrante.name || integrante.email}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
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
                    {integrante.id === usuarioActual.id && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Tú</Badge>
                        <Link href={`/configuracion/grupo-familiar/editar-usuario/${integrante.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </Link>
                      </div>
                    )}
                    {integrante.id !== usuarioActual.id && (
                      <div className="flex gap-1">
                        <Link href={`/configuracion/grupo-familiar/editar-usuario/${integrante.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </Link>
                        <DeleteConfirmationDialog
                          title="Eliminar Usuario"
                          description={`¿Estás seguro de que quieres eliminar al usuario "${integrante.name}" del grupo familiar? Esta acción eliminará su cuenta y todos sus datos asociados.`}
                          itemName={integrante.name}
                          onConfirm={async () => {
                            try {
                              const formData = new FormData();
                              formData.append('usuarioId', integrante.id);
                              formData.append('confirmacion', 'ELIMINAR');
                              await eliminarUsuarioGrupo(formData);
                              // Recargar los datos después de eliminar
                              await fetchData();
                            } catch (error) {
                              console.error('Error al eliminar usuario:', error);
                              // Recargar los datos de todas formas para asegurar consistencia
                              await fetchData();
                            }
                          }}
                        />
                      </div>
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
                    <Avatar className="w-10 h-10">
                      {perfil.foto && (
                        <AvatarImage 
                          src={perfil.foto} 
                          alt={perfil.nombre}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-secondary/10 text-secondary-foreground">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{perfil.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        DNI: {perfil.dni}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Perfil</Badge>
                    <div className="flex gap-1">
                      <Link href={`/configuracion/grupo-familiar/editar-perfil/${perfil.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </Link>
                      <DeleteConfirmationDialog
                        title="Eliminar Perfil"
                        description={`¿Estás seguro de que quieres eliminar el perfil de "${perfil.nombre}"? Esta acción eliminará el perfil y todos los datos asociados.`}
                        itemName={perfil.nombre}
                        onConfirm={async () => {
                          try {
                            const formData = new FormData();
                            formData.append('perfilId', perfil.id);
                            formData.append('confirmacion', 'ELIMINAR');
                            await eliminarPerfilMenor(formData);
                            // Recargar los datos después de eliminar
                            await fetchData();
                          } catch (error) {
                            console.error('Error al eliminar perfil:', error);
                            // Recargar los datos de todas formas para asegurar consistencia
                            await fetchData();
                          }
                        }}
                      />
                    </div>
                  </div>
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
