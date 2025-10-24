'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { addMedication, getDescriptionFromAI, getIntakeRecommendationsFromAI } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { IconRobot, IconLoader2 } from '@tabler/icons-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicationSchema, type MedicationFormData } from '@/lib/validations';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from 'next/link';

export default function MedicationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDescriptionLoading, setIsDescriptionLoading] = useState(false);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      commercialName: '',
      activeIngredient: '',
      initialQuantity: '',
      unit: '',
      description: '',
      intakeRecommendations: '',
      expirationDate: '',
      imageUrl: '',
    },
  });

  // Cargar datos de la IA si vienen de parámetros
  useEffect(() => {
    if (searchParams) {
      const formData = {
        commercialName: searchParams.get('nombre_comercial') ?? '',
        activeIngredient: searchParams.get('principios_activos') ?? '',
        initialQuantity: searchParams.get('cantidad_inicial') ?? '',
        unit: searchParams.get('unidad') ?? '',
        description: searchParams.get('descripcion_uso') ?? '',
        intakeRecommendations: searchParams.get('recomendaciones_ingesta') ?? '',
        expirationDate: '',
        imageUrl: searchParams.get('image_url') ?? '',
      };

      // Actualizar el formulario con los datos de la IA
      Object.entries(formData).forEach(([key, value]) => {
        form.setValue(key as keyof MedicationFormData, value);
      });
    }
  }, [searchParams]); // Remover 'form' de las dependencias para evitar re-renders innecesarios

  // Determinar si viene de la IA
  const isFromAI = Object.values(form.getValues()).some(value => value !== '');

  const title = isFromAI
    ? "Agregar Medicamento con IA"
    : "Agregar Medicamento Manualmente";

  const description = isFromAI
    ? "Controla que los datos completados por la IA sean correctos, completa la fecha de vencimiento para registrar tu medicamento"
    : "Completa todos los campos obligatorios para registrar tu medicamento";

  const handleGetDescriptionFromAI = async () => {
    const { commercialName, activeIngredient } = form.getValues();
    
    if (!commercialName && !activeIngredient) {
      toast.error('Por favor, completa al menos el nombre comercial o el principio activo');
      return;
    }

    setIsDescriptionLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('commercialName', commercialName || '');
      formDataToSend.append('activeIngredient', activeIngredient || '');

      const result = await getDescriptionFromAI(formDataToSend);

      if (result.success) {
        form.setValue('description', result.info);
        toast.success('Descripción obtenida exitosamente');
      } else {
        toast.error(result.error || 'Error al obtener la descripción');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al obtener la descripción');
    } finally {
      setIsDescriptionLoading(false);
    }
  };

  const handleGetRecommendationsFromAI = async () => {
    const { commercialName, activeIngredient } = form.getValues();
    
    if (!commercialName && !activeIngredient) {
      toast.error('Por favor, completa al menos el nombre comercial o el principio activo');
      return;
    }

    setIsRecommendationsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('commercialName', commercialName || '');
      formDataToSend.append('activeIngredient', activeIngredient || '');

      const result = await getIntakeRecommendationsFromAI(formDataToSend);

      if (result.success) {
        form.setValue('intakeRecommendations', result.info);
        toast.success('Recomendaciones obtenidas exitosamente');
      } else {
        toast.error(result.error || 'Error al obtener las recomendaciones');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al obtener las recomendaciones');
    } finally {
      setIsRecommendationsLoading(false);
    }
  };

  const onSubmit = async (data: MedicationFormData) => {
    // Prevenir doble envío con ref para mayor seguridad
    if (isSubmitting || isSubmittingRef.current) return;
    
    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      // Crear FormData para mantener compatibilidad con la acción del servidor
      const formData = new FormData();
      formData.append('commercialName', data.commercialName);
      formData.append('activeIngredient', data.activeIngredient || '');
      formData.append('initialQuantity', data.initialQuantity);
      formData.append('unit', data.unit);
      formData.append('description', data.description || '');
      formData.append('intakeRecommendations', data.intakeRecommendations || '');
      formData.append('expirationDate', data.expirationDate);
      if (data.imageUrl) {
        formData.append('imageUrl', data.imageUrl);
      }

      await addMedication(formData);
      toast.success('Medicamento agregado exitosamente');
      // Navegación manejada por el cliente (router.push agrega basePath automáticamente)
      router.push('/botiquin?success=Medicamento agregado exitosamente');
    } catch (error: any) {
      console.error('Error al agregar medicamento:', error);
      toast.error('Error al agregar el medicamento');
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {/* Mostrar la imagen capturada si existe */}
                {form.watch('imageUrl') && (
                  <div className="space-y-2">
                    <FormLabel style={{ color: 'var(--foreground)' }}>
                      Imagen del Medicamento
                    </FormLabel>
                    <div className="relative rounded-md overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                      <Image
                        src={form.watch('imageUrl') || ''}
                        alt="Imagen del medicamento"
                        width={400}
                        height={300}
                        className="w-full h-auto object-contain max-h-64"
                      />
                    </div>
                    <input type="hidden" {...form.register('imageUrl')} />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="commercialName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'var(--foreground)' }}>
                        Nombre Comercial *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Paracetamol 500mg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activeIngredient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'var(--foreground)' }}>
                        Principio Activo
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Paracetamol"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="initialQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: 'var(--foreground)' }}>
                          Cantidad Inicial *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: 'var(--foreground)' }}>
                          Unidad *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: comprimidos, ml"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel style={{ color: 'var(--foreground)' }}>
                          Descripción (Para qué se usa)
                        </FormLabel>
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
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Describe para qué se usa este medicamento..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="intakeRecommendations"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel style={{ color: 'var(--foreground)' }}>
                          Recomendaciones de Ingesta
                        </FormLabel>
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
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Indica cómo y cuándo tomar este medicamento..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: 'var(--foreground)' }}>
                        Fecha de Vencimiento *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/medications/new">Cancelar</Link>
                </Button>
                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Medicamento'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </main>
  );
}
