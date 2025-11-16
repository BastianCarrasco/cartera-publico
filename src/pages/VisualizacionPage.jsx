import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; // Shadcn Badge
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Users,
  Tag,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Calendar,
  Zap,
  FlaskRound,
  Lightbulb,
  XCircle,
  Info,
  Pickaxe,
  Dna,
  BatteryCharging,
  GraduationCap,
  ClipboardList,
  Banknote,
} from "lucide-react";

// Componentes de Shadcn UI para el modal (Dialog)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Spinner } from "@/components/ui/spinner";
import { useError } from "@/contexts/ErrorContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Importar ProjectCard desde su nuevo archivo
import ProjectCard, {
  getStatusBadge,
  getThematicBadge,
  renderInstitucionLogo,
} from "./components/ProjectCard.jsx";

// Import the new API service
import cartera_proyecto from "@/api/EXCEL_QUERIES/cartera_proyecto.js"; // Correct path to your service

// The API URL is now managed within cartera_proyecto.js, so we don't need it here.
// const PROJECTS_API_URL = import.meta.env.VITE_PROJECTS_API_URL; // Remove this line

export default function VisualizacionPage() {
  const [orden, setOrden] = useState("reciente");
  const [projectsData, setProjectsData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [errorLocal, setErrorLocal] = useState(null);
  const { setError: setErrorGlobal } = useError();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitucion, setSelectedInstitucion] = useState("todos");
  const [selectedConvocatoria, setSelectedConvocatoria] = useState("todos");
  const [selectedTematica, setSelectedTematica] = useState("todos");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // **** Estados para el Modal de Detalles ****
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingFotos, setLoadingFotos] = useState(false);

  // Helper para formatear fecha a "31 de diciembre de 2024" para el modal
  const formatDateFull = useCallback((dateString) => {
    if (!dateString) return "Sin fecha";
    // The new API uses "sept-24" format. We need to parse it.
    // This is a simplistic parser, for real-world scenarios, consider a robust date library.
    const monthMap = {
      "ene-": "01",
      "feb-": "02",
      "mar-": "03",
      "abr-": "04",
      "may-": "05",
      "jun-": "06",
      "jul-": "07",
      "ago-": "08",
      "sept-": "09",
      "oct-": "10",
      "nov-": "11",
      "dic-": "12",
    };

    let date = null;
    if (
      dateString.match(
        /^(ene|feb|mar|abr|may|jun|jul|ago|sept|oct|nov|dic)-\d{2}$/i
      )
    ) {
      const [monthStr, yearStr] = dateString.split("-");
      const monthNum = monthMap[monthStr.toLowerCase() + "-"]; // Add '-' back for map key
      if (monthNum) {
        // Assuming current century, adjust if needed for dates before 2000
        const fullYear = parseInt(`20${yearStr}`, 10);
        date = new Date(fullYear, parseInt(monthNum, 10) - 1, 1); // Day 1 of the month
      }
    } else {
      // Fallback for other potential date formats or if it's already a valid date string
      try {
        date = new Date(dateString);
      } catch (e) {
        console.warn("Invalid date string format:", dateString);
        return "Fecha Inválida";
      }
    }

    if (!date || isNaN(date.getTime())) return "Fecha Inválida";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("es-CL", options);
  }, []);

  const handleCardClick = useCallback(async (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    setLoadingFotos(false); // Set to false immediately
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorLocal(null);
    setErrorGlobal(null);

    try {
      // Use the getAllproyectos function from the service
      const result = await cartera_proyecto.getAllproyectos();

      if (!result.ok || !Array.isArray(result.data)) {
        throw new Error("Invalid API response format");
      }

      const projects = result.data.map((item) => {
        // Split academic partners and their photos
        const partnerAcademics = item["Académic@/s-Partner"]
          ? item["Académic@/s-Partner"]
              .split(",")
              .map((name) => name.trim())
              .filter(Boolean)
          : [];

        const partnerPhotos = item.link_foto_partner
          ? item.link_foto_partner
              .split(",")
              .map((link) => link.trim())
              .filter(Boolean)
          : [];

        // Ensure partner names and photos are paired correctly, or use fallback
        const pairedPartners = partnerAcademics.map((name, index) => ({
          name: name,
          photo: partnerPhotos[index] || null, // Use corresponding photo or null
        }));

        return {
          id_proyecto: item._id, // Use _id as unique identifier
          nombre: item["Nombre Proyecto/Perfil Proyecto"],
          tematica: item.Temática,
          estatus: item.Estatus,
          apoyo: item["Tipo Apoyo"],
          detalle_apoyo: item["Detalle Apoyo"],
          monto: item["Monto Proyecto MM$"],
          lider_academico: item["Académic@/s-Líder"],
          partner_academicos: pairedPartners, // Array of { name, photo } objects
          estudiantes: item.Estudiantes, // This is a string now
          unidad: item["Unidad Académica"],
          nombre_convo: item["Nombre Convocatoria a la que se postuló"],
          tipo_convocatoria: item["Tipo Convocatoria"],
          institucion: item["Institucion Convocatoria"],
          fecha_postulacion: item["Fecha Postulación"],
          link_foto_lider: item.link_foto_lider,
        };
      });

      setProjectsData(projects);
    } catch (err) {
      console.error("Error fetching data for VisualizacionPage:", err);
      // Check if err is an AxiosError and extract a more specific message if available
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error desconocido al cargar los proyectos.";
      setErrorLocal(errorMessage);
      setErrorGlobal({
        type: "error",
        title: "Error al cargar los proyectos",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Opciones únicas para los Selects (calculadas a partir de projectsData)
  const uniqueConvocatorias = [
    ...new Set(projectsData.map((p) => p.nombre_convo)),
  ]
    .filter(Boolean)
    .sort();
  const uniqueTematicas = [...new Set(projectsData.map((p) => p.tematica))]
    .filter(Boolean)
    .sort();
  const uniqueInstituciones = [
    ...new Set(projectsData.map((p) => p.institucion)),
  ]
    .filter(Boolean)
    .sort();

  // Lógica para filtrar proyectos según el estatus seleccionado
  const filteredProjects = projectsData.filter((project) => {
    const matchesStatus =
      selectedStatus === "todos" || project.estatus === selectedStatus;
    const matchesSearch =
      searchTerm === "" ||
      project.nombre.toLowerCase().startsWith(searchTerm.toLowerCase());
    const matchesConvocatoria =
      selectedConvocatoria === "todos" ||
      project.nombre_convo === selectedConvocatoria;
    const matchesTematica =
      selectedTematica === "todos" || project.tematica === selectedTematica;
    const matchesInstitucion =
      selectedInstitucion === "todos" ||
      project.institucion === selectedInstitucion;

    return (
      matchesStatus &&
      matchesSearch &&
      matchesConvocatoria &&
      matchesTematica &&
      matchesInstitucion
    );
  });

  // Lógica de ordenamiento
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // We need to parse the "sept-24" format here for sorting
    const parseDateForSort = (dateString) => {
      if (!dateString) return null;
      const monthMapSort = {
        ene: 0,
        feb: 1,
        mar: 2,
        abr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        ago: 7,
        sept: 8,
        oct: 9,
        nov: 10,
        dic: 11,
      };
      const parts = dateString.split("-");
      if (parts.length === 2) {
        const monthIndex = monthMapSort[parts[0].toLowerCase()];
        const year = parseInt(`20${parts[1]}`, 10); // Assuming 21st century
        if (monthIndex !== undefined && !isNaN(year)) {
          return new Date(year, monthIndex, 1); // Use day 1 for consistent comparison
        }
      }
      try {
        return new Date(dateString); // Fallback for other date formats
      } catch (e) {
        return null;
      }
    };

    const dateA = parseDateForSort(a.fecha_postulacion);
    const dateB = parseDateForSort(b.fecha_postulacion);

    if (!dateA && !dateB) return 0;
    if (!dateA) return orden === "reciente" ? 1 : -1;
    if (!dateB) return orden === "reciente" ? -1 : 1;

    if (orden === "reciente") {
      return dateB.getTime() - dateA.getTime();
    } else {
      return dateA.getTime() - dateB.getTime();
    }
  });

  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);

  // Asegurarse de que la página actual no exceda el total de páginas
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Calcular los proyectos de la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = sortedProjects.slice(startIndex, endIndex);

  // Función para cambiar de página
  const handlePageChange = useCallback(
    (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    },
    [totalPages]
  );

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Visualización de Proyectos
          </h1>
          <p className="text-gray-600">
            Explora y gestiona todos tus proyectos de tu organización
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Buscar proyectos..."
                  className="pl-10 bg-gray-50 border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Select
                value={selectedInstitucion}
                onValueChange={setSelectedInstitucion}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Todas las instituciones" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px] overflow-y-auto">
                  <SelectItem value="todos">Todas las instituciones</SelectItem>
                  {uniqueInstituciones.map((institucion) => (
                    <SelectItem key={institucion} value={institucion}>
                      {institucion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={selectedTematica}
                onValueChange={setSelectedTematica}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Todas las temáticas" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px] overflow-y-auto">
                  <SelectItem value="todos">Todas las temáticas</SelectItem>
                  {uniqueTematicas.map((tem) => (
                    <SelectItem key={tem} value={tem}>
                      {tem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* New Select for Convocatoria Name */}
            <div>
              <Select
                value={selectedConvocatoria}
                onValueChange={setSelectedConvocatoria}
              >
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Todas las convocatorias" />
                </SelectTrigger>
                <SelectContent className="max-h-[400px] overflow-y-auto">
                  <SelectItem value="todos">Todas las convocatorias</SelectItem>
                  {uniqueConvocatorias.map((convo) => (
                    <SelectItem key={convo} value={convo}>
                      {convo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={orden} onValueChange={setOrden}>
                <SelectTrigger className="bg-gray-50 border-gray-200">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reciente">
                    <span className="flex items-center gap-2">
                      <ArrowDownWideNarrow className="w-4 h-4" />
                      Más reciente - Descendente
                    </span>
                  </SelectItem>
                  <SelectItem value="antiguo">
                    <span className="flex items-center gap-2">
                      <ArrowUpWideNarrow className="w-4 h-4" />
                      Más antiguo - Ascendente
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs - Ahora manejan el estado de filtro */}
        <Tabs
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          className="mb-6"
        >
          <TabsList className="flex flex-nowrap overflow-hidden bg-white border border-gray-100 rounded-md w-full">
            <TabsTrigger
              value="todos"
              className="text-xs px-1.5 py-1 sm:text-sm sm:px-3 sm:py-2 data-[state=active]:bg-[#2E5C8A] data-[state=active]:text-white"
            >
              Todos ({projectsData.length})
            </TabsTrigger>
            <TabsTrigger
              value="Postulado"
              className="text-xs px-1.5 py-1 sm:text-sm sm:px-3 sm:py-2 data-[state=active]:bg-[#2E5C8A] data-[state=active]:text-white"
            >
              Postulados (
              {projectsData.filter((p) => p.estatus === "Postulado").length})
            </TabsTrigger>
            <TabsTrigger
              value="Adjudicado"
              className="text-xs px-1.5 py-1 sm:text-sm sm:px-3 sm:py-2 data-[state=active]:bg-[#2E5C8A] data-[state=active]:text-white"
            >
              Adjudicados (
              {projectsData.filter((p) => p.estatus === "Adjudicado").length})
            </TabsTrigger>
            <TabsTrigger
              value="Perfil"
              className="text-xs px-1.5 py-1 sm:text-sm sm:px-3 sm:py-2 data-[state=active]:bg-[#2E5C8A] data-[state=active]:text-white"
            >
              Perfil (
              {projectsData.filter((p) => p.estatus === "Perfil").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Projects Grid (Renderizado Condicional) */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size={64} className="text-[#2E5C8A]" />
          </div>
        ) : errorLocal ? (
          <Alert variant="destructive" className="bg-red-50 text-red-700">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Error al cargar proyectos</AlertTitle>
            <AlertDescription>{errorLocal}</AlertDescription>
          </Alert>
        ) : sortedProjects.length === 0 ? (
          <Alert variant="default" className="bg-blue-50 text-blue-700">
            <Info className="h-5 w-5" />
            <AlertTitle>No hay proyectos</AlertTitle>
            <AlertDescription>
              No se encontraron proyectos para mostrar con el filtro actual.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedProjects.map((project) => (
              <ProjectCard
                key={project.id_proyecto}
                project={project}
                // We'll adapt academicosDelProyecto and estudiantesDelProyecto in ProjectCard itself
                // Or, if ProjectCard needs a specific format, we can prepare it here.
                // For now, let's simplify and pass the direct data to ProjectCard.
                // The current ProjectCard relies on these two props, so let's adjust them.
                academicosDelProyecto={{
                  profesores: [
                    project.lider_academico,
                    ...project.partner_academicos.map((p) => p.name),
                  ]
                    .filter(Boolean)
                    .map((name) => ({ nombre_completo: name })),
                }}
                estudiantesDelProyecto={
                  project.estudiantes
                    ? [{ nombre: project.estudiantes, a_paterno: "" }]
                    : []
                }
                onClick={() => handleCardClick(project)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="text-sm text-gray-500">
            Mostrando{" "}
            {/* Si sortedProjects está vacío, el endIndex podría ser negativo o 0 */}
            {Math.min(sortedProjects.length, endIndex)} de{" "}
            {sortedProjects.length} proyectos
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || sortedProjects.length === 0}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(i + 1)}
                className={
                  currentPage === i + 1
                    ? "bg-[#2E5C8A] text-white hover:bg-[#1E4A6F]"
                    : ""
                }
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={
                currentPage === totalPages || sortedProjects.length === 0
              }
            >
              Siguiente
            </Button>
          </div>
        </div>
      </main>

      {/* **** MODAL DE DETALLES DEL PROYECTO **** */}
      {selectedProject && ( // Solo renderiza si hay un proyecto seleccionado
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent
            className="w-full max-w-md md:max-w-4xl rounded-lg p-0"
            style={{
              maxHeight: "auto",
              minHeight: "auto",
              overflowY: "auto",
              marginBottom: "2rem",
            }}
          >
            <DialogHeader>
              <div className="bg-gradient-to-r from-[#275078] to-[#5296de] px-6 py-4 rounded-t-lg">
                <DialogTitle className="text-lg md:text-xl font-bold text-white mb-1 leading-tight">
                  {selectedProject.nombre}
                </DialogTitle>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-s md:text-sm text-white gap-1">
                  <p>
                    <span className="font-semibold">Unidad responsable:</span>{" "}
                    {selectedProject.unidad || "Sin información"}
                  </p>
                  {getStatusBadge(selectedProject.estatus || "Sin información")}
                </div>
              </div>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3 md:gap-4 p-6 md:p-4">
              {/* Columna Izquierda: Detalles e Información de Postulación */}
              <div className="flex flex-col gap-3">
                {/* Detalles del Proyecto */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-[#2E5C8A]" />
                    Detalles del Proyecto
                  </h4>
                  <div className="flex items-center text-s text-gray-700 mb-1">
                    <span className="font-semibold flex-shrink-0 mr-2">
                      Temática:
                    </span>
                    {getThematicBadge(
                      selectedProject.tematica || "Sin información"
                    )}
                  </div>
                  <div className="flex items-center text-s text-gray-700 mb-1">
                    <span className="font-semibold flex-shrink-0 mr-2">
                      Institución:
                    </span>
                    <div className="flex items-center gap-2">
                      <span>
                        {selectedProject.institucion || "Sin información"}
                      </span>
                      {renderInstitucionLogo(selectedProject.institucion || "")}
                    </div>
                  </div>
                  <p className="text-s text-gray-700 mb-1">
                    <span className="font-semibold">Monto solicitado:</span>{" "}
                    {selectedProject.monto !== null &&
                    selectedProject.monto !== undefined
                      ? `$${selectedProject.monto.toLocaleString("es-CL")}`
                      : "Sin información"}
                  </p>
                  <p className="text-s text-gray-700">
                    <span className="font-semibold">Tipo de apoyo:</span>{" "}
                    {selectedProject.apoyo || "Sin información"}{" "}
                    {selectedProject.detalle_apoyo &&
                      `(${selectedProject.detalle_apoyo})`}
                  </p>
                </div>

                {/* Información de Postulación */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#2E5C8A]" /> Información
                    de Registro
                  </h4>
                  <p className="text-s text-gray-700 mb-1">
                    <span className="font-semibold">Fecha de registro:</span>{" "}
                    {formatDateFull(selectedProject.fecha_postulacion)}
                  </p>
                  <p className="text-s text-gray-700">
                    <span className="font-semibold">Convocatoria:</span>{" "}
                    {selectedProject.nombre_convo || "Sin información"}{" "}
                    {selectedProject.tipo_convocatoria &&
                    selectedProject.tipo_convocatoria !== ""
                      ? `(${selectedProject.tipo_convocatoria})`
                      : ""}
                  </p>
                </div>
              </div>
              {/* Columna Derecha: Académicos y Estudiantes Involucrados */}
              <div className="flex flex-col gap-4">
                {" "}
                {/* Contenedor para ambas secciones */}
                {/* Sección de Académicos Involucrados */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#2E5C8A]" />
                    Académicos Involucrados
                  </h4>
                  {loadingFotos ? ( // loadingFotos will be false almost instantly
                    <div className="flex justify-center items-center h-16">
                      <Spinner size={24} className="text-[#2E5C8A]" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-y-2">
                      {selectedProject.lider_academico && (
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              selectedProject.link_foto_lider ||
                              "https://t4.ftcdn.net/jpg/01/86/29/31/360_F_186293166_P4yk3uXQBDapbDFlR17ivpM6B1ux0fHG.jpg"
                            }
                            alt={`Foto de ${
                              selectedProject.lider_academico || "académico"
                            }`}
                            className="w-16 h-16 object-cover rounded-full border border-gray-200 flex-shrink-0"
                          />
                          <p className="text-s font-medium text-gray-800 leading-tight">
                            {selectedProject.lider_academico} (Líder)
                          </p>
                        </div>
                      )}
                      {selectedProject.partner_academicos &&
                        selectedProject.partner_academicos.map(
                          (partner, index) => (
                            <div
                              key={partner.name + index} // Unique key for partners
                              className="flex items-center gap-2"
                            >
                              <img
                                src={
                                  partner.photo ||
                                  "https://t4.ftcdn.net/jpg/01/86/29/31/360_F_186293166_P4yk3uXQBDapbDFlR17ivpM6B1ux0fHG.jpg"
                                }
                                alt={`Foto de ${partner.name || "académico"}`}
                                className="w-16 h-16 object-cover rounded-full border border-gray-200 flex-shrink-0"
                              />
                              <p className="text-s font-medium text-gray-800 leading-tight">
                                {partner.name} (Partner)
                              </p>
                            </div>
                          )
                        )}
                      {!selectedProject.lider_academico &&
                        (!selectedProject.partner_academicos ||
                          selectedProject.partner_academicos.length === 0) && (
                          <p className="text-s text-gray-500 text-center">
                            Sin académicos involucrados.
                          </p>
                        )}
                    </div>
                  )}
                </div>
                {/* Sección de Estudiantes Involucrados (NUEVA) */}
                {selectedProject.estudiantes && ( // Check if the string exists
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#2E5C8A]" />{" "}
                      {/* Icono de estudiante */}
                      Estudiantes Involucrados
                    </h4>
                    <p className="text-s text-gray-800">
                      {selectedProject.estudiantes}
                    </p>
                  </div>
                )}
              </div>{" "}
              {/* Fin de la Columna Derecha */}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
