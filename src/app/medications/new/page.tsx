import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCameraPlus, IconBallpen } from '@tabler/icons-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function NewMedicationPage() {

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
                <BreadcrumbPage>Agregar Medicamento</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--foreground)' }}>Agregar Nuevo Medicamento</h1>
          <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
            La forma más rápida y fácil de registrar tus medicamentos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opción principal: Agregar con foto */}
          <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <IconCameraPlus className="text-primary" size={24} />
              </div>
              <CardTitle className="text-xl">Agregar con Foto</CardTitle>
              <CardDescription>
                Toma una foto del envase del medicamento y déjalo que nuestra IA complete la información
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button asChild className="w-full">
                <Link href="/medications/new/upload">
                  Usar Cámara o Subir Foto
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Opción secundaria: Agregar manualmente */}
          <Card className="shadow-md hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-secondary">
            <CardHeader className="text-center">
              <div className="mx-auto bg-secondary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <IconBallpen className="text-secondary" size={24} />
              </div>
              <CardTitle className="text-xl">Agregar Manualmente</CardTitle>
              <CardDescription>
                Completa la información del medicamento manualmente
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button asChild variant="secondary" className="w-full">
                <Link href="/medications/new/manual">
                  Completar Formulario
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
