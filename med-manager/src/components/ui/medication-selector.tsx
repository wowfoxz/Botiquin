"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Pill, ChevronDown } from "lucide-react";
import { Medicamento } from "@/types/tratamientos";
import { TreatmentMedicationFormData } from "@/lib/validations";

interface MedicationSelectorProps {
  medicinas: Medicamento[];
  medications: TreatmentMedicationFormData[];
  onMedicationsChange: (medications: TreatmentMedicationFormData[]) => void;
  disabled?: boolean;
}

export function MedicationSelector({ 
  medicinas, 
  medications, 
  onMedicationsChange, 
  disabled = false 
}: MedicationSelectorProps) {
  const [expandedMedications, setExpandedMedications] = useState<{ [key: number]: boolean }>({});
  
  const addMedication = () => {
    const newMedication: TreatmentMedicationFormData = {
      medicationId: "",
      dosage: "",
      frequencyHours: "8",
      durationDays: "7",
      startOption: "now",
      specificDate: undefined,
    };
    onMedicationsChange([...medications, newMedication]);
  };

  const removeMedication = (index: number) => {
    const updatedMedications = medications.filter((_, i) => i !== index);
    onMedicationsChange(updatedMedications);
    
    // Limpiar estado de expansión para el medicamento eliminado
    const newExpandedState = { ...expandedMedications };
    delete newExpandedState[index];
    // Reindexar los medicamentos restantes
    const reindexedState: { [key: number]: boolean } = {};
    Object.keys(newExpandedState).forEach(key => {
      const oldIndex = parseInt(key);
      if (oldIndex > index) {
        reindexedState[oldIndex - 1] = newExpandedState[oldIndex];
      } else if (oldIndex < index) {
        reindexedState[oldIndex] = newExpandedState[oldIndex];
      }
    });
    setExpandedMedications(reindexedState);
  };

  const toggleMedicationExpansion = (index: number) => {
    setExpandedMedications(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const updateMedication = (index: number, field: keyof TreatmentMedicationFormData, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };
    onMedicationsChange(updatedMedications);
  };

  // Función para determinar si un medicamento es líquido
  const esMedicamentoLiquido = (medicina: Medicamento | undefined) => {
    if (!medicina?.unit) return false;
    const unidad = medicina.unit.toLowerCase();
    return unidad.includes('ml') || unidad.includes('cc') || unidad.includes('litro') || unidad.includes('gota');
  };

  // Calcular dosis totales para un medicamento
  const calcularDosisTotales = (medication: TreatmentMedicationFormData) => {
    const frecuencia = Number(medication.frequencyHours) || 8;
    const duracion = Number(medication.durationDays) || 7;
    return Math.ceil(duracion * (24 / frecuencia));
  };

  // Verificar stock disponible
  const verificarStock = (medication: TreatmentMedicationFormData) => {
    if (!medication.medicationId) return null;
    const medicina = medicinas.find(m => m.id === medication.medicationId);
    if (!medicina) return null;
    
    const dosisNecesarias = calcularDosisTotales(medication);
    return {
      disponible: medicina.currentQuantity,
      necesario: dosisNecesarias,
      suficiente: medicina.currentQuantity >= dosisNecesarias,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Medicamentos del Tratamiento</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMedication}
          disabled={disabled}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar Medicamento
        </Button>
      </div>

      {medications.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Pill className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center mb-4">
              No hay medicamentos agregados al tratamiento
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={addMedication}
              disabled={disabled}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Primer Medicamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {medications.map((medication, index) => {
            const stockInfo = verificarStock(medication);
            const medicina = medicinas.find(m => m.id === medication.medicationId);
            
            return (
              <Card key={index} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-2 cursor-pointer flex-1"
                      onClick={() => toggleMedicationExpansion(index)}
                    >
                      <CardTitle className="text-base flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Medicamento {index + 1}
                      </CardTitle>
                      {medicina && (
                        <span className="text-sm text-muted-foreground">
                          - {medicina.commercialName}
                        </span>
                      )}
                      <ChevronDown className={`h-4 w-4 transition-transform ${expandedMedications[index] ?? (index === medications.length - 1) ? 'rotate-180' : ''}`} />
                    </div>
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        disabled={disabled}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                {(expandedMedications[index] ?? (index === medications.length - 1)) && (
                <CardContent className="space-y-4">
                  {/* Selección de medicamento */}
                  <div className="space-y-2">
                    <Label>Medicamento *</Label>
                    <Select
                      value={medication.medicationId}
                      onValueChange={(value) => updateMedication(index, "medicationId", value)}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar medicamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicinas
                          .filter(m => !m.archived)
                          .map((med) => (
                            <SelectItem key={med.id} value={med.id}>
                              {med.commercialName} (Stock: {med.currentQuantity} {med.unit})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dosis y frecuencia */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Dosis por toma *</Label>
                      {medicina && (
                        <p className="text-xs text-muted-foreground">
                          {esMedicamentoLiquido(medicina) 
                            ? "Puede ingresar decimales (ej: 5.5 ml)" 
                            : "Solo números enteros (ej: 2 pastillas)"
                          }
                        </p>
                      )}
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          step={esMedicamentoLiquido(medicina) ? "0.1" : "1"}
                          placeholder="Cantidad"
                          value={medication.dosage}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Para medicamentos sólidos, solo permitir números enteros
                            if (!esMedicamentoLiquido(medicina)) {
                              const intValue = Math.floor(parseFloat(value) || 0);
                              updateMedication(index, "dosage", intValue.toString());
                            } else {
                              updateMedication(index, "dosage", value);
                            }
                          }}
                          disabled={disabled}
                          className="pr-16"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-sm">
                          {medicina?.unit || "unidades"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Frecuencia (horas) *</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          value={medication.frequencyHours}
                          onChange={(e) => updateMedication(index, "frequencyHours", e.target.value)}
                          disabled={disabled}
                          className="pr-16"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-sm">
                          horas
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Duración (días) *</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          value={medication.durationDays}
                          onChange={(e) => updateMedication(index, "durationDays", e.target.value)}
                          disabled={disabled}
                          className="pr-16"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-sm">
                          días
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de stock */}
                  {stockInfo && (
                    <div className={`p-3 rounded-md ${
                      stockInfo.suficiente 
                        ? "bg-success/10 border border-success/20" 
                        : "bg-destructive/10 border border-destructive/20"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Dosis totales estimadas: {stockInfo.necesario} {medicina?.unit || "unidades"}
                        </span>
                        <Badge 
                          variant={stockInfo.suficiente ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {stockInfo.suficiente ? "Stock suficiente" : "Stock insuficiente"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Disponible: {stockInfo.disponible} {medicina?.unit || "unidades"}
                      </p>
                    </div>
                  )}

                  {/* Inicio del medicamento */}
                  <div className="space-y-3">
                    <Label>Inicio del Medicamento *</Label>
                    <RadioGroup
                      value={medication.startOption}
                      onValueChange={(value) => updateMedication(index, "startOption", value)}
                      disabled={disabled}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="now" id={`now-${index}`} />
                        <Label htmlFor={`now-${index}`}>Iniciar ahora</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="specific" id={`specific-${index}`} />
                        <Label htmlFor={`specific-${index}`}>Iniciar en fecha específica</Label>
                      </div>
                    </RadioGroup>

                    {medication.startOption === "specific" && (
                      <div className="space-y-2">
                        <Label>Fecha y Hora de Inicio</Label>
                        <Input
                          type="datetime-local"
                          min={new Date().toISOString().slice(0, 16)}
                          value={medication.specificDate || ""}
                          onChange={(e) => updateMedication(index, "specificDate", e.target.value)}
                          disabled={disabled}
                        />
                        <p className="text-xs text-muted-foreground">
                          Seleccione la fecha y hora en que desea que comience este medicamento
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
