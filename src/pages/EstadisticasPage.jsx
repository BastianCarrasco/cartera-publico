// src/pages/EstadisticasPage.jsx
import { useRef } from "react";
// UI components
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle } from "lucide-react";

// Custom hooks
import { useDashboardData } from "../components/ui/dashboard/hooks/useDashboardData";
import { useDashboardFilters } from "../components/ui/dashboard/hooks/useDashboardFilters";
import { useChartData } from "../components/ui/dashboard/hooks/useChartData";

// Dashboard specific components
import { DashboardFilters } from "../components/ui/dashboard/DashboardFilters";
import { KeyIndicators } from "../components/ui/dashboard/KeyIndicators";
import { FeaturedTopicsCard } from "../components/ui/dashboard/FeaturedTopicsCard";
import { PostedInstrumentsCard } from "../components/ui/dashboard/PostedInstrumentsCard";
import { DashboardBarChart } from "../components/ui/dashboard/DashboardBarChart";
import { ExportPdfButton } from "../components/ui/dashboard/ExportPdfButton";

export default function EstadisticasPage() {
  const estadisticasContentRef = useRef(null);

  // 1. Carga inicial de datos
  const {
    proyectosData,
    profesoresPorUnidadData,
    proyectosPorProfesorData,
    loading,
    errorLocal,
    setErrorLocal, // Pasarlo al botón de exportar
  } = useDashboardData();

  // 2. Lógica de filtros y preparación de datos compactos/indicadores
  const {
    selectedEscuela,
    setSelectedEscuela,
    opcionesEscuela,
    selectedTematica,
    setSelectedTematica,
    opcionesTematica,
    selectedInstitucion,
    setSelectedInstitucion,
    opcionesInstitucion,
    selectedEstatus,
    setSelectedEstatus,
    opcionesEstatus,
    resetFilters,
    filteredProyectos,
    filteredProfesoresPorUnidad,
    filteredProyectosPorProfesor,
    indicadoresPrincipales,
    tematicasDestacadas,
    instrumentosPostulados,
    allInstrumentosForPdf,
  } = useDashboardFilters(
    proyectosData,
    profesoresPorUnidadData,
    proyectosPorProfesorData
  );

  // 3. Preparación de datos y opciones para Chart.js
  const {
    dataChartProyectosPorProfesor,
    optionsChartProyectosPorProfesor,
    filteredProyectosPorUnidad, // Necesario para el PDF y para el hasData del chart
    dataChartProyectosPorUnidad,
    optionsChartProyectosPorUnidad,
    chartProfesoresPorUnidadData,
    optionsChartProfesoresPorUnidad,
    filteredProyectosPorTematica, // Necesario para el PDF y para el hasData del chart
    dataChartProyectosPorTematica,
    optionsChartProyectosPorTematica,
    filteredProyectosPorInstitucion, // Necesario para el PDF y para el hasData del chart
    dataChartProyectosPorInstitucion,
    optionsChartProyectosPorInstitucion,
  } = useChartData(
    filteredProyectos,
    filteredProfesoresPorUnidad,
    filteredProyectosPorProfesor
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
        <Spinner size={64} className="text-[#2E5C8A] mb-4" />
        <p className="text-lg text-gray-600">
          Cargando datos del dashboard... Por favor, espere.
        </p>
      </div>
    );
  }

  if (errorLocal) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <Alert variant="destructive" className="bg-red-50 text-red-700">
          <XCircle className="h-5 w-5 mr-4" />
          <AlertTitle>Error al cargar las estadísticas</AlertTitle>
          <AlertDescription>{errorLocal}</AlertDescription>
        </Alert>
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
          <ExportPdfButton
            estadisticasContentRef={estadisticasContentRef}
            filteredProyectosPorProfesor={filteredProyectosPorProfesor}
            filteredProyectosPorUnidad={filteredProyectosPorUnidad}
            filteredProfesoresPorUnidad={filteredProfesoresPorUnidad}
            filteredProyectosPorTematica={filteredProyectosPorTematica}
            filteredProyectosPorInstitucion={filteredProyectosPorInstitucion}
            allInstrumentosForPdf={allInstrumentosForPdf}
            setErrorLocal={setErrorLocal} // Pasa el setter de error si la exportación falla
          />
        </div>

        {/* Filtros */}
        <DashboardFilters
          selectedEscuela={selectedEscuela}
          setSelectedEscuela={setSelectedEscuela}
          opcionesEscuela={opcionesEscuela}
          selectedTematica={selectedTematica}
          setSelectedTematica={setSelectedTematica}
          opcionesTematica={opcionesTematica}
          selectedInstitucion={selectedInstitucion}
          setSelectedInstitucion={setSelectedInstitucion}
          opcionesInstitucion={opcionesInstitucion}
          selectedEstatus={selectedEstatus}
          setSelectedEstatus={setSelectedEstatus}
          opcionesEstatus={opcionesEstatus}
          resetFilters={resetFilters}
        />

        <div
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr_2fr] gap-8 mb-8"
          ref={estadisticasContentRef}
        >
          {/* COLUMNA 1: Indicadores y Resúmenes */}
          <div className="space-y-8">
            <KeyIndicators indicadores={indicadoresPrincipales} />
            <FeaturedTopicsCard tematicasDestacadas={tematicasDestacadas} />
            <PostedInstrumentsCard
              instrumentosPostulados={instrumentosPostulados}
            />
          </div>

          {/* COLUMNA 2: Gráficos de Barras (Proyectos por Profesor, Proyectos por Unidad, Profesores por Unidad) */}
          <div className="space-y-8">
            <DashboardBarChart
              title="Proyectos por Profesor"
              description="Cantidad de proyectos en los que ha participado cada profesor."
              insight="Identificar a los profesores más activos o con mayor participación en proyectos."
              data={dataChartProyectosPorProfesor}
              options={optionsChartProyectosPorProfesor}
              hasData={filteredProyectosPorProfesor.length > 0}
            />
            <DashboardBarChart
              title="Proyectos por Unidad Académica"
              description="Número total de proyectos por cada unidad académica."
              insight="Identificar qué unidades son más productivas en términos de proyectos."
              data={dataChartProyectosPorUnidad}
              options={optionsChartProyectosPorUnidad}
              hasData={filteredProyectosPorUnidad.length > 0}
            />
            <DashboardBarChart
              title="Profesores por Unidad Académica"
              description="Cantidad de profesores agrupados por unidad académica."
              insight="Mostrar la distribución de los académicos en las diferentes unidades."
              data={chartProfesoresPorUnidadData}
              options={optionsChartProfesoresPorUnidad}
              hasData={filteredProfesoresPorUnidad.length > 0}
            />
          </div>

          {/* COLUMNA 3: Gráficos de Barras (Proyectos por Temática, Proyectos por Tipo de Fondo) */}
          <div className="lg:col-span-1 space-y-8">
            <DashboardBarChart
              title="Proyectos por Temática"
              description="Distribución de los proyectos según su área temática principal."
              insight="Identificar las temáticas más prevalentes o con mayor inversión/actividad."
              data={dataChartProyectosPorTematica}
              options={optionsChartProyectosPorTematica}
              hasData={filteredProyectosPorTematica.length > 0}
            />
            <DashboardBarChart
              title="Proyectos por Tipo de Fondo"
              description="Cantidad de proyectos según la institución o instrumento de financiamiento."
              insight="Entender qué instrumentos son más utilizados."
              data={dataChartProyectosPorInstitucion}
              options={optionsChartProyectosPorInstitucion}
              hasData={filteredProyectosPorInstitucion.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
