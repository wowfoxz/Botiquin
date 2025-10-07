'use client';

import { Medication } from '@prisma/client';
import React, { useState } from 'react';
import { updateMedicationQuantity, toggleMedicationArchiveStatus, unarchiveMedicationWithNewExpiration, deleteMedication, updateArchivedMedication } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Info, MoreHorizontal, Calendar, Pill, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

type MedicationCardProps = {
  medication: Medication;
};

const MedicationCard = ({ medication }: MedicationCardProps) => {
  const {
    id,
    commercialName,
    currentQuantity,
    initialQuantity,
    unit,
    description,
    intakeRecommendations,
    expirationDate,
    archived,
    activeIngredient,
    createdAt,
    updatedAt,
    imageUrl // Agregar imageUrl de la medicación
  } = medication;

  const [quantity, setQuantity] = useState(currentQuantity);
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false);
  const [newExpirationDate, setNewExpirationDate] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Estados para el formulario de edición
  const [editForm, setEditForm] = useState({
    commercialName: commercialName,
    activeIngredient: activeIngredient || '',
    initialQuantity: initialQuantity,
    unit: unit,
    description: description || '',
    intakeRecommendations: intakeRecommendations || '',
  });

  const isExpired = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000) > new Date(expirationDate);
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

  const handleUnarchive = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newExpirationDate) {
      alert('Por favor ingresa una nueva fecha de vencimiento');
      return;
    }

    const formData = new FormData();
    formData.append('id', id);
    formData.append('newExpirationDate', newExpirationDate);

    try {
      await unarchiveMedicationWithNewExpiration(formData);
      setIsUnarchiveDialogOpen(false);
      setNewExpirationDate('');
    } catch (error) {
      console.error('Error unarchiving medication:', error);
      alert('Error al desarchivar el medicamento');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('id', id);
    formData.append('commercialName', editForm.commercialName);
    formData.append('activeIngredient', editForm.activeIngredient);
    formData.append('initialQuantity', editForm.initialQuantity.toString());
    formData.append('unit', editForm.unit);
    formData.append('description', editForm.description);
    formData.append('intakeRecommendations', editForm.intakeRecommendations);

    try {
      await updateArchivedMedication(formData);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating medication:', error);
      alert('Error al actualizar el medicamento');
    }
  };

  const handleDelete = async () => {
    const formData = new FormData();
    formData.append('id', id);

    try {
      await deleteMedication(formData);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting medication:', error);
      alert('Error al eliminar el medicamento');
    }
  };

  return (
    <Card className={`overflow-hidden ${isExpired ? 'border-red-500' : 'border-green-500'} border-l-4`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold">{commercialName}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {activeIngredient || 'Sin principio activo'}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                VENCIDO
              </Badge>
            )}
            {/* Mostrar imagen del medicamento si existe */}
            {imageUrl ? (
              <div className="relative w-16 h-16 rounded-md overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <Image
                  src={imageUrl}
                  alt={commercialName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--muted)' }}>
                <Pill className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            )}
          </div>
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
                  Información detallada del medicamento
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Mostrar imagen en el diálogo si existe */}
                {imageUrl && (
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-xs h-48 rounded-md overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                      <Image
                        src={imageUrl}
                        alt={commercialName}
                        fill
                        className="object-contain"
                        sizes="(max-width: 384px) 100vw, 384px"
                      />
                    </div>
                  </div>
                )}
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

      <CardFooter className="flex justify-end gap-2">
        {quantity === 0 && (
          <>
            {archived ? (
              <>
                {/* Botón de Editar */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Medicamento Archivado</DialogTitle>
                      <DialogDescription>
                        Modifica la información del medicamento. La fecha de vencimiento solo se puede cambiar al desarchivarlo.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-commercialName">Nombre Comercial *</Label>
                          <Input
                            id="edit-commercialName"
                            value={editForm.commercialName}
                            onChange={(e) => setEditForm({ ...editForm, commercialName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-activeIngredient">Principio Activo</Label>
                          <Input
                            id="edit-activeIngredient"
                            value={editForm.activeIngredient}
                            onChange={(e) => setEditForm({ ...editForm, activeIngredient: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-initialQuantity">Cantidad Inicial *</Label>
                          <Input
                            id="edit-initialQuantity"
                            type="number"
                            step="0.01"
                            value={editForm.initialQuantity}
                            onChange={(e) => setEditForm({ ...editForm, initialQuantity: parseFloat(e.target.value) })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-unit">Unidad *</Label>
                          <Input
                            id="edit-unit"
                            value={editForm.unit}
                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                            placeholder="ej: comprimidos, ml, mg"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Descripción / Para qué se usa</Label>
                        <Textarea
                          id="edit-description"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-intakeRecommendations">Recomendaciones de Ingesta</Label>
                        <Textarea
                          id="edit-intakeRecommendations"
                          value={editForm.intakeRecommendations}
                          onChange={(e) => setEditForm({ ...editForm, intakeRecommendations: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                          Guardar Cambios
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Botón de Eliminar */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Eliminar Medicamento</DialogTitle>
                      <DialogDescription>
                        ¿Estás seguro de que deseas eliminar permanentemente <strong>{commercialName}</strong>?
                        Esta acción no se puede deshacer.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                      >
                        Eliminar Permanentemente
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Botón de Desarchivar */}
                <Dialog open={isUnarchiveDialogOpen} onOpenChange={setIsUnarchiveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2 text-green-500 hover:text-green-600 hover:bg-green-50"
                    >
                      Desarchivar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Desarchivar Medicamento</DialogTitle>
                      <DialogDescription>
                        Ingresa la nueva fecha de vencimiento para {commercialName}.
                        La cantidad se reiniciará a {initialQuantity} {unit}.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUnarchive} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newExpirationDate">Nueva Fecha de Vencimiento</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="newExpirationDate"
                            type="date"
                            value={newExpirationDate}
                            onChange={(e) => setNewExpirationDate(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsUnarchiveDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-green-500 hover:bg-green-600">
                          Confirmar y Desarchivar
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <form action={toggleMedicationArchiveStatus}>
                <input type="hidden" name="id" value={id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Archivar
                </Button>
              </form>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default MedicationCard;
