import React from 'react';
import MedicationCard from '@/components/medication-card';
import prisma from '@/lib/prisma';
import Link from 'next/link';
// import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ArchivedMedicationsPage = async () => {
  const medications = await prisma.medication.findMany({
    where: {
      archived: true,
    },
    orderBy: {
      commercialName: 'asc',
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/botiquin">Mi Botiquín</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Medicamentos Archivados</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Medicamentos Archivados
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Lista de medicamentos que han sido archivados
            </p>
          </div>
        </div>

        {/* Stats */}
        {medications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Archive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Archivados</p>
                    <p className="text-2xl font-bold">{medications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content */}
        {medications.length === 0 ? (
          <Alert variant="default" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No tienes medicamentos archivados</AlertTitle>
            <AlertDescription>
              Cuando los medicamentos se agotan, se podran almacenar aquí.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ArchivedMedicationsPage;
