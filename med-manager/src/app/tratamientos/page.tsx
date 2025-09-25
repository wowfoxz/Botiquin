"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  useTratamientos, 
  useMedicinas, 
  useNotificaciones, 
  usePreferenciasNotificaciones 
} from "@/hooks/useTratamientos";
import { Tratamiento, PreferenciasNotificaciones } from "@/types/tratamientos";

export default function TratamientosPage() {
  // Estados para la gestión de tratamientos
  const { 
    tratamientos, 
    loading: loadingTratamientos, 
    error: errorTratamientos, 
    createTratamiento, 
    updateTratamiento, 
    deleteTratamiento 
  } = useTratamientos();
  
  const { 
    medicinas, 
    loading: loadingMedicinas, 
    error: errorMedicinas 
  } = useMedicinas();
  
  const { 
    notificaciones, 
    loading: loadingNotificaciones, 
    error: errorNotificaciones,
    createNotificacion
  } = useNotificaciones();
  
  // Usar un ID de usuario real
  const userId = "user-temp-123";
  
  const { 
    preferencias, 
    loading: loadingPreferencias, 
    error: errorPreferencias,
    updatePreferencias
  } = usePreferenciasNotificaciones(userId);

  // Estados para el formulario
  const [nombreTratamiento, setNombreTratamiento] = useState("");
  const [medicamentoId, setMedicamentoId] = useState("");
  const [frecuenciaHoras, setFrecuenciaHoras] = useState(8);
  const [duracionDias, setDuracionDias] = useState(7);
  const [paciente, setPaciente] = useState("");
  const [dosis, setDosis] = useState("");
  
  // Estados para la UI
  const [openDialog, setOpenDialog] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState("activos");

  // Manejar errores
  useEffect(() => {
    if (errorTratamientos) {
      toast.error(errorTratamientos);
    }
    if (errorMedicinas) {
      toast.error(errorMedicinas);
    }
    if (errorNotificaciones) {
      toast.error(errorNotificaciones);
    }
    if (errorPreferencias) {
      toast.error(errorPreferencias);
    }
  }, [errorTratamientos, errorMedicinas, errorNotificaciones, errorPreferencias]);

  // Función para obtener el nombre de un medicamento por su ID
  const obtenerNombreMedicamento = (id: string) => {
    const medicamento = medicinas.find(m => m.id === id);
    return medicamento ? medicamento.commercialName : "Desconocido";
  };

  // Función para obtener el stock de un medicamento por su ID
  const obtenerStockMedicamento = (id: string) => {
    const medicamento = medicinas.find(m => m.id === id);
    return medicamento ? medicamento.currentQuantity : 0;
  };

  // Función para generar notificaciones para un tratamiento
  const generarNotificaciones = async (tratamiento: Tratamiento) => {
    if (!preferencias) return;

    try {
      const dosisTotales = Math.ceil(tratamiento.durationDays * (24 / tratamiento.frequencyHours));

      for (let i = 0; i < dosisTotales; i++) {
        const fechaDosis = new Date(tratamiento.startDate.getTime() + i * tratamiento.frequencyHours * 60 * 60 * 1000);

        // Crear notificaciones según las preferencias del usuario
        if (preferencias.push) {
          await createNotificacion({
            treatmentId: tratamiento.id,
            scheduledDate: new Date(fechaDosis.getTime() - 30 * 60 * 1000), // 30 minutos antes
            sent: false,
            type: "push",
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        if (preferencias.email) {
          await createNotificacion({
            treatmentId: tratamiento.id,
            scheduledDate: new Date(fechaDosis.getTime() - 1 * 60 * 60 * 1000), // 1 hora antes
            sent: false,
            type: "email",
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        if (preferencias.browser) {
          await createNotificacion({
            treatmentId: tratamiento.id,
            scheduledDate: new Date(fechaDosis.getTime() - 15 * 60 * 1000), // 15 minutos antes
            sent: false,
            type: "browser",
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        if (preferencias.sound) {
          await createNotificacion({
            treatmentId: tratamiento.id,
            scheduledDate: new Date(fechaDosis.getTime() - 5 * 60 * 1000), // 5 minutos antes
            sent: false,
            type: "sound",
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      toast.info(`Se han generado notificaciones para el tratamiento`);
    } catch (error) {
      toast.error("Error al generar notificaciones");
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setNombreTratamiento("");
    setMedicamentoId("");
    setFrecuenciaHoras(8);
    setDuracionDias(7);
    setPaciente("");
    setDosis("");
    setEditandoId(null);
  };

  // Función para manejar el cambio del diálogo
  const handleDialogChange = (open: boolean) => {
    setOpenDialog(open);
    if (!open) {
      resetForm();
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!nombreTratamiento || !medicamentoId || !paciente || !dosis) {
      toast.error("Por favor, complete todos los campos obligatorios");
      return;
    }

    if (frecuenciaHoras <= 0) {
      toast.error("La frecuencia debe ser mayor que 0 horas");
      return;
    }

    if (duracionDias <= 0) {
      toast.error("La duración debe ser mayor que 0 días");
      return;
    }

    if (Number(dosis) <= 0) {
      toast.error("La dosis debe ser mayor que 0");
      return;
    }

    // Verificar stock disponible (asegurando comparación de tipos correcta)
    const dosisPorTratamiento = Math.ceil(duracionDias * (24 / frecuenciaHoras));
    const medicamento = medicinas.find(m => m.id === medicamentoId);
    
    if (!medicamento) {
      toast.error("Medicamento no encontrado");
      return;
    }

    if (Number(medicamento.currentQuantity) < dosisPorTratamiento) {
      toast.error(`Stock insuficiente. Necesita ${dosisPorTratamiento} unidades pero solo hay ${medicamento.currentQuantity} disponibles`);
      return;
    }

    try {
      if (editandoId) {
        // Actualizar tratamiento existente
        await updateTratamiento(editandoId, {
          name: nombreTratamiento,
          medicationId: medicamentoId,
          frequencyHours: frecuenciaHoras,
          durationDays: duracionDias,
          patient: paciente,
          dosage: dosis
        });
        toast.success("Tratamiento actualizado correctamente");
      } else {
        // Crear nuevo tratamiento
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + duracionDias * 24 * 60 * 60 * 1000);

        const nuevoTratamiento = await createTratamiento({
          name: nombreTratamiento,
          medicationId: medicamentoId,
          frequencyHours: frecuenciaHoras,
          durationDays: duracionDias,
          patient: paciente,
          dosage: dosis,
          userId: userId,
          isActive: true,
          startDate: startDate,
          endDate: endDate
        });

        toast.success("Tratamiento creado correctamente");

        // Intentar generar notificaciones para el nuevo tratamiento, manejar fallo de forma separada
        try {
          await generarNotificaciones(nuevoTratamiento);
          toast.info("Se han generado notificaciones para el tratamiento");
        } catch (notifyErr) {
          console.warn("No se pudieron generar notificaciones:", notifyErr);
          toast.warning("Tratamiento creado, pero no se pudieron generar notificaciones");
        }
      }

      // Resetear formulario
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      // Manejo más específico de errores para proporcionar mensajes útiles al usuario
      console.error("Error al guardar el tratamiento:", error);
      const err = error as { response?: { data?: unknown }; status?: number; message?: string };
      let mensaje = "Error al guardar el tratamiento. Intente nuevamente.";

      // Si el backend responde con un mensaje estructurado
      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          mensaje = data;
        } else if (typeof data === "object" && data !== null && "message" in data) {
          mensaje = (data as { message: string }).message;
        } else if (typeof data === "object" && data !== null && "error" in data) {
          mensaje = (data as { error: string }).error;
        }
      } else if (err?.status) {
        // Si solo hay un status
        const status = err.status;
        if (status === 400) mensaje = "Datos inválidos. Verifique los campos.";
        else if (status === 401) mensaje = "No autorizado. Por favor inicie sesión nuevamente.";
        else if (status === 403) mensaje = "Acceso denegado.";
        else if (status === 404) mensaje = "Recurso no encontrado.";
        else if (status === 409) mensaje = "Conflicto de datos. Revise duplicados o el stock.";
        else if (status >= 500) mensaje = "Error en el servidor. Intente más tarde.";
      } else if (typeof err === "string") {
        mensaje = err;
      } else if (err?.message) {
        mensaje = err.message;
      }

      toast.error(mensaje);
    }
  };

  // Función para editar un tratamiento
  const handleEdit = (tratamiento: Tratamiento) => {
    setNombreTratamiento(tratamiento.name);
    setMedicamentoId(tratamiento.medicationId);
    setFrecuenciaHoras(tratamiento.frequencyHours);
    setDuracionDias(tratamiento.durationDays);
    setPaciente(tratamiento.patient);
    setDosis(tratamiento.dosage || "");
    setEditandoId(tratamiento.id);
    setOpenDialog(true);
  };

  // Función para eliminar un tratamiento
  const handleDelete = async (id: string) => {
    try {
      await deleteTratamiento(id);
      toast.success("Tratamiento eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el tratamiento");
    }
  };

  // Función para finalizar un tratamiento
  const handleFinalizar = async (id: string) => {
    try {
      await updateTratamiento(id, { isActive: false });
      toast.success("Tratamiento finalizado correctamente");
    } catch (error) {
      toast.error("Error al finalizar el tratamiento");
    }
  };

  // Función para actualizar preferencias de notificaciones
  const handleUpdatePreferencias = async (newPreferencias: Partial<PreferenciasNotificaciones>) => {
    try {
      await updatePreferencias({
        push: newPreferencias.push ?? preferencias?.push ?? false,
        email: newPreferencias.email ?? preferencias?.email ?? false,
        browser: newPreferencias.browser ?? preferencias?.browser ?? false,
        sound: newPreferencias.sound ?? preferencias?.sound ?? false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      toast.success("Preferencias actualizadas correctamente");
    } catch (error) {
      toast.error("Error al actualizar preferencias");
    }
  };

  // Filtrar tratamientos activos e históricos
  const tratamientosActivos = tratamientos.filter((t) => t.isActive);
  const tratamientosHistoricos = tratamientos.filter((t) => !t.isActive);

  if (loadingTratamientos || loadingMedicinas || loadingNotificaciones || loadingPreferencias) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Tratamientos</h1>
        <Dialog open={openDialog} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>Nuevo Tratamiento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editandoId ? "Editar Tratamiento" : "Nuevo Tratamiento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Tratamiento *</Label>
                <Input
                  id="nombre"
                  value={nombreTratamiento}
                  onChange={(e) => setNombreTratamiento(e.target.value)}
                  placeholder="Nombre del tratamiento"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicamento">Medicamento *</Label>
                <Select value={medicamentoId} onValueChange={setMedicamentoId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un medicamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicinas.map((med) => (
                      <SelectItem key={med.id} value={med.id}>
                        {med.commercialName} (Stock: {med.currentQuantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frecuencia">Frecuencia (horas) *</Label>
                  <Input
                    id="frecuencia"
                    type="number"
                    min="1"
                    max="24"
                    value={frecuenciaHoras}
                    onChange={(e) => setFrecuenciaHoras(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracion">Duración (días) *</Label>
                  <Input
                    id="duracion"
                    type="number"
                    min="1"
                    value={duracionDias}
                    onChange={(e) => setDuracionDias(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dosis">Dosis *</Label>
                <Input
                  id="dosis"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={dosis}
                  onChange={(e) => setDosis(e.target.value)}
                  placeholder="Cantidad de dosis"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paciente">Paciente *</Label>
                <Input
                  id="paciente"
                  value={paciente}
                  onChange={(e) => setPaciente(e.target.value)}
                  placeholder="Nombre del paciente"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  {editandoId ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tabActiva} onValueChange={setTabActiva} className="w-full">
        <TabsList>
          <TabsTrigger value="activos">Tratamientos Activos</TabsTrigger>
          <TabsTrigger value="historicos">Histórico</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activos">
          <Card>
            <CardHeader>
              <CardTitle>Tratamientos Activos</CardTitle>
            </CardHeader>
            <CardContent>
              {tratamientosActivos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Frecuencia</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Dosis</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tratamientosActivos.map((tratamiento) => (
                      <TableRow key={tratamiento.id}>
                        <TableCell>{tratamiento.name}</TableCell>
                        <TableCell>{obtenerNombreMedicamento(tratamiento.medicationId)}</TableCell>
                        <TableCell>Cada {tratamiento.frequencyHours} horas</TableCell>
                        <TableCell>{tratamiento.durationDays} días</TableCell>
                        <TableCell>{tratamiento.patient}</TableCell>
                        <TableCell>{tratamiento.dosage}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(tratamiento)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleFinalizar(tratamiento.id)}
                            >
                              Finalizar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No hay tratamientos activos
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historicos">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Tratamientos</CardTitle>
            </CardHeader>
            <CardContent>
              {tratamientosHistoricos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Medicamento</TableHead>
                      <TableHead>Frecuencia</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Dosis</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tratamientosHistoricos.map((tratamiento) => (
                      <TableRow key={tratamiento.id}>
                        <TableCell>{tratamiento.name}</TableCell>
                        <TableCell>{obtenerNombreMedicamento(tratamiento.medicationId)}</TableCell>
                        <TableCell>Cada {tratamiento.frequencyHours} horas</TableCell>
                        <TableCell>{tratamiento.durationDays} días</TableCell>
                        <TableCell>{tratamiento.patient}</TableCell>
                        <TableCell>{tratamiento.dosage}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {tratamiento.isActive ? "Activo" : "Finalizado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(tratamiento.id)}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No hay tratamientos en el historial
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificaciones">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificaciones Push</h3>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones en la aplicación
                    </p>
                  </div>
                  <Switch
                    checked={preferencias?.push || false}
                    onCheckedChange={(checked) =>
                      handleUpdatePreferencias({ push: checked })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificaciones por Email</h3>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={preferencias?.email || false}
                    onCheckedChange={(checked) =>
                      handleUpdatePreferencias({ email: checked })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificaciones del Navegador</h3>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones del navegador
                    </p>
                  </div>
                  <Switch
                    checked={preferencias?.browser || false}
                    onCheckedChange={(checked) =>
                      handleUpdatePreferencias({ browser: checked })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Alertas Sonoras</h3>
                    <p className="text-sm text-muted-foreground">
                      Reproducir sonido en las notificaciones
                    </p>
                  </div>
                  <Switch
                    checked={preferencias?.sound || false}
                    onCheckedChange={(checked) =>
                      handleUpdatePreferencias({ sound: checked })
                    }
                  />
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-medium mb-4">Próximas Notificaciones</h3>
              
              {notificaciones.filter(n => !n.sent).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tratamiento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notificaciones.filter(n => !n.sent).map((notificacion) => {
                      const tratamiento = tratamientos.find(t => t.id === notificacion.treatmentId);
                      return (
                        <TableRow key={notificacion.id}>
                          <TableCell>
                            {tratamiento ? tratamiento.name : "Tratamiento desconocido"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {notificacion.type === "push" && "Push"}
                              {notificacion.type === "sound" && "Sonora"}
                              {notificacion.type === "email" && "Email"}
                              {notificacion.type === "browser" && "Navegador"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(notificacion.scheduledDate).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Pendiente</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No hay notificaciones programadas
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}