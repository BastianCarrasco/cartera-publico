// src/pages/FondosConcursablesPage.jsx

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown, // Ya no la necesitamos importar explícitamente si Shadcn la inyecta
  Target,
  ClipboardList,
  Calendar,
  RotateCcw,
  XCircle,
  Plus,
  Info,
  Trash2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea.jsx";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useError } from "@/contexts/ErrorContext";

import fondosService from "../api/fondos.js";
import tipoConvocatoriaService from "../api/tipoconvocatoria.js";

import anidLogo from "../assets/tipos_convocatorias/anid_rojo_azul.png";
import corfoLogo from "../assets/tipos_convocatorias/corfo2024.png";
import goreLogo from "../assets/tipos_convocatorias/gore-valpo.jpg";
import internasPucvLogo from "../assets/tipos_convocatorias/internaspucv.svg";
import privadaLogo from "../assets/tipos_convocatorias/private.png";

const FONDO_LOGOS = {
  ANID: anidLogo,
  CORFO: corfoLogo,
  GORE: goreLogo,
  Internas: internasPucvLogo,
  PRIVADA: privadaLogo,
};

const FONDO_URLS = {
  ANID: "https://anid.cl/",
  CORFO: "https://www.corfo.cl",
  GORE: "https://www.gobiernovalparaiso.cl/",
  Internas: "https://www.pucv.cl/",
  PRIVADA: "",
};

export default function FondosPage() {
  const [fondosData, setFondosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorLocal, setErrorLocal] = useState(null);
  const { setError: setErrorGlobal } = useError();

  const [filterTipoFondo, setFilterTipoFondo] = useState("todos");
  const [filterTrl, setFilterTrl] = useState("todos");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const [tipoConvocatoriaMap, setTipoConvocatoriaMap] = useState({});
  const [tiposConvocatoriaList, setTiposConvocatoriaList] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFondoName, setNewFondoName] = useState("");
  const [newFondoInicio, setNewFondoInicio] = useState("");
  const [newFondoCierre, setNewFondoCierre] = useState("");
  const [newFondoFinanciamiento, setNewFondoFinanciamiento] = useState("");
  const [newFondoPlazo, setNewFondoPlazo] = useState("");
  const [newFondoObjetivo, setNewFondoObjetivo] = useState("");
  const [newFondoTrl, setNewFondoTrl] = useState("");
  const [newFondoReq, setNewFondoReq] = useState("");
  const [newFondoTipo, setNewFondoTipo] = useState("");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fondoAEliminar, setFondoAEliminar] = useState(null);

  const resetNewFondoForm = () => {
    setNewFondoName("");
    setNewFondoInicio("");
    setNewFondoCierre("");
    setNewFondoFinanciamiento("");
    setNewFondoPlazo("");
    setNewFondoObjetivo("");
    setNewFondoTrl("");
    setNewFondoReq("");
    setNewFondoTipo("");
  };

  const getTipoFondoColor = useCallback((tipoFondoNombre) => {
    switch (tipoFondoNombre) {
      case "ANID":
        return "bg-red-500 text-white";
      case "CORFO":
        return "bg-orange-500 text-white";
      case "Internas":
        return "bg-blue-500 text-white";
      case "GORE":
        return "bg-purple-500 text-white";
      case "PRIVADA":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  }, []);

  const renderTipoFondoLogo = useCallback((tipoFondoNombre) => {
    const logoSrc = FONDO_LOGOS[tipoFondoNombre];
    if (logoSrc) {
      return (
        <img
          src={logoSrc}
          alt={`${tipoFondoNombre} Logo`}
          className="h-5 w-5 object-contain rounded-full border border-gray-200"
        />
      );
    }
    return (
      <div className="h-5 w-5 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 text-[0.7rem] font-bold flex-shrink-0">
        {tipoFondoNombre ? tipoFondoNombre.charAt(0) : "F"}
      </div>
    );
  }, []);

  const getTRLColor = (trl) => {
    if (trl === "Sin información") return "bg-gray-500 text-white";
    return "bg-green-500 text-white";
  };

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Sin fecha";
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return "Fecha Inválida";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString("es-CL", options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Fecha Inválida";
    }
  }, []);

  const isFondoVigente = useCallback((fondo) => {
    if (!fondo.inicio || !fondo.cierre) return false;
    const hoy = new Date();
    const inicio = new Date(fondo.inicio);
    const cierre = new Date(fondo.cierre);
    cierre.setHours(23, 59, 59, 999);
    return hoy >= inicio && hoy <= cierre;
  }, []);

  const getEstadoBadgeColor = useCallback((isVigente) => {
    return isVigente ? "bg-green-500 text-white" : "bg-red-500 text-white";
  }, []);

  const fetchAllFondosData = async () => {
    setLoading(true);
    setErrorLocal(null);
    setErrorGlobal(null);
    try {
      const [fondosResponse, tiposConvocatoriaResponse] = await Promise.all([
        fondosService.getAllFondos(),
        tipoConvocatoriaService.getAllTiposConvocatoria(),
      ]);

      const newTipoConvocatoriaMap = {};
      const newTiposConvocatoriaList = [];
      tiposConvocatoriaResponse.forEach((tipo) => {
        newTipoConvocatoriaMap[tipo.id] = tipo.nombre;
        newTiposConvocatoriaList.push(tipo);
      });
      setTipoConvocatoriaMap(newTipoConvocatoriaMap);
      setTiposConvocatoriaList(newTiposConvocatoriaList);

      const processedFondos = fondosResponse.map((fondo) => {
        const tipoNombre = newTipoConvocatoriaMap[fondo.tipo] || "Desconocido";
        const estadoVigente = isFondoVigente(fondo) ? "Vigente" : "Finalizado";

        return {
          ...fondo,
          tipo_nombre: tipoNombre,
          estado_vigencia: estadoVigente,
        };
      });

      setFondosData(processedFondos);
    } catch (err) {
      console.error("Error fetching fondos data:", err);
      setErrorGlobal({
        type: "error",
        title: "Error al cargar los fondos.",
      });
      setErrorLocal(
        "No se pudieron cargar los fondos. Inténtelo de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFondosData();
  }, []);

  const handleCreateFondo = async () => {
    if (!newFondoName.trim()) {
      setErrorLocal("El nombre del fondo es obligatorio.");
      return;
    }
    if (!newFondoTipo) {
      setErrorLocal("El tipo de fondo es obligatorio.");
      return;
    }

    setLoading(true);
    setErrorLocal(null);

    const dataToSend = {
      nombre: newFondoName.trim(),
      inicio: newFondoInicio || null,
      cierre: newFondoCierre || null,
      financiamiento: newFondoFinanciamiento.trim(),
      plazo: newFondoPlazo.trim(),
      objetivo: newFondoObjetivo.trim(),
      trl: newFondoTrl !== "" ? Number(newFondoTrl) : null,
      req: newFondoReq.trim(),
      tipo: Number(newFondoTipo),
      crl: null,
      team: null,
      brl: null,
      iprl: null,
      frl: null,
    };

    try {
      await fondosService.crearFondo(dataToSend);
      setTimeout(() => {
        setErrorGlobal({
          type: "success",
          title: "Fondo creado exitosamente!",
        });
      }, 3000);
      resetNewFondoForm();
      setIsCreateModalOpen(false);
      await fetchAllFondosData();
    } catch (err) {
      console.error("Error al crear fondo:", err);
      setErrorLocal("Error al crear el fondo. Inténtalo de nuevo.");
      setErrorGlobal({
        type: "error",
        title: "Error al crear fondo.",
        description: "No se pudo crear el fondo. Inténtalo de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFondoConfirm = useCallback(async () => {
    if (!fondoAEliminar) return;

    setLoading(true);
    setErrorLocal(null);

    try {
      await fondosService.eliminarFondo(fondoAEliminar.id);
      console.log(
        `Fondo ${fondoAEliminar.id} (${fondoAEliminar.nombre}) eliminado.`
      );
      setTimeout(() => {
        setErrorGlobal({
          type: "success",
          title: "Fondo eliminado exitosamente!",
        });
      }, 3000);
      setIsDeleteDialogOpen(false);
      setFondoAEliminar(null);
      await fetchAllFondosData();
    } catch (err) {
      console.error("Error al eliminar fondo:", err);
      setErrorLocal("Error al eliminar el fondo. Inténtalo de nuevo.");
      setErrorGlobal({
        type: "error",
        title: "Error al eliminar fondo.",
        description:
          "No se pudo eliminar el fondo. Inténtalo de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
    }
  }, [fondoAEliminar, setErrorGlobal]);

  const filteredFondos = useMemo(() => {
    return fondosData.filter((fondo) => {
      const matchesTipoFondo =
        filterTipoFondo === "todos" || fondo.tipo_nombre === filterTipoFondo;
      const matchesTrl =
        filterTrl === "todos" ||
        (fondo.trl !== null && String(fondo.trl) === filterTrl) ||
        (filterTrl === "Sin información" && fondo.trl === null);
      const matchesEstado =
        filterEstado === "todos" || fondo.estado_vigencia === filterEstado;
      const matchesSearch =
        searchTerm === "" ||
        fondo.nombre.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTipoFondo && matchesTrl && matchesEstado && matchesSearch;
    });
  }, [fondosData, filterTipoFondo, filterTrl, filterEstado, searchTerm]);

  const uniqueTiposFondo = useMemo(() => {
    return [...new Set(fondosData.map((f) => f.tipo_nombre))]
      .filter(Boolean)
      .sort();
  }, [fondosData]);

  const uniqueTRLs = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "Sin información",
  ];
  const uniqueEstados = ["Vigente", "Finalizado"];

  const resetFilters = () => {
    setFilterTipoFondo("todos");
    setFilterTrl("todos");
    setFilterEstado("todos");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título principal */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Fondos Concursables
            </h2>
            <p className="text-gray-600 mt-2">
              Explora y gestiona todas las convocatorias disponibles para
              financiar tus proyectos
            </p>
          </div>
          {/* Botón para crear fondo */}
          <Button
            className="bg-blue-600  cursor-pointer text-white hover:bg-blue-700"
            onClick={() => {
              resetNewFondoForm();
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Fondo
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Tipo de Fondo */}
            <div>
              <label
                htmlFor="filterTipoFondo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                TIPO DE FONDO:
              </label>
              <Select
                value={filterTipoFondo}
                onValueChange={setFilterTipoFondo}
              >
                <SelectTrigger id="filterTipoFondo" className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {uniqueTiposFondo.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* TRL */}
            <div>
              <label
                htmlFor="filterTrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                TRL:
              </label>
              <Select value={filterTrl} onValueChange={setFilterTrl}>
                <SelectTrigger id="filterTrl" className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {uniqueTRLs.map((trl) => (
                    <SelectItem key={trl} value={trl}>
                      {trl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div>
              <label
                htmlFor="filterEstado"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ESTADO:
              </label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger id="filterEstado" className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {uniqueEstados.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda */}
            <div className="col-span-full sm:col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-1">
              <label
                htmlFor="searchTerm"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                BUSCAR:
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="searchTerm"
                  type="text"
                  placeholder="Buscar por nombre"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4"
                />
              </div>
            </div>

            {/* Botón Reiniciar Filtros */}
            <div className="col-span-full sm:col-span-2 md:col-span-3 lg:col-span-1 flex items-end justify-end">
              <Button
                onClick={resetFilters}
                className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reiniciar Filtros
              </Button>
            </div>
          </div>
        </div>

        {/* Loading / Error / No Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
            <Spinner size={48} className="text-blue-600 mb-4" />
            <p className="text-lg text-gray-600">
              Cargando fondos... Por favor, espere.
            </p>
          </div>
        ) : errorLocal ? (
          <Alert variant="destructive" className="bg-red-50 text-red-700">
            <XCircle className="h-5 w-5 mr-4" />
            <AlertTitle>Error al cargar fondos</AlertTitle>
            <AlertDescription>{errorLocal}</AlertDescription>
          </Alert>
        ) : filteredFondos.length === 0 ? (
          <Alert variant="default" className="bg-blue-50 text-blue-700">
            <Info className="h-5 w-5 mr-4" />
            <AlertTitle>No hay fondos</AlertTitle>
            <AlertDescription>
              No se encontraron fondos con los filtros o búsqueda actuales.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Headers de columna */}
            <div className="bg-white rounded-t-lg shadow-lg hidden md:block">
              {/* Ajustamos el grid-cols para dar espacio a la flecha y el botón */}
              <div className="grid grid-cols-[1fr_0.8fr_0.5fr_0.8fr_0.8fr_0.8fr_auto_auto] gap-4 p-4 bg-gray-100 border-b border-gray-200 font-semibold text-gray-700 text-sm items-center">
                <div className="text-left">Nombre del Fondo</div>
                <div className="text-center">Tipo de Fondo</div>
                <div className="text-center">TRL</div>
                <div className="text-center">Financiamiento</div>
                <div className="text-center">Duración</div>
                <div className="text-center">Estado</div>
                <div className="text-center"></div>{" "}
                {/* Columna para la flecha */}
                <div className="text-center"></div>{" "}
                {/* Columna para el botón */}
              </div>
            </div>
            {/* Lista de fondos */}
            <div className="bg-white rounded-b-lg shadow-lg overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
                {filteredFondos.map((fondo) => (
                  <AccordionItem
                    value={`item-${fondo.id}`}
                    key={fondo.id}
                    className="border-b border-gray-200"
                  >
                    {/* Fila principal */}
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] items-center py-2 px-6 gap-4 group hover:bg-gray-50 transition-colors">
                      <AccordionTrigger className="flex items-center gap-2 text-left">
                        {renderTipoFondoLogo(fondo.tipo_nombre)}

                        <span className="font-medium text-gray-900 line-clamp-1">
                          {fondo.nombre}
                        </span>
                      </AccordionTrigger>
                      <div className="text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getTipoFondoColor(fondo.tipo_nombre)}`}
                        >
                          {fondo.tipo_nombre}
                        </span>
                        {FONDO_URLS[fondo.tipo_nombre] && (
                          <a
                            href={FONDO_URLS[fondo.tipo_nombre]}
                            target="_blank" // Abrir en nueva pestaña
                            rel="noopener noreferrer" // Seguridad
                            className="text-blue-600 font-semibold mt-2 hover:underline text-xs line-clamp-1"
                            onClick={(e) => e.stopPropagation()} // Evita que el clic en el enlace expanda el acordeón
                          >
                            {FONDO_URLS[fondo.tipo_nombre]}
                          </a>
                        )}
                      </div>
                      <div className="text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getTRLColor(fondo.trl === null ? "Sin información" : String(fondo.trl))}`}
                        >
                          {fondo.trl === null
                            ? "Sin información"
                            : `TRL ${fondo.trl}`}
                        </span>
                      </div>
                      <div className="text-center text-gray-700 font-medium line-clamp-1">
                        {fondo.financiamiento || "Sin información"}
                      </div>
                      <div className="text-center text-gray-700 line-clamp-1">
                        {fondo.plazo || "Sin información"}
                      </div>
                      <div className="text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getEstadoBadgeColor(fondo.estado_vigencia === "Vigente")}`}
                        >
                          {fondo.estado_vigencia}
                        </span>
                      </div>
                      <div className="flex justify-center items-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50/20 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFondoAEliminar(fondo);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    {/* Contenido expandido alineado */}
                    <AccordionContent asChild>
                      <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto]">
                        <div className="col-span-7 bg-gray-50 p-6 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Objetivo */}
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <Target className="w-4 h-4 mr-2 text-gray-600" />
                                Objetivo:
                              </h4>
                              <p className="text-sm text-gray-600">
                                {fondo.objetivo ||
                                  "No se ha especificado el objetivo para este fondo."}
                              </p>
                            </div>
                            {/* Requisitos */}
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <ClipboardList className="w-4 h-4 mr-2 text-gray-600" />
                                Requisitos:
                              </h4>
                              {fondo.req && fondo.req !== "" ? (
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {fondo.req
                                    .split(/[\r\n]/)
                                    .map((req, i) =>
                                      req.trim() ? (
                                        <li key={i}>{req.trim()}</li>
                                      ) : null
                                    )}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-600">
                                  No hay requisitos detallados disponibles.
                                </p>
                              )}
                            </div>
                            {/* Fechas Importantes */}
                            <div className="md:col-span-2">
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                                Fechas Importantes:
                              </h4>
                              <p className="text-sm text-gray-600">
                                Inicio: {formatDate(fondo.inicio)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Cierre: {formatDate(fondo.cierre)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </>
        )}
      </div>

      {/* Modal para Crear Fondo */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="w-full max-w-[95vw] md:max-w-[900px] h-[95vh] overflow-y-auto rounded-lg p-4">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Fondo Concursable</DialogTitle>
            <DialogDescription>
              Introduce los detalles del nuevo fondo concursable.
              <span className="text-red-500 font-bold"> *</span> Campos
              obligatorios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Nombre del Fondo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="newFondoName" className="text-right">
                Nombre del Fondo <span className="text-red-500">*</span>
              </label>
              <Input
                id="newFondoName"
                value={newFondoName}
                onChange={(e) => setNewFondoName(e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Tipo de Fondo (Select) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="newFondoTipo" className="text-right">
                Tipo de Convocatoria <span className="text-red-500">*</span>
              </label>
              <Select value={newFondoTipo} onValueChange={setNewFondoTipo}>
                <SelectTrigger id="newFondoTipo" className="col-span-3">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposConvocatoriaList.map((tipo) => (
                    <SelectItem key={tipo.id} value={String(tipo.id)}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fechas de Inicio y Cierre */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="newFondoInicio" className="text-right">
                Fecha de Inicio
              </label>
              <Input
                id="newFondoInicio"
                type="date"
                value={newFondoInicio}
                onChange={(e) => setNewFondoInicio(e.target.value)}
                className="col-span-3"
              />
              <label htmlFor="newFondoCierre" className="text-right">
                Fecha de Cierre
              </label>
              <Input
                id="newFondoCierre"
                type="date"
                value={newFondoCierre}
                onChange={(e) => setNewFondoCierre(e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Financiamiento y Plazo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="newFondoFinanciamiento" className="text-right">
                Financiamiento
              </label>
              <Input
                id="newFondoFinanciamiento"
                value={newFondoFinanciamiento}
                onChange={(e) => setNewFondoFinanciamiento(e.target.value)}
                className="col-span-3"
              />
              <label htmlFor="newFondoPlazo" className="text-right">
                Plazo
              </label>
              <Input
                id="newFondoPlazo"
                value={newFondoPlazo}
                onChange={(e) => setNewFondoPlazo(e.target.value)}
                className="col-span-3"
              />
            </div>

            {/* Objetivo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="newFondoObjetivo" className="text-right">
                Objetivo
              </label>
              <Textarea
                id="newFondoObjetivo"
                value={newFondoObjetivo}
                onChange={(e) => setNewFondoObjetivo(e.target.value)}
                className="col-span-3 min-h-[80px]"
              />
            </div>

            {/* TRL y Requisitos */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="newFondoTrl" className="text-right">
                TRL
              </label>
              <Select value={newFondoTrl} onValueChange={setNewFondoTrl}>
                <SelectTrigger id="newFondoTrl" className="col-span-3">
                  <SelectValue placeholder="Selecciona TRL" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueTRLs.map((trl) => (
                    <SelectItem key={trl} value={trl}>
                      {trl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label htmlFor="newFondoReq" className="text-right">
                Requisitos (separados por línea)
              </label>
              <Textarea
                id="newFondoReq"
                value={newFondoReq}
                onChange={(e) => setNewFondoReq(e.target.value)}
                className="col-span-3 min-h-[40px]"
              />
            </div>

            {errorLocal && (
              <Alert variant="destructive" className="bg-red-50 text-red-700">
                <XCircle className="h-5 w-5 mr-4" />
                <AlertTitle>Error de formulario</AlertTitle>
                <AlertDescription>{errorLocal}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" onClick={handleCreateFondo}>
              Crear Fondo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para confirmación de eliminación */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el fondo{" "}
              <strong>“{fondoAEliminar?.nombre || "seleccionado"}”</strong> de
              nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFondoConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
