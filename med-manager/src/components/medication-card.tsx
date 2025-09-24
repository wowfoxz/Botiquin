'use client';

import { Medication } from '@prisma/client';
import React, { useState } from 'react';
import { updateMedicationQuantity, toggleMedicationArchiveStatus } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Info, MoreHorizontal } from 'lucide-react';

type MedicationCardProps = {
  medication: Medication;
};

const MedicationCard = ({ medication }: MedicationCardProps) => {
  const {
    id,
    commercialName,
    currentQuantity,
    unit,
    description,
    intakeRecommendations,
    expirationDate,
    archived,
    activeIngredient,
    createdAt,
    updatedAt
  } = medication;

  const [quantity, setQuantity] = useState(currentQuantity);
  const isExpired = new Date() > new Date(expirationDate);
  const expirationDateFormatted = new Date(expirationDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDecrement = async () => {
    const newQuantity = Math.max(0, quantity - 1);
    setQuantity(newQuantity);

    const formData = new FormData();
    formData.append('id', id);
    formData.append('newQuantity', newQuantity.toString());

    try {
      await updateMedicationQuantity(formData);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setQuantity(quantity); // Revert on error
    }
  };

  return (
    <Card className={`overflow-hidden ${isExpired ? 'border-red-500' : 'border-green-500'} border-l-4`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{commercialName}</CardTitle>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              VENCIDO
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {activeIngredient || 'Sin principio activo'}
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm">
            <span className="font-semibold">Cantidad:</span> {quantity} {unit}
          </div>
          <Button
            size="sm"
            onClick={handleDecrement}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Usar
          </Button>
        </div>

        <Separator className="my-2" />

        <div className="flex justify-between gap-2 mt-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Info className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Info</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Información del Medicamento</h4>
                  <p className="text-sm text-muted-foreground">
                    Detalles importantes sobre el uso de este medicamento
                  </p>
                </div>
                <div className="grid gap-2">
                  <div>
                    <div className="font-semibold">Para qué se usa</div>
                    <div className="text-sm">{description || 'No especificado'}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Recomendaciones de Ingesta</div>
                    <div className="text-sm">{intakeRecommendations || 'No especificado'}</div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{commercialName}</DialogTitle>
                <DialogDescription>
                  Información detellada del medicamento
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">Nombre comercial:</span>
                  <span className="col-span-2">{commercialName}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">Principio activo:</span>
                  <span className="col-span-2">{activeIngredient || 'No especificado'}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">Cantidad actual:</span>
                  <span className="col-span-2">{quantity} {unit}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">Vence:</span>
                  <span className={`col-span-2 ${isExpired ? 'text-red-500 font-bold' : ''}`}>
                    {expirationDateFormatted}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">Creado:</span>
                  <span className="col-span-2">
                    {new Date(createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-semibold">Actualizado:</span>
                  <span className="col-span-2">
                    {new Date(updatedAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        {quantity === 0 && (
          <form action={toggleMedicationArchiveStatus}>
            <input type="hidden" name="id" value={id} />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              {archived ? 'Desarchivar' : 'Archivar'}
            </Button>
          </form>
        )}
      </CardFooter>
    </Card>
  );
};

export default MedicationCard;
