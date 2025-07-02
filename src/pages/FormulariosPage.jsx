import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Home,
  PieChart,
  School,
  User,
  Users,
  XCircle,
  List,
  Info,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner"; // Importa el Spinner de Shadcn
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Importa Alert de Shadcn
import { Button } from "@/components/ui/button"; // Importa Button de Shadcn
import { Input } from "@/components/ui/input"; // Importa Input de Shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useError } from "@/contexts/ErrorContext"; // Importa tu hook de error global

import respuestasCuestionarioService from "../api/respuestas-cuestionario.js";
import academicosService from "../api/academicos.js";
import unidadesAcademicasService from "../api/unidadesacademicas.js";
import cuestionariosService from "../api/cuestionarios.js";

export default function FormulariosPage() {
  // Estados para los datos reales de la API
  const [respuestasData, setRespuestasData] = useState([]); // Todas las respuestas del cuestionario
  const [preguntasData, setPreguntasData] = useState([]); // Preguntas del cuestionario

  // Mapas para IDs a Nombres
  const [academicosMap, setAcademicosMap] = useState({}); // id_academico -> {nombre_completo, ...}
  const [unidadesMap, setUnidadesMap] = useState({}); // id_unidad -> {nombre, ...}

  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [errorLocal, setErrorLocal] = useState(null);
  const { setError: setErrorGlobal } = useError();

  const [filtroAcademico, setFiltroAcademico] = useState("todos"); // Valor "todos" para select
  const [filtroEscuela, setFiltroEscuela] = useState("todos"); // Valor "todos" para select
  const [filtroFecha, setFiltroFecha] = useState(""); // Fecha en formato YYYY-MM-DD
  const [respuestaSeleccionadaId, setRespuestaSeleccionadaId] = useState(null); // No seleccionar nada al inicio

  // --- Funciones Helper ---
  // Formatear fecha para la UI
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Sin fecha";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha Inválida"; // Usa getTime() para NaN check
      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString("es-CL", options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Fecha Inválida";
    }
  }, []);

  // Determinar si una fecha es "Hoy"
  const isToday = useCallback((dateString) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const today = new Date();
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    } catch (e) {
      return false;
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorLocal(null);
    setErrorGlobal(null);
    try {
      // Realizar todas las llamadas a la API en paralelo
      const [respuestasRes, academicosRes, unidadesRes, cuestionariosRes] =
        await Promise.all([
          respuestasCuestionarioService.getAllRespuestasCuestionario(),
          academicosService.getAllAcademicos(),
          unidadesAcademicasService.getAllUnidadesAcademicas(),
          cuestionariosService.getAllCuestionarios(),
        ]);

      // Procesar datos de académicos: id -> {nombre_completo, ...}
      const newAcademicosMap = academicosRes.reduce((map, acad) => {
        map[acad.id_academico] = {
          ...acad,
          nombre_completo:
            `${acad.nombre} ${acad.a_paterno || ""} ${acad.a_materno || ""}`.trim(),
        };
        return map;
      }, {});
      setAcademicosMap(newAcademicosMap);

      // Procesar datos de unidades: id -> {nombre, ...}
      const newUnidadesMap = unidadesRes.reduce((map, unidad) => {
        map[unidad.id_unidad] = unidad;
        return map;
      }, {});
      setUnidadesMap(newUnidadesMap); // Necesitarás este estado si quieres el nombre de la escuela

      // Procesar preguntas: id -> pregunta (para fácil acceso)
      const newPreguntasMap = cuestionariosRes.reduce((map, q) => {
        map[q.id_cuestionario] = q.pregunta;
        return map;
      }, {});
      setPreguntasData(newPreguntasMap); // Guardar el mapa de preguntas

      // Procesar respuestas: mapear IDs a nombres
      const processedRespuestas = respuestasRes.map((res) => {
        const academico = newAcademicosMap[res.nombre_investigador];

        const unidadAcademica = newUnidadesMap[res.escuela]; // Acceder a la unidad a través del académico

        return {
          id: res.id, // ID de la respuesta
          nombre: academico?.nombre_completo || "Desconocido",
          escuela: unidadAcademica?.nombre || "Desconocida", // Nombre de la unidad/escuela
          fecha: res.fecha_creacion, // Fecha en formato ISO string
          // Mapear respuestas a las preguntas (asumiendo respuesta_1 a respuesta_9)
          respuestas: Object.keys(res)
            .filter((key) => key.startsWith("respuesta_"))
            .map((key) => ({
              numero: parseInt(key.replace("respuesta_", ""), 10),
              texto:
                newPreguntasMap[parseInt(key.replace("respuesta_", ""), 10)] ||
                `Pregunta ${key.replace("respuesta_", "")}`, // Texto de la pregunta
              respuesta: res[key] || "Sin respuesta", // La respuesta dada
            }))
            .sort((a, b) => a.numero - b.numero), // Ordenar por número de pregunta
        };
      });

      setRespuestasData(processedRespuestas);
      if (processedRespuestas.length > 0) {
        setRespuestaSeleccionadaId(processedRespuestas[0].id); // Seleccionar la primera respuesta por defecto
      }
    } catch (err) {
      console.error("Error fetching data for FormulariosPage:", err);
      setErrorGlobal({
        type: "error", // Forzar a tipo error si falló
        title: "Error al cargar los formularios.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Efecto para llamar a fetchData al montar el componente
  useEffect(() => {
    fetchData();
  }, []); // El array vacío asegura que se ejecute una sola vez al montar

  // Opciones únicas para los Selects de filtro (basadas en respuestasData)
  const uniqueAcademicos = [...new Set(respuestasData.map((r) => r.nombre))]
    .filter(Boolean)
    .sort();
  const uniqueEscuelas = [...new Set(respuestasData.map((r) => r.escuela))]
    .filter(Boolean)
    .sort();
  // Las fechas se mostrarán en el filtro de fecha, no en un select.

  // Esta es la versión CORRECTA de la lógica para el filtro
  const respuestasFiltradas = respuestasData.filter((r) => {
    // Ambas variables se definen aquí, en el ámbito de este callback
    const coincideAcademico =
      filtroAcademico === "todos" || r.nombre === filtroAcademico;
    const coincideEscuela =
      filtroEscuela === "todos" || r.escuela === filtroEscuela;
    const coincideFecha =
      !filtroFecha || (r.fecha && r.fecha.startsWith(filtroFecha));

    return coincideAcademico && coincideEscuela && coincideFecha;
  });
  // Si la respuesta seleccionada no está en las filtradas, o no hay nada seleccionado,
  // selecciona la primera de las filtradas (o null si no hay ninguna)
  const respuestaSeleccionada =
    respuestasFiltradas.find((r) => r.id === respuestaSeleccionadaId) ||
    respuestasFiltradas[0] ||
    null; // Si no hay respuestas filtradas, null.

  // Efecto para actualizar `respuestaSeleccionadaId` si la `respuestaSeleccionada` cambia
  // Esto asegura que la selección visual sea correcta después de filtrar.
  useEffect(() => {
    if (
      respuestaSeleccionada &&
      respuestaSeleccionada.id !== respuestaSeleccionadaId
    ) {
      setRespuestaSeleccionadaId(respuestaSeleccionada.id);
    } else if (!respuestaSeleccionada && respuestaSeleccionadaId !== null) {
      setRespuestaSeleccionadaId(null); // Si no hay respuesta seleccionada, resetear el ID.
    }
  }, [respuestaSeleccionada, respuestaSeleccionadaId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título principal */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Formularios</h2>
          <p className="text-gray-600 mt-2">
            Revisa las respuestas de los formularios
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Filtrar por:</span>
              </div>

              {/* Filtro Académico */}
              <div className="relative">
                <Select
                  value={filtroAcademico}
                  onValueChange={setFiltroAcademico}
                >
                  <SelectTrigger className="px-2 w-50 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-48">
                    <SelectValue placeholder="Todos los académicos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los académicos</SelectItem>
                    {uniqueAcademicos.map((nombre) => (
                      <SelectItem key={nombre} value={nombre}>
                        {nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Escuela */}
              <div className="relative">
                <Select value={filtroEscuela} onValueChange={setFiltroEscuela}>
                  <SelectTrigger className="px-2 w-72 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-48">
                    <SelectValue placeholder="Todas las escuelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las escuelas</SelectItem>
                    {uniqueEscuelas.map((escuela) => (
                      <SelectItem key={escuela} value={escuela}>
                        {escuela}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Fecha */}
              <div className="relative">
                <Input
                  type="date"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-48"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setFiltroAcademico("todos");
                  setFiltroEscuela("todos");
                  setFiltroFecha("");
                }}
              >
                Reiniciar filtros
              </Button>
              {/*<Button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Generar PDF</span>
              </Button>*/}
            </div>
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lista de respuestas */}
          <div className="bg-white rounded-lg shadow-lg ">
            <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
              <List className="h-6 w-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Lista de respuestas
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {loading ? ( // Mostrar spinner si está cargando
                <div className="flex justify-center items-center h-48 py-8">
                  <Spinner size={32} className="text-[#2E5C8A]" />
                </div>
              ) : errorLocal ? ( // Mostrar error si hay
                <Alert
                  variant="destructive"
                  className="bg-red-50 text-red-700 mx-4 my-4"
                >
                  <XCircle className="h-5 w-5 mr-4" />
                  <AlertTitle>Error al cargar respuestas</AlertTitle>
                  <AlertDescription>{errorLocal}</AlertDescription>
                </Alert>
              ) : respuestasFiltradas.length === 0 ? ( // Mostrar mensaje si no hay resultados
                <Alert
                  variant="default"
                  className="bg-blue-50 text-blue-700 mx-4 my-4"
                >
                  <Info className="h-5 w-5 mr-4" />
                  <AlertTitle>No hay respuestas</AlertTitle>
                  <AlertDescription>
                    No se encontraron respuestas con los filtros actuales.
                  </AlertDescription>
                </Alert>
              ) : (
                respuestasFiltradas.map((respuesta) => (
                  <div
                    key={respuesta.id}
                    onClick={() => setRespuestaSeleccionadaId(respuesta.id)}
                    className={`p-6 cursor-pointer transition-colors ${
                      respuestaSeleccionadaId === respuesta.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {respuesta.nombre}
                          </h4>
                          {isToday(respuesta.fecha) && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                              Hoy
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <School className="h-4 w-4" />
                            <span>Escuela: {respuesta.escuela}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(respuesta.fecha)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Detalles de la respuesta */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalles de la Respuesta
                </h3>
              </div>
            </div>

            {respuestaSeleccionada && (
              <div className="p-6">
                {/* Información del investigador */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          Investigador:
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {respuestaSeleccionada.nombre}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <School className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          Escuela:
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {respuestaSeleccionada.escuela}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          Fecha:
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatDate(respuestaSeleccionada.fecha)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Respuestas del cuestionario */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <h4 className="text-lg font-semibold text-gray-900">
                      Respuestas del Cuestionario
                    </h4>
                  </div>

                  <div className="space-y-6">
                    {respuestaSeleccionada.respuestas.map((itemRespuesta) => (
                      <div
                        key={itemRespuesta.numero}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="mb-3">
                          <h5 className="font-semibold text-gray-900 mb-2">
                            Pregunta {itemRespuesta.numero}
                          </h5>
                          <p className="text-gray-700 italic">
                            {itemRespuesta.texto}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 italic">
                            {itemRespuesta.respuesta || "Sin respuesta"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
