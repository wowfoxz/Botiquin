'use client';

import { addMedication, getDescriptionFromAI, getIntakeRecommendationsFromAI } from '@/app/actions';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IconRobot, IconLoader2 } from '@tabler/icons-react';
import Image from 'next/image';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ManualMedicationPage() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    commercialName: '',
    activeIngredient: '',
    initialQuantity: '',
    unit: '',
    description: '',
    intakeRecommendations: '',
    expirationDate: '',
    imageUrl: '' // Agregar campo para la URL de la imagen
  });

  useEffect(() => {
    if (searchParams) {
      setFormData({
        commercialName: searchParams.get('nombre_comercial') ?? '',
        activeIngredient: searchParams.get('principios_activos') ?? '',
        initialQuantity: searchParams.get('cantidad_inicial') ?? '',
        unit: searchParams.get('unidad') ?? '',
        description: searchParams.get('descripcion_uso') ?? '',
        intakeRecommendations: searchParams.get('recomendaciones_ingesta') ?? '',
        expirationDate: '',
        imageUrl: searchParams.get('image_url') ?? '' // Obtener la URL de la imagen de los parámetros
      });
    }
  }, [searchParams]);

  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);

  // Determinar si viene de la IA (si hay parámetros)
  const isFromAI = Object.values(formData).some(value => value !== '');

  const title = isFromAI
    ? "Agregar Medicamento con IA"
    : "Agregar Medicamento Manualmente";

  const description = isFromAI
    ? "Controla que los datos completados por la IA sean correctos, completa la fecha de vencimiento para registrar tu medicamento"
    : "Completa todos los campos obligatorios para registrar tu medicamento";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGetDescriptionFromAI = async () => {
    if (!formData.commercialName && !formData.activeIngredient) {
      alert('Por favor, completa al menos el nombre comercial o el principio activo');
      return;
    }

    setIsDescriptionLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('commercialName', formData.commercialName || '');
      formDataToSend.append('activeIngredient', formData.activeIngredient || '');

      const result = await getDescriptionFromAI(formDataToSend);

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          description: result.info
        }));
      } else {
        alert(result.error || 'Error al obtener la descripción');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener la descripción');
    } finally {
      setIsDescriptionLoading(false);
    }
  };

  const handleGetRecommendationsFromAI = async () => {
    if (!formData.commercialName && !formData.activeIngredient) {
      alert('Por favor, completa al menos el nombre comercial o el principio activo');
      return;
    }

    setIsRecommendationsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('commercialName', formData.commercialName || '');
      formDataToSend.append('activeIngredient', formData.activeIngredient || '');

      const result = await getIntakeRecommendationsFromAI(formDataToSend);

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          intakeRecommendations: result.info
        }));
      } else {
        alert(result.error || 'Error al obtener las recomendaciones');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener las recomendaciones');
    } finally {
      setIsRecommendationsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-2xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/botiquin">Mi Botiquín</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/medications/new">Agregar Medicamento</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Formulario Manual</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <form action={addMedication}>
            <CardContent className="space-y-6">
              {/* Mostrar la imagen capturada si existe */}
              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label style={{ color: 'var(--foreground)' }}>
                    Imagen del Medicamento
                  </Label>
                  <div className="relative rounded-md overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    <Image
                      src={formData.imageUrl}
                      alt="Imagen del medicamento"
                      width={400}
                      height={300}
                      className="w-full h-auto object-contain max-h-64"
                    />
                  </div>
                  <input type="hidden" name="imageUrl" value={formData.imageUrl} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="commercialName" style={{ color: 'var(--foreground)' }}>
                  Nombre Comercial *
                </Label>
                <Input
                  name="commercialName"
                  value={formData.commercialName}
                  onChange={handleInputChange}
                  id="commercialName"
                  placeholder="Ej: Paracetamol 500mg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activeIngredient" style={{ color: 'var(--foreground)' }}>
                  Principio Activo
                </Label>
                <Input
                  name="activeIngredient"
                  value={formData.activeIngredient}
                  onChange={handleInputChange}
                  id="activeIngredient"
                  placeholder="Ej: Paracetamol"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initialQuantity" style={{ color: 'var(--foreground)' }}>
                    Cantidad Inicial *
                  </Label>
                  <Input
                    name="initialQuantity"
                    value={formData.initialQuantity}
                    onChange={handleInputChange}
                    id="initialQuantity"
                    type="number"
                    step="any"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" style={{ color: 'var(--foreground)' }}>
                    Unidad *
                  </Label>
                  <Input
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    id="unit"
                    placeholder="Ej: comprimidos, ml"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" style={{ color: 'var(--foreground)' }}>
                    Descripción (Para qué se usa)
                  </Label>
                  <Button
                    type="button"
                    onClick={handleGetDescriptionFromAI}
                    disabled={isDescriptionLoading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {isDescriptionLoading ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        Consultando...
                      </>
                    ) : (
                      <>
                        <IconRobot className="h-4 w-4" />
                        Consultar IA
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  id="description"
                  rows={3}
                  placeholder="Describe para qué se usa este medicamento..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="intakeRecommendations" style={{ color: 'var(--foreground)' }}>
                    Recomendaciones de Ingesta
                  </Label>
                  <Button
                    type="button"
                    onClick={handleGetRecommendationsFromAI}
                    disabled={isRecommendationsLoading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {isRecommendationsLoading ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        Consultando...
                      </>
                    ) : (
                      <>
                        <IconRobot className="h-4 w-4" />
                        Consultar IA
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  name="intakeRecommendations"
                  value={formData.intakeRecommendations}
                  onChange={handleInputChange}
                  id="intakeRecommendations"
                  rows={3}
                  placeholder="Indica cómo y cuándo tomar este medicamento..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expirationDate" style={{ color: 'var(--foreground)' }}>
                  Fecha de Vencimiento *
                </Label>
                <Input
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  id="expirationDate"
                  type="date"
                  required
                />
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}></p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/medications/new">Cancelar</Link>
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Guardar Medicamento
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}