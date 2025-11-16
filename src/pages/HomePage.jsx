// src/pages/HomePage.jsx
import { Button } from "@/components/ui/button";
import funcionesService from "../api/funciones.js";
import estudiantesService from "../api/estudiantes.js";
import FondosActivosSection from "../pages/components/FondosActivosSection"; // Asegúrate de esta ruta
import estadisticasService from "../api/estadisticas.js";
import { useState, useEffect } from "react";
import cartera_proyecto from "@/api/EXCEL_QUERIES/cartera_proyecto.js"; // Correct path to your service

import { useProyectos } from "@/contexts/ProyectosContext";

// **** Importa tu componente Spinner específico para esta página ****
import { Spinner } from "@/components/ui/spinner";

import {
  BarChart3,
  FolderPlus,
  PenTool,
  Plus,
  ArrowRight,
  ContactRound,
  CircleDollarSign,
  FolderOpen,
  FolderCheck,
  FileDown,
  Copy,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useError } from "@/contexts/ErrorContext";
import { useExportData } from "@/hooks/useExportDataCartera";

// Importa los iconos de los archivos si los vas a seguir usando así
import pdfIcon from "../assets/icons/file-pdf-regular.svg";
import excelIcon from "../assets/icons/excel2-svgrepo-com.svg";

const FORMULARIO_PERFIL_URL =
  "https://formularioproyectos-production.up.railway.app/";

export default function HomePage() {
  const { proyectosContexto, setProyectosContexto } = useProyectos();

  const navigate = useNavigate();
  // Puedes mantener estas para otros usos, pero las stats rápidas se obtendrán de getAnalisisCompleto
  const [proyectosCrudosData, setProyectosCrudosData] = useState([]);
  const [proyectosProfesorData, setProyectosProfesorData] = useState([]);
  const [loadingQuickStats, setLoadingQuickStats] = useState(true);
  const { setError } = useError();

  const [copiedMessage, setCopiedMessage] = useState(false);

  const { loadingExportPDF, loadingExportExcel, generarPDF, generarExcel } =
    useExportData();

  // Estados específicos para las estadísticas rápidas, ahora derivados de getAnalisisCompleto
  const [totalProyectosCount, setTotalProyectosCount] = useState(0);
  const [postuladosCount, setPostuladosCount] = useState(0);
  const [perfiladosCount, setPerfiladosCount] = useState(0);

  const fetchData = async () => {
    setLoadingQuickStats(true);
    setError(null);
    try {
      const [
        projectsResponse,
        academicosResponse,
        profProjectsResponse, // No se usa directamente en el contexto del proyecto
        analisisCompletoResponse, // Nueva respuesta para getAnalisisCompleto
      ] = await Promise.all([
        funcionesService.getDataInterseccionProyectos(),
        funcionesService.getAcademicosPorProyecto(),
        estadisticasService.getAcademicosPorUnidad(), // Esto es para estadisticas, no para proyectosContexto
        cartera_proyecto.getAnalisisCompleto(), // ¡CORRECCIÓN AQUÍ!
      ]);

      const projects = Array.isArray(projectsResponse) ? projectsResponse : [];
      const academicosPorProyecto = Array.isArray(academicosResponse)
        ? academicosResponse
        : [];

      // *** Procesar datos de Analisis Completo para las Quick Stats ***
      if (analisisCompletoResponse && analisisCompletoResponse.ok) {
        setTotalProyectosCount(analisisCompletoResponse.totalProyectos);

        const estatusData = analisisCompletoResponse.estatus.datos;
        const postulados = estatusData.find(
          (s) => s.nombre === "Postulado"
        )?.cantidad;
        const perfil = estatusData.find((s) => s.nombre === "Perfil")?.cantidad; // Asumiendo que 'Perfil' es el nombre para proyectos perfilados

        setPostuladosCount(postulados || 0);
        setPerfiladosCount(perfil || 0); // Establece el conteo de perfilados
      }
      // *** Fin Procesamiento Analisis Completo ***

      const newAcademicosMap = academicosPorProyecto.reduce((map, item) => {
        map[item.id_proyecto] = item;
        return map;
      }, {});

      // *** Parte nueva para estudiantes ***
      // Recolectar todas las promesas para obtener estudiantes por proyecto
      const estudiantesPromises = projects.map(async (project) => {
        try {
          const estudiantes =
            await estudiantesService.getEstudiantesPorProyecto(
              project.id_proyecto
            );
          return { id_proyecto: project.id_proyecto, estudiantes };
        } catch (e) {
          console.error(
            `Error al obtener estudiantes para proyecto ${project.id_proyecto}:`,
            e
          );
          return { id_proyecto: project.id_proyecto, estudiantes: [] }; // Retorna array vacío en caso de error
        }
      });

      // Esperar a que todas las promesas de estudiantes se resuelvan
      const estudiantesResponses = await Promise.all(estudiantesPromises);

      // Crear un mapa de estudiantes por proyecto
      const newEstudiantesMap = estudiantesResponses.reduce((map, item) => {
        map[item.id_proyecto] = item.estudiantes;
        return map;
      }, {});
      // *** Fin parte nueva para estudiantes ***

      // Combinar proyectos con académicos y ahora también con estudiantes
      const projectsWithAcademicosAndEstudiantes = projects.map((project) => ({
        ...project,
        academicos: newAcademicosMap[project.id_proyecto]?.profesores || [],
        estudiantes: newEstudiantesMap[project.id_proyecto] || [], // Añadir estudiantes
      }));

      setProyectosContexto(projectsWithAcademicosAndEstudiantes);

      // Los `proyectosCrudosData` y `proyectosProfesorData` todavía se setean
      // para los Quick Stats y otros usos directos en HomePage.
      setProyectosCrudosData(projects);
      setProyectosProfesorData(
        Array.isArray(profProjectsResponse) ? profProjectsResponse : []
      );
    } catch (e) {
      console.error("Error fetching data for dashboard summary:", e);
      setError(e.message || "Error desconocido al cargar los datos.");
    } finally {
      setLoadingQuickStats(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log("proyectosContexto actualizado:", proyectosContexto);
  }, [proyectosContexto]);

  const handleCopyLinkFormulario = async () => {
    try {
      await navigator.clipboard.writeText(FORMULARIO_PERFIL_URL);
      setCopiedMessage(true); // Activa el mensaje de copiado
      setError({
        type: "success",
        title: "Enlace copiado!",
        description: "El enlace al formulario ha sido copiado al portapapeles.",
      });
      setTimeout(() => {
        setCopiedMessage(false); // Oculta el mensaje después de un tiempo
        setError(null); // Limpia el error global si lo usaste solo para esto
      }, 3000); // Mensaje visible por 3 segundos
    } catch (err) {
      console.error("Error al copiar el enlace:", err);
      setError({
        type: "error",
        title: "Error al Copiar",
        description: "No se pudo copiar el enlace al portapapeles.",
      });
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section y Botones de Exportar */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Centro de Control de Proyectos
            </h1>
            <p className="text-gray-600">
              Gestiona y monitorea todos tus proyectos desde un solo lugar
            </p>
          </div>
        </div>

        {/* Quick Stats - Los divs que contendrán los spinners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta de Total Proyectos */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Proyectos
                </p>
                {loadingQuickStats ? (
                  <div className="flex justify-center items-center h-8">
                    <Spinner size={24} className="text-[#2E5C8A]" />
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {totalProyectosCount}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-[#2E5C8A]" />
              </div>
            </div>
          </div>

          {/* Tarjeta de Postulados */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Proyectos Postulados
                </p>
                {loadingQuickStats ? (
                  <div className="flex justify-center items-center h-8">
                    <Spinner size={24} className="text-green-600" />
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {postuladosCount}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FolderCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Tarjeta de Perfilados */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 ">
                  Proyectos Perfilados
                </p>
                {loadingQuickStats ? (
                  <div className="flex justify-center items-center h-8">
                    <Spinner size={24} className="text-purple-600" />
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {perfiladosCount}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ContactRound className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Areas (Se mantienen igual) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Primary Actions */}
          <div className="lg:col-span-2 space-y-6 h-full">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 ">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                ¿Qué quieres hacer hoy?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  className="h-20 bg-gradient-to-r from-[#2463a2] to-[#669dd8] text-white justify-start p-6 group transition-transform hover:scale-[1.02] cursor-pointer"
                  size="lg"
                  onClick={() => navigate("/visualizacion")}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors">
                      <FolderPlus className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Ver Proyectos</div>
                      <div className="text-sm opacity-90">
                        Gestiona tu cartera
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  className="h-20 bg-gradient-to-r from-[#2463a2] to-[#669dd8] text-white justify-start p-6 group transition-transform hover:scale-[1.02] cursor-pointer"
                  size="lg"
                  onClick={() => navigate("/fondos")}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors">
                      <CircleDollarSign className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Ver Fondos</div>
                      <div className="text-sm opacity-90">
                        Revisa los instrumentos
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  className="h-20 bg-gradient-to-r from-[#2463a2] to-[#669dd8] text-white justify-start p-6 group transition-transform hover:scale-[1.02] cursor-pointer"
                  size="lg"
                  onClick={() => navigate("/estadisticas")}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Ver Estadísticas</div>
                      <div className="text-sm opacity-90">Analiza métricas</div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 ">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                ¿Quieres ir a otro lado?
              </h2>
              {/* NUEVO BOTÓN PARA EL FORMULARIO DE PERFIL DE PROYECTO */}
              <div className="relative">
                <Button
                  variant="outline"
                  className="h-20 bg-gradient-to-r text-gray-800 justify-start p-6 group transition-transform hover:scale-[1.02] cursor-pointer w-full"
                  size="lg"
                  onClick={() => window.open(FORMULARIO_PERFIL_URL, "_blank")} // Abre en nueva pestaña
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors">
                      <FileDown className="w-12 h-12" />{" "}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-lg">
                        Formulario Perfil de Proyecto
                      </div>
                      <div className="text-s">Completa un nuevo perfil</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="secondary" // Puedes usar "ghost" o "link" si prefieres algo menos intrusivo
                  className="absolute inset-y-0 right-0 h-full w-[60px] flex items-center justify-center rounded-l-none rounded-r-xl bg-gray-400 hover:bg-gray-500 text-white transition-colors p-0"
                  onClick={handleCopyLinkFormulario}
                  title="Copiar enlace del formulario"
                >
                  <div className="flex cursor-pointer flex-col items-center">
                    <Copy className="h-5 w-5" />
                    <span>Copiar</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Secondary Info */}
          <div className="space-y-6">
            {/* Fondos Activos */}
            <FondosActivosSection />
          </div>
        </div>
      </main>
    </div>
  );
}
