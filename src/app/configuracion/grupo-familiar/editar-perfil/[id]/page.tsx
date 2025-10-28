"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, User } from "lucide-react";
import Link from "next/link";
import { actualizarPerfilMenor } from "@/app/actions";
import UrlNotifications from "@/components/url-notifications";
import { PhotoUpload } from "@/components/ui/photo-upload";
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

interface EditProfilePageProps {
  params: Promise<{ id: string }>;
}

interface PerfilData {
  id: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  foto?: string | null;
}

export default function EditProfilePage({ params }: EditProfilePageProps) {
  const router = useRouter();
  const [perfilAEditar, setPerfilAEditar] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    fechaNacimiento: '',
    foto: null as string | null,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const resolvedParams = await params;
        const response = await apiFetch(`/api/perfil/${resolvedParams.id}`);
        if (response.ok) {
          const profileData = await response.json();
          setPerfilAEditar(profileData);
          setFormData({
            nombre: profileData.nombre || '',
            dni: profileData.dni || '',
            fechaNacimiento: profileData.fechaNacimiento 
              ? new Date(profileData.fechaNacimiento).toISOString().split('T')[0]
              : '',
            foto: profileData.foto,
          });
        } else {
          router.push('/configuracion/grupo-familiar');
        }
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        router.push('/configuracion/grupo-familiar');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [params, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Cardio size={40} stroke={3} speed={1.5} color="var(--color-primary)" />
            <p className="text-muted-foreground">Cargando datos del perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!perfilAEditar) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <p className="text-destructive">Error al cargar los datos del perfil.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('perfilId', perfilAEditar.id);
      submitFormData.append('nombre', formData.nombre);
      submitFormData.append('dni', formData.dni);
      submitFormData.append('fechaNacimiento', formData.fechaNacimiento);
      if (formData.foto) {
        submitFormData.append('foto', formData.foto);
      }

      await actualizarPerfilMenor(submitFormData);
      // Navegación manejada por el cliente para evitar duplicación de basePath
      router.push('/configuracion/grupo-familiar?success=Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <BreadcrumbLink href={`${config.BASE_PATH}/configuracion/grupo-familiar`}>Grupo Familiar</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Editar Perfil</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Link href="/configuracion/grupo-familiar">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Perfil</h1>
          <p className="text-muted-foreground">
            Modifica los datos del perfil {perfilAEditar.nombre}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto de perfil */}
            <PhotoUpload
              currentPhoto={formData.foto}
              onPhotoChange={(photo) => setFormData({ ...formData, foto: photo })}
              disabled={isSubmitting}
            />
            
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex items-center gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
              <Link href="/configuracion/grupo-familiar">
                <Button variant="outline" type="button" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
