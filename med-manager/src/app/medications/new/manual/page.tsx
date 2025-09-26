import { addMedication } from '@/app/actions';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IconArrowLeft } from '@tabler/icons-react';

export default async function ManualMedicationPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Button asChild variant="ghost" className="pl-0">
            <Link href="/medications/new" className="flex items-center">
              <IconArrowLeft size={16} />
              <span className="ml-2">Volver</span>
            </Link>
          </Button>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Agregar Medicamento Manualmente</CardTitle>
            <CardDescription>Completa todos los campos obligatorios para registrar tu medicamento</CardDescription>
          </CardHeader>

          <form action={addMedication}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="commercialName" style={{ color: 'var(--foreground)' }}>
                  Nombre Comercial *
                </Label>
                <Input
                  name="commercialName"
                  defaultValue={resolvedSearchParams?.nombre_comercial as string ?? ''}
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
                  defaultValue={resolvedSearchParams?.principios_activos as string ?? ''}
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
                    defaultValue={resolvedSearchParams?.cantidad_inicial as string ?? ''}
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
                    defaultValue={resolvedSearchParams?.unidad as string ?? ''}
                    id="unit"
                    placeholder="Ej: comprimidos, ml"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" style={{ color: 'var(--foreground)' }}>
                  Descripción (Para qué se usa)
                </Label>
                <Textarea
                  name="description"
                  defaultValue={resolvedSearchParams?.descripcion_uso as string ?? ''}
                  id="description"
                  rows={3}
                  placeholder="Describe para qué se usa este medicamento..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intakeRecommendations" style={{ color: 'var(--foreground)' }}>
                  Recomendaciones de Ingesta
                </Label>
                <Textarea 
                  name="intakeRecommendations" 
                  defaultValue={resolvedSearchParams?.recomendaciones_ingesta as string ?? ''} 
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
                  id="expirationDate" 
                  type="date" 
                  required
                />
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Este campo debes rellenarlo manualmente.</p>
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