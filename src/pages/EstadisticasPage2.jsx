// src/pages/EstadisticasPage.jsx - Estructura de className
import { useEffect, useState, useRef } from "react"; // Importa useRef
import Chart from "chart.js/auto"; // Importa Chart.js
import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import logoANID from "../assets/tipos_convocatorias/anid_rojo_azul.png";
import logoSQM from "../assets/instituciones/sqm.png";
import logoCORFO from "../assets/tipos_convocatorias/corfo2024.png";
import logoCODESSER from "../assets/instituciones/logo-codesser2.png";
import logoGOREValpo from "../assets/tipos_convocatorias/gore-valpo.jpg";
import logoLACNIC from "../assets/instituciones/Logo-LACNIC.png";
import logoARMADA from "../assets/instituciones/armadaLogo.png";

// Registra los componentes de Chart.js que usarás
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import cartera_proyecto from "../api/EXCEL_QUERIES/cartera_proyecto"; // Asegúrate de que esta ruta sea correcta
import cartera_graficos from "../api/EXCEL_QUERIES/graficos"; // Asegúrate de que esta ruta sea correcta
// Importa las nuevas funciones de ayuda para gráficos
import {
  generateBarChartDataFromCategorical,
  formatToMillions,
} from "../lib/chartGenerators";

export default function EstadisticasPage2() {
  const logosPorInstrumento = {
    ANID: logoANID,
    SQM: logoSQM,
    CORFO: logoCORFO,
    "CORFO - Magallanes": logoCORFO,
    CODESSER: logoCODESSER,
    "GORE-Valparaíso": logoGOREValpo,
    LACNIC: logoLACNIC,
    "ARMADA DE CHILE": logoARMADA,
  };
  const [loading, setLoading] = useState(true);
  const [errorLocal, setErrorLocal] = useState(null);
  const [analisisData, setAnalisisData] = useState(null); // Para almacenar la respuesta completa del análisis de proyectos
  const [cashData, setCashData] = useState(null); // Para almacenar la respuesta de getCash
  const [proyectosPorProfesorDataRaw, setProyectosPorProfesorDataRaw] =
    useState(null); // Nuevo estado para datos de proyectos por profesor

  const filtrarTop10ConFiltro = (data, campoFiltro, valorSeleccionado) => {
    if (!data || data.length === 0) return [];

    // 1. Ordenar los datos por cantidad (mayor a menor)
    const ordenados = [...data].sort((a, b) => b.cantidad - a.cantidad);

    // 2. Obtener los 10 primeros
    const top10 = ordenados.slice(0, 10);

    // 3. Si NO hay filtro seleccionado, simplemente retorna el top 10
    if (
      !valorSeleccionado ||
      valorSeleccionado.startsWith("Todos") ||
      valorSeleccionado.startsWith("Todas")
    ) {
      return top10;
    }

    // 4. Buscar si el valor filtrado está fuera del top 10
    const itemFiltrado = ordenados.find(
      (item) =>
        item.nombre === valorSeleccionado ||
        item[campoFiltro] === valorSeleccionado
    );

    // 5. Si existe y no está ya en top 10, agrégalo al final
    if (itemFiltrado && !top10.some((i) => i.nombre === itemFiltrado.nombre)) {
      top10.push(itemFiltrado);
    }

    return top10;
  };

  // Estados para los filtros (se inicializan con las opciones "Todas las...")
  const [selectedEscuela, setSelectedEscuela] = useState("Todas las Escuelas");
  const [selectedTematica, setSelectedTematica] = useState(
    "Todas las Temáticas"
  );
  const [selectedInstitucion, setSelectedInstitucion] = useState(
    "Todas las Instituciones"
  );
  const [selectedEstatus, setSelectedEstatus] = useState("Todos los Estatus");

  // Opciones de filtros, ahora dinámicas
  const [opcionesEscuela, setOpcionesEscuela] = useState([
    "Todas las Escuelas",
  ]);
  const [opcionesTematica, setOpcionesTematica] = useState([
    "Todas las Temáticas",
  ]);
  const [opcionesInstitucion, setOpcionesInstitucion] = useState([
    "Todas las Instituciones",
  ]);
  const [opcionesEstatus, setOpcionesEstatus] = useState(["Todos los Estatus"]);

  // Refs para cada canvas de gráfico
  const chartProyectosPorProfesorRef = useRef(null);
  const chartProyectosPorUnidadRef = useRef(null);
  const chartProfesoresPorUnidadRef = useRef(null);
  const chartProyectosPorTematicaRef = useRef(null);
  const chartProyectosPorTipoDeFondoRef = useRef(null);

  const [proyectosPorTematicaDataRaw, setProyectosPorTematicaDataRaw] =
    useState(null);

  const [
    proyectosPorUnidadAcademicaDataRaw,
    setProyectosPorUnidadAcademicaDataRaw,
  ] = useState(null);

  const [unidadAcademicaXProfesorDataRaw, setUnidadAcademicaXProfesorDataRaw] =
    useState(null);

  // --- Hooks para console.log de filtros ---
  useEffect(() => {
    console.log("Filtro de Escuela seleccionado:", selectedEscuela);
    // Aquí iría la lógica para volver a filtrar los datos si es necesario
  }, [selectedEscuela]);

  useEffect(() => {
    console.log("Filtro de Temática seleccionado:", selectedTematica);
  }, [selectedTematica]);

  useEffect(() => {
    console.log("Filtro de Institución seleccionado:", selectedInstitucion);
  }, [selectedInstitucion]);

  useEffect(() => {
    console.log("Filtro de Estatus seleccionado:", selectedEstatus);
  }, [selectedEstatus]);
  // --- Fin Hooks para console.log de filtros ---

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setErrorLocal(null); // Resetear error al iniciar nueva carga

        // --- Fetch de Análisis Completo ---
        const analisisResponse = await cartera_proyecto.getAnalisisCompleto();
        if (analisisResponse.ok) {
          setAnalisisData(analisisResponse);

          // === Actualizar opciones de filtros dinámicamente ===
          if (analisisResponse.unidadesAcademicas?.datos) {
            setOpcionesEscuela([
              "Todas las Escuelas",
              ...analisisResponse.unidadesAcademicas.datos.map((u) => u.nombre),
            ]);
          }
          if (analisisResponse.tematicas?.datos) {
            setOpcionesTematica([
              "Todas las Temáticas",
              ...analisisResponse.tematicas.datos.map((t) => t.nombre),
            ]);
          }
          if (analisisResponse.institucionConvocatoria?.datos) {
            setOpcionesInstitucion([
              "Todas las Instituciones",
              ...analisisResponse.institucionConvocatoria.datos.map(
                (i) => i.nombre
              ),
            ]);
          }
          if (analisisResponse.estatus?.datos) {
            setOpcionesEstatus([
              "Todos los Estatus",
              ...analisisResponse.estatus.datos.map((e) => e.nombre),
            ]);
          }
          // ===================================================
        } else {
          throw new Error(
            analisisResponse.message ||
              "Error desconocido al cargar el análisis de proyectos."
          );
        }

        // --- Fetch de Datos de Cash (Monto) ---
        const cashResponse = await cartera_graficos.getCash();
        if (cashResponse.ok) {
          setCashData(cashResponse);
        } else {
          throw new Error(
            cashResponse.message ||
              "Error desconocido al cargar los datos de monto."
          );
        }

        // --- Fetch de Proyectos por Profesor ---
        const proyectosPorProfesorResponse =
          await cartera_graficos.getProyectosXProfesor();
        if (proyectosPorProfesorResponse.ok) {
          setProyectosPorProfesorDataRaw(proyectosPorProfesorResponse.datos);
        } else {
          throw new Error(
            proyectosPorProfesorResponse.message ||
              "Error desconocido al cargar proyectos por profesor."
          );
        }
        // --- Fetch de Proyectos por Temática ---
        const proyectosPorTematicaResponse =
          await cartera_graficos.getProyectosXTematica();
        if (proyectosPorTematicaResponse.ok) {
          setProyectosPorTematicaDataRaw(proyectosPorTematicaResponse.datos);
        } else {
          throw new Error(
            proyectosPorTematicaResponse.message ||
              "Error desconocido al cargar proyectos por temática."
          );
        }

        // --- Fetch de Proyectos por Unidad Académica ---
        const proyectosPorUnidadAcademicaResponse =
          await cartera_graficos.getProyectosXUnidadAcademica();
        if (proyectosPorUnidadAcademicaResponse.ok) {
          setProyectosPorUnidadAcademicaDataRaw(
            proyectosPorUnidadAcademicaResponse.datos
          );
        } else {
          throw new Error(
            proyectosPorUnidadAcademicaResponse.message ||
              "Error desconocido al cargar proyectos por unidad académica."
          );
        }

        // --- Fetch de Unidad Académica por Profesor ---
        const unidadAcademicaXProfesorResponse =
          await cartera_graficos.getUnidadAcademicaXProfesor();
        if (unidadAcademicaXProfesorResponse.ok) {
          setUnidadAcademicaXProfesorDataRaw(
            unidadAcademicaXProfesorResponse.datos
          );
        } else {
          throw new Error(
            unidadAcademicaXProfesorResponse.message ||
              "Error desconocido al cargar unidad académica por profesor."
          );
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setErrorLocal(
          error.message ||
            "No se pudieron cargar todos los datos. Inténtalo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []); // El array vacío asegura que se ejecute una sola vez al montar el componente

  // Datos extraídos o mapeados de analisisData y cashData para la UI
  const proyectosEnCartera = analisisData?.totalProyectos ?? 0;
  const montoFormulado = cashData?.sumaMontoProyectos
    ? formatToMillions(cashData.sumaMontoProyectos)
    : "0 MM$";
  const escuelasFIN =
    analisisData?.unidadesAcademicas?.totalUnidadesDistintas ?? 0;
  const academicosInvolucrados =
    analisisData?.academicos?.totalAcademicosUnicos ?? 0;

  const tematicasDestacadas =
    analisisData?.tematicas?.datos?.map((t) => t.nombre) || [];

  const instrumentosPostulados =
    cashData?.montoPorInstitucion?.datos?.map((inst) => ({
      name: inst.institucion,
      montoFormatted: formatToMillions(inst.monto),
    })) || [];

  const resetFilters = () => {
    setSelectedEscuela("Todas las Escuelas");
    setSelectedTematica("Todas las Temáticas");
    setSelectedInstitucion("Todas las Instituciones");
    setSelectedEstatus("Todos los Estatus");
    // Lógica para aplicar los filtros o recargar datos si es necesario
  };

  // --- Generación de datos para gráficos ---
  // 1. Proyectos por Profesor
  const proyectosPorProfesorFiltrados = proyectosPorProfesorDataRaw
    ? filtrarTop10ConFiltro(
        proyectosPorProfesorDataRaw,
        "nombre",
        selectedEscuela // o el filtro que más se relacione
      )
    : [];
  const proyectosPorProfesorChartData = proyectosPorProfesorFiltrados.length
    ? generateBarChartDataFromCategorical(
        proyectosPorProfesorFiltrados,
        "Proyectos",
        "Proyectos por Profesor",
        "x"
      )
    : { data: { labels: [], datasets: [] }, options: {} };

  // 2. Proyectos por Unidad Académica

  const proyectosPorUnidadAcademicaData = proyectosPorUnidadAcademicaDataRaw
    ? generateBarChartDataFromCategorical(
        proyectosPorUnidadAcademicaDataRaw,
        "Proyectos",
        "Proyectos por Unidad Académica",
        "y"
      )
    : { data: { labels: [], datasets: [] }, options: {} };

  // 3. Profesores por Unidad Académica (usando unidadAcademicaXProfesorDataRaw transformado)
  const profesoresPorUnidadData = unidadAcademicaXProfesorDataRaw
    ? generateBarChartDataFromCategorical(
        unidadAcademicaXProfesorDataRaw.map((item) => ({
          nombre: item.unidad,
          cantidad: item.totalProfesoresUnicos,
        })),
        "Profesores",
        "Profesores por Unidad Académica",
        "y"
      )
    : { data: { labels: [], datasets: [] }, options: {} };

  // 4. Proyectos por Temática

  const proyectosPorTematicaDataRawFiltered = proyectosPorTematicaDataRaw
    ? filtrarTop10ConFiltro(
        proyectosPorTematicaDataRaw,
        "nombre",
        selectedTematica // o el filtro que más se relacione
      )
    : [];

  const proyectosPorTematicaData = proyectosPorTematicaDataRawFiltered.length
    ? generateBarChartDataFromCategorical(
        proyectosPorTematicaDataRawFiltered,
        "Proyectos",
        "Proyectos por Temática",
        "x"
      )
    : { data: { labels: [], datasets: [] }, options: {} };

  // 5. Proyectos por Tipo de Fondo (usando Institución de Convocatoria como proxy)
  const proyectosPorTipoDeFondoData = analisisData?.institucionConvocatoria
    ?.datos
    ? generateBarChartDataFromCategorical(
        analisisData.institucionConvocatoria.datos,
        "Proyectos",
        "Proyectos por Tipo de Fondo (Institución)",
        "y"
      )
    : { data: { labels: [], datasets: [] }, options: {} };

  // --- USE EFFECTS PARA RENDERIZAR GRÁFICOS ---
  // Cada useEffect se encargará de un gráfico específico
  const createChart = (chartRef, chartConfig) => {
    if (chartRef.current && chartConfig.data.labels.length > 0) {
      // Destruir el gráfico anterior si existe
      if (chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
      // Crear un nuevo gráfico
      chartRef.current.chartInstance = new Chart(chartRef.current, {
        type: "bar", // Tipo de gráfico: barras
        data: chartConfig.data,
        options: chartConfig.options,
      });
    } else if (chartRef.current && chartRef.current.chartInstance) {
      // Si no hay datos, destruir el gráfico existente
      chartRef.current.chartInstance.destroy();
      chartRef.current.chartInstance = null;
    }
  };

  useEffect(() => {
    createChart(chartProyectosPorProfesorRef, proyectosPorProfesorChartData);
  }, [proyectosPorProfesorChartData]); // Re-renderizar cuando los datos cambien

  useEffect(() => {
    createChart(chartProyectosPorUnidadRef, proyectosPorUnidadAcademicaData);
  }, [proyectosPorUnidadAcademicaData]);

  useEffect(() => {
    createChart(chartProfesoresPorUnidadRef, profesoresPorUnidadData);
  }, [profesoresPorUnidadData]);

  useEffect(() => {
    createChart(chartProyectosPorTematicaRef, proyectosPorTematicaData);
  }, [proyectosPorTematicaData]);

  useEffect(() => {
    createChart(chartProyectosPorTipoDeFondoRef, proyectosPorTipoDeFondoData);
  }, [proyectosPorTipoDeFondoData]);
  // --- FIN USE EFFECTS PARA RENDERIZAR GRÁFICOS ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div
          className="animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] w-12 h-12 text-blue-500"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Cargando...
          </span>
        </div>
        <p className="ml-2 text-gray-700">Cargando estadísticas...</p>
      </div>
    );
  }

  if (errorLocal) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div
          role="alert"
          className="relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-red-50 text-red-700"
        >
          <h5 className="mb-1 font-medium leading-none tracking-tight">
            Error al cargar
          </h5>
          <div className="text-sm [&_p]:leading-relaxed">{errorLocal}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Título principal */}
        <div className="mb-2">
          <h2 className="text-3xl font-bold text-gray-900">Estadísticas</h2>
          <p className="text-gray-600">
            Datos para la toma de decisiones estratégicas
          </p>
        </div>

        {/* Botón de Exportar a PDF */}
        <div className="flex justify-end">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Exportar a PDF
          </button>
        </div>

        {/* Filtros */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="escuela"
              >
                Escuela
              </label>
              <select
                id="escuela"
                value={selectedEscuela}
                onChange={(e) => setSelectedEscuela(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {opcionesEscuela.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="tematica"
              >
                Temática
              </label>
              <select
                id="tematica"
                value={selectedTematica}
                onChange={(e) => setSelectedTematica(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {opcionesTematica.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="institucion"
              >
                Institución
              </label>
              <select
                id="institucion"
                value={selectedInstitucion}
                onChange={(e) => setSelectedInstitucion(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {opcionesInstitucion.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="estatus"
              >
                Estatus
              </label>
              <select
                id="estatus"
                value={selectedEstatus}
                onChange={(e) => setSelectedEstatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {opcionesEstatus.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              Resetear Filtros
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr_2fr] gap-8 mb-8">
          {/* COLUMNA 1: Indicadores y Resúmenes */}
          <div className="space-y-8">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">
                Indicadores Principales
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#2E5C8A]">
                    {proyectosEnCartera}
                  </span>
                  <span className="text-sm text-gray-600">
                    Proyectos en Cartera
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#2E5C8A]">
                    {montoFormulado}
                  </span>
                  <span className="text-sm text-gray-600">Monto Formulado</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#2E5C8A]">
                    {escuelasFIN}
                  </span>
                  <span className="text-sm text-gray-600">Escuelas FIN</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-[#2E5C8A]">
                    {academicosInvolucrados}
                  </span>
                  <span className="text-sm text-gray-600">
                    Académicos Involucrados
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">
                Temáticas Destacadas
              </h3>
              <ul className="space-y-2">
                {tematicasDestacadas.length > 0 ? (
                  tematicasDestacadas.slice(0, 6).map((tematica, index) => (
                    <li
                      key={tematica}
                      className="flex items-center text-gray-700"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          ["bg-blue-500", "bg-green-500", "bg-yellow-500"][
                            index % 3
                          ]
                        } mr-2`}
                      ></span>
                      {tematica}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">
                    No hay temáticas destacadas.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">
                Instrumentos Postulados
              </h3>
              <ul style={{ textAlign: "center" }} className="space-y-2">
                {(() => {
                  const instrumentosValidos = instrumentosPostulados.filter(
                    (inst) => inst.name !== "Sin Institución"
                  );

                  return instrumentosValidos.length > 0 ? (
                    instrumentosValidos.map((instrumento) => (
                      <li
                        key={instrumento.name}
                        className="flex flex-col text-gray-700 border-b border-gray-100 pb-2 last:border-0"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={
                              logosPorInstrumento[instrumento.name] ||
                              "logoDefault"
                            }
                            alt={instrumento.name}
                            className="w-5 h-5 object-contain"
                          />
                          <span className="font-medium">
                            {instrumento.name}
                          </span>
                        </div>
                        <span className="ml-7 text-[#2E5C8A] font-semibold">
                          {instrumento.montoFormatted}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">
                      No hay instrumentos postulados.
                    </li>
                  );
                })()}
              </ul>
            </div>
          </div>

          {/* COLUMNA 2: Gráficos de Barras */}
          <div className="space-y-8">
            {/* Gráfico de Proyectos por Profesor */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 h-[400px] flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">
                Top 10 Proyectos por Profesor
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Cantidad de proyectos en los que ha participado cada profesor.
              </p>
              <p className="text-xs text-blue-700 italic mb-4">
                Insight: Identificar a los profesores más activos.
              </p>
              <div className="flex-grow flex items-center justify-center">
                <div className="w-full h-full">
                  {/* Canvas para el gráfico de Proyectos por Profesor */}
                  {proyectosPorProfesorChartData.data.labels.length > 0 ? (
                    <canvas ref={chartProyectosPorProfesorRef}></canvas>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-md text-center text-gray-500">
                      No hay datos de Proyectos por Profesor.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gráfico de Proyectos por Unidad Académica */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 h-[400px] flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">
                Top 10 Proyectos por Unidad Académica
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Número total de proyectos por cada unidad académica.
              </p>
              <p className="text-xs text-blue-700 italic mb-4">
                Insight: Identificar qué unidades son más productivas.
              </p>
              <div className="flex-grow flex items-center justify-center">
                <div className="w-full h-full">
                  {proyectosPorUnidadAcademicaData.data.labels.length > 0 ? (
                    <canvas ref={chartProyectosPorUnidadRef}></canvas>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-md text-center text-gray-500">
                      No hay datos de Proyectos por Unidad Académica.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gráfico de Profesores por Unidad Académica */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 h-[400px] flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">
                Top 10 Profesores por Unidad Académica
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Cantidad de profesores agrupados por unidad académica.
              </p>
              <p className="text-xs text-blue-700 italic mb-4">
                Insight: Mostrar la distribución de los académicos.
              </p>
              <div className="flex-grow flex items-center justify-center">
                <div className="w-full h-full">
                  {profesoresPorUnidadData.data.labels.length > 0 ? (
                    <canvas ref={chartProfesoresPorUnidadRef}></canvas>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-md text-center text-gray-500">
                      No hay datos de Profesores por Unidad Académica.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA 3: Gráficos de Barras (Temática y Tipo de Fondo) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Gráfico de Proyectos por Temática */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 h-[400px] flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">
                Top 10 Proyectos por Temática
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Distribución de los proyectos según su área temática principal.
              </p>
              <p className="text-xs text-blue-700 italic mb-4">
                Insight: Identificar las temáticas más prevalentes.
              </p>
              <div className="flex-grow flex items-center justify-center">
                <div className="w-full h-full">
                  {proyectosPorTematicaData.data.labels.length > 0 ? (
                    <canvas ref={chartProyectosPorTematicaRef}></canvas>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-md text-center text-gray-500">
                      No hay datos de Proyectos por Temática.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gráfico de Proyectos por Tipo de Fondo */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 h-[400px] flex flex-col">
              <h3 className="text-xl font-semibold text-gray-900">
                Proyectos por Tipo de Fondo
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Cantidad de proyectos según la institución o instrumento de
                financiamiento.
              </p>
              <p className="text-xs text-blue-700 italic mb-4">
                Insight: Entender qué instrumentos son más utilizados.
              </p>
              <div className="flex-grow flex items-center justify-center">
                <div className="w-full h-full">
                  {proyectosPorTipoDeFondoData.data.labels.length > 0 ? (
                    <canvas ref={chartProyectosPorTipoDeFondoRef}></canvas>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-md text-center text-gray-500">
                      No hay datos de Proyectos por Tipo de Fondo.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
