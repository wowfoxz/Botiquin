"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api";
import { 
  Search, 
  Download, 
  Filter, 
  Calendar as CalendarIcon,
  User,
  Activity,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface HistorialItem {
  id: string;
  usuario: {
    id: string;
    name: string | null;
    email: string;
  };
  tipoAccion: string;
  entidadTipo: string;
  entidadId: string | null;
  datosPrevios: any;
  datosPosteriores: any;
  metadata: any;
  createdAt: string;
}

interface FiltrosHistorial {
  usuarioId?: string;
  tipoAccion?: string;
  entidadTipo?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

interface OpcionesFiltros {
  usuarios: Array<{ id: string; name: string | null; email: string }>;
  tiposAccion: string[];
  tiposEntidad: string[];
}

const HistorialPage = () => {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [opcionesFiltros, setOpcionesFiltros] = useState<OpcionesFiltros>({
    usuarios: [],
    tiposAccion: [],
    tiposEntidad: [],
  });
  const [filtros, setFiltros] = useState<FiltrosHistorial>({});
  const [paginacion, setPaginacion] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [cargando, setCargando] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<HistorialItem | null>(null);

  // Cargar opciones de filtros
  const cargarOpcionesFiltros = async () => {
    try {
      const response = await apiFetch("/api/historial", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setOpcionesFiltros(data);
      }
    } catch (error) {
      console.error("Error al cargar opciones de filtros:", error);
    }
  };

  // Cargar historial
  const cargarHistorial = async (pagina: number = 1) => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        page: pagina.toString(),
        limit: paginacion.limit.toString(),
      });

      if (filtros.usuarioId) params.append("usuario_id", filtros.usuarioId);
      if (filtros.tipoAccion) params.append("tipo_accion", filtros.tipoAccion);
      if (filtros.entidadTipo) params.append("entidad_tipo", filtros.entidadTipo);
      if (filtros.fechaDesde) params.append("fecha_desde", filtros.fechaDesde.toISOString());
      if (filtros.fechaHasta) params.append("fecha_hasta", filtros.fechaHasta.toISOString());

      const response = await apiFetch(`/api/historial?${params}`);
      if (response.ok) {
        const data = await response.json();
        setHistorial(data.data);
        setPaginacion(data.pagination);
      } else {
        console.error("Error al cargar historial:", response.statusText);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setCargando(false);
    }
  };

  // Exportar historial
  const exportarHistorial = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.usuarioId) params.append("usuario_id", filtros.usuarioId);
      if (filtros.tipoAccion) params.append("tipo_accion", filtros.tipoAccion);
      if (filtros.entidadTipo) params.append("entidad_tipo", filtros.entidadTipo);
      if (filtros.fechaDesde) params.append("fecha_desde", filtros.fechaDesde.toISOString());
      if (filtros.fechaHasta) params.append("fecha_hasta", filtros.fechaHasta.toISOString());

      const response = await apiFetch(`/api/historial/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `historial-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error al exportar historial:", error);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({});
    cargarHistorial(1);
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    cargarHistorial(1);
    setMostrarFiltros(false);
  };

  useEffect(() => {
    cargarOpcionesFiltros();
    cargarHistorial();
  }, []);

  const formatearTipoAccion = (tipo: string) => {
    const traducciones: { [key: string]: string } = {
      login: "Inicio de sesión",
      login_fallido: "Intento de login fallido",
      logout: "Cierre de sesión",
      create: "Crear",
      update: "Actualizar",
      delete: "Eliminar",
      search: "Búsqueda",
      view: "Ver",
      export: "Exportar",
      import: "Importar",
      archive: "Archivar",
      unarchive: "Desarchivar",
    };
    return traducciones[tipo] || tipo;
  };

  const formatearEntidad = (entidad: string) => {
    const traducciones: { [key: string]: string } = {
      usuario: "Usuario",
      perfil: "Perfil",
      medicamento: "Medicamento",
      toma: "Toma",
      lista_compra: "Lista de Compras",
      tratamiento: "Tratamiento",
      notificacion: "Notificación",
      grupo_familiar: "Grupo Familiar",
      sesion: "Sesión",
    };
    return traducciones[entidad] || entidad;
  };

  // Función para detectar si un valor es una imagen base64
  const esImagenBase64 = (valor: any): boolean => {
    return typeof valor === 'string' && valor.startsWith('data:image/');
  };

  // Función para renderizar datos de manera inteligente
  const renderizarDatos = (datos: any) => {
    if (!datos) return null;

    return Object.entries(datos).map(([clave, valor]) => {
      if (esImagenBase64(valor)) {
        return (
          <div key={clave} className="mb-3">
            <Label className="text-xs font-medium">{clave}</Label>
            <div className="mt-1">
              <img 
                src={valor as string} 
                alt={`${clave}`}
                className="w-24 h-24 rounded-lg object-cover border"
              />
            </div>
          </div>
        );
      }
      // Si es un campo de foto pero es null, mostrar placeholder
      if (clave === 'foto' && valor === null) {
        return (
          <div key={clave} className="mb-3">
            <Label className="text-xs font-medium">{clave}</Label>
            <div className="mt-1">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/20">
                <User className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </div>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  // Función para filtrar datos que ya se muestran visualmente
  const filtrarDatosParaJSON = (datos: any) => {
    if (!datos) return datos;

    const datosFiltrados = { ...datos };
    
    // Remover campos de foto que ya se muestran visualmente
    Object.keys(datosFiltrados).forEach(clave => {
      const valor = datosFiltrados[clave];
      if (clave === 'foto' && (esImagenBase64(valor) || valor === null)) {
        delete datosFiltrados[clave];
      }
    });

    // Si no quedan datos después del filtrado, no mostrar JSON
    return Object.keys(datosFiltrados).length > 0 ? datosFiltrados : null;
  };

  const obtenerColorBadge = (tipoAccion: string) => {
    switch (tipoAccion) {
      case "login":
        return "bg-green-100 text-green-800";
      case "logout":
        return "bg-gray-100 text-gray-800";
      case "create":
        return "bg-blue-100 text-blue-800";
      case "update":
        return "bg-yellow-100 text-yellow-800";
      case "delete":
        return "bg-red-100 text-red-800";
      case "search":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Historial del Sistema</h1>
        <p className="text-muted-foreground">
          Auditoría completa de todas las acciones realizadas en el sistema
        </p>
      </div>

      {/* Controles superiores */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Registro de Actividades
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Button
                variant="outline"
                onClick={exportarHistorial}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <Button
                variant="outline"
                onClick={() => cargarHistorial(paginacion.page)}
                disabled={cargando}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Panel de filtros */}
        {mostrarFiltros && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por usuario */}
              <div>
                <Label htmlFor="usuario">Usuario</Label>
                <Select
                  value={filtros.usuarioId || "todos"}
                  onValueChange={(value) =>
                    setFiltros({ ...filtros, usuarioId: value === "todos" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los usuarios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los usuarios</SelectItem>
                    {opcionesFiltros.usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.name || usuario.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por tipo de acción */}
              <div>
                <Label htmlFor="tipoAccion">Tipo de Acción</Label>
                <Select
                  value={filtros.tipoAccion || "todas"}
                  onValueChange={(value) =>
                    setFiltros({ ...filtros, tipoAccion: value === "todas" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las acciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las acciones</SelectItem>
                    {opcionesFiltros.tiposAccion.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {formatearTipoAccion(tipo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por tipo de entidad */}
              <div>
                <Label htmlFor="entidadTipo">Entidad</Label>
                <Select
                  value={filtros.entidadTipo || "todas"}
                  onValueChange={(value) =>
                    setFiltros({ ...filtros, entidadTipo: value === "todas" ? undefined : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las entidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las entidades</SelectItem>
                    {opcionesFiltros.tiposEntidad.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {formatearEntidad(tipo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por rango de fechas */}
              <div>
                <Label>Rango de Fechas</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Desde
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filtros.fechaDesde}
                        onSelect={(date) =>
                          setFiltros({ ...filtros, fechaDesde: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Hasta
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filtros.fechaHasta}
                        onSelect={(date) =>
                          setFiltros({ ...filtros, fechaHasta: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={aplicarFiltros}>Aplicar Filtros</Button>
              <Button variant="outline" onClick={limpiarFiltros}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Lista de historial */}
      <Card>
        <CardContent className="p-0">
          {cargando ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Cargando historial...</span>
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron registros</p>
            </div>
          ) : (
            <div className="divide-y">
              {historial.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={obtenerColorBadge(item.tipoAccion)}>
                          {formatearTipoAccion(item.tipoAccion)}
                        </Badge>
                        <Badge variant="outline">
                          {formatearEntidad(item.entidadTipo)}
                        </Badge>
                        {item.entidadId && (
                          <span className="text-sm text-muted-foreground">
                            ID: {item.entidadId}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{item.usuario.name || item.usuario.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setItemSeleccionado(item)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {paginacion.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => cargarHistorial(paginacion.page - 1)}
            disabled={!paginacion.hasPrevPage || cargando}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Página {paginacion.page} de {paginacion.totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => cargarHistorial(paginacion.page + 1)}
            disabled={!paginacion.hasNextPage || cargando}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Modal de detalles */}
      {itemSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Detalles del Evento</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setItemSeleccionado(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <Label>Usuario</Label>
                  <p className="text-sm">
                    {itemSeleccionado.usuario.name || itemSeleccionado.usuario.email}
                  </p>
                </div>
                
                <div>
                  <Label>Acción</Label>
                  <Badge className={obtenerColorBadge(itemSeleccionado.tipoAccion)}>
                    {formatearTipoAccion(itemSeleccionado.tipoAccion)}
                  </Badge>
                </div>
                
                <div>
                  <Label>Entidad</Label>
                  <p className="text-sm">{formatearEntidad(itemSeleccionado.entidadTipo)}</p>
                </div>
                
                <div>
                  <Label>Fecha y Hora</Label>
                  <p className="text-sm">
                    {format(new Date(itemSeleccionado.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                  </p>
                </div>

                {itemSeleccionado.datosPrevios && (
                  <div>
                    <Label>Datos Previos</Label>
                    <div className="space-y-3">
                      {renderizarDatos(itemSeleccionado.datosPrevios)}
                      {filtrarDatosParaJSON(itemSeleccionado.datosPrevios) && (
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(filtrarDatosParaJSON(itemSeleccionado.datosPrevios), null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {itemSeleccionado.datosPosteriores && (
                  <div>
                    <Label>Datos Posteriores</Label>
                    <div className="space-y-3">
                      {renderizarDatos(itemSeleccionado.datosPosteriores)}
                      {filtrarDatosParaJSON(itemSeleccionado.datosPosteriores) && (
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(filtrarDatosParaJSON(itemSeleccionado.datosPosteriores), null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {itemSeleccionado.metadata && (
                  <div>
                    <Label>Metadata</Label>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(itemSeleccionado.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HistorialPage;
