// src/components/dashboard/hooks/useDashboardFilters.js
import { useState, useEffect, useMemo, useCallback } from "react";
import cartera_graficos from "../../../../api/EXCEL_QUERIES/graficos";

const formatMM = (monto) => {
  if (monto === null || monto === undefined || isNaN(monto)) return "0 MM$";
  const numericMonto = parseFloat(monto);
  if (isNaN(numericMonto)) return "0 MM$";
  return `${(numericMonto / 1000000).toLocaleString("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} MM$`;
};

export const useDashboardFilters = (
  initialProyectosData,
  initialProfesoresPorUnidadData, // Mantener por si acaso, aunque su uso directo se reducirá
  initialProyectosPorProfesorData
) => {
  const [selectedEscuela, setSelectedEscuela] = useState("Todas las Escuelas");
  const [selectedTematica, setSelectedTematica] = useState(
    "Todas las Temáticas"
  );
  const [selectedInstitucion, setSelectedInstitucion] = useState(
    "Todas las Instituciones"
  );
  const [selectedEstatus, setSelectedEstatus] = useState("Todos los Estatus");

  // Estado para almacenar el monto total del API (desde getCash)
  const [apiTotalMonto, setApiTotalMonto] = useState(0);
  // Estado para almacenar los instrumentos por institución del API (desde getCash)
  const [apiInstitucionMontos, setApiInstitucionMontos] = useState([]);

  // Estados para los datos de getAnalisisCompleto
  const [apiTotalProyectos, setApiTotalProyectos] = useState(0);
  const [apiTotalEscuelas, setApiTotalEscuelas] = useState(0);
  const [apiTotalAcademicos, setApiTotalAcademicos] = useState(0);
  const [apiTematicasFromAnalisis, setApiTematicasFromAnalisis] = useState([]);
  const [
    apiUnidadesAcademicasFromAnalisis,
    setApiUnidadesAcademicasFromAnalisis,
  ] = useState([]);

  // Estado para los datos de Proyectos por Profesor del API
  const [apiProyectosPorProfesor, setApiProyectosPorProfesor] = useState([]);

  // Estado para los datos de Proyectos por Temática del API
  const [apiProyectosPorTematica, setApiProyectosPorTematica] = useState([]);

  // **Nuevo estado para los datos de Proyectos por Unidad Académica del API**
  const [apiProyectosXUnidadAcademica, setApiProyectosXUnidadAcademica] =
    useState([]);

  // Opciones para los selects de filtro (calculadas dinámicamente)
  // **Modificado: opcionesEscuela ahora usa los datos del API si están disponibles**
  const opcionesEscuela = useMemo(() => {
    const sourceData =
      apiProyectosXUnidadAcademica.length > 0
        ? apiProyectosXUnidadAcademica.map((u) => u.nombre)
        : initialProfesoresPorUnidadData.map((item) => item.UnidadAcademica); // Fallback

    const options = [...new Set(sourceData)].filter(Boolean).sort();
    options.unshift("Todas las Escuelas");
    return options;
  }, [initialProfesoresPorUnidadData, apiProyectosXUnidadAcademica]); // Depende de ambos

  const opcionesTematica = useMemo(() => {
    const sourceData =
      apiProyectosPorTematica.length > 0
        ? apiProyectosPorTematica.map((t) => t.nombre)
        : initialProyectosData.map((p) => p.tematica);

    const options = [...new Set(sourceData)].filter(Boolean).sort();
    options.unshift("Todas las Temáticas");
    return options;
  }, [initialProyectosData, apiProyectosPorTematica]);

  const opcionesInstitucion = useMemo(() => {
    const options = [...new Set(initialProyectosData.map((p) => p.institucion))]
      .filter(Boolean)
      .sort();
    options.unshift("Todas las Instituciones");
    return options;
  }, [initialProyectosData]);

  const opcionesEstatus = useMemo(() => {
    const options = [...new Set(initialProyectosData.map((p) => p.estatus))]
      .filter(Boolean)
      .sort();
    options.unshift("Todos los Estatus");
    return options;
  }, [initialProyectosData]);

  // Estados para los datos filtrados y compactos
  const [filteredProyectos, setFilteredProyectos] = useState([]);
  const [filteredProfesoresPorUnidad, setFilteredProfesoresPorUnidad] =
    useState([]); // Renombre conceptual: ahora es proyectos por unidad académica
  const [filteredProyectosPorProfesor, setFilteredProyectosPorProfesor] =
    useState([]);
  // **NUEVO: Estado para los proyectos por temática filtrados**
  const [filteredProyectosPorTematica, setFilteredProyectosPorTematica] =
    useState([]);

  const [indicadoresPrincipales, setIndicadoresPrincipales] = useState({
    proyectosEnCartera: 0,
    montoFormulado: "0 MM$",
    escuelasFIN: 0,
    academicosInvolucrados: 0,
  });
  const [tematicasDestacadas, setTematicasDestacadas] = useState([]);
  const [instrumentosPostulados, setInstrumentosPostulados] = useState([]);
  const [allInstrumentosForPdf, setAllInstrumentosForPdf] = useState([]);

  // useEffect para obtener el monto total Y los datos de instituciones del API (getCash)
  useEffect(() => {
    const fetchTotalCashAndInstitutions = async () => {
      try {
        const response = await cartera_graficos.getCash();
        if (response.ok) {
          setApiTotalMonto(response.sumaMontoProyectos);
          if (response.montoPorInstitucion?.datos) {
            setApiInstitucionMontos(response.montoPorInstitucion.datos);
          } else {
            console.warn(
              "No se encontraron datos de 'montoPorInstitucion' en la respuesta de getCash."
            );
            setApiInstitucionMontos([]);
          }
        } else {
          console.error(
            "Error al obtener los datos totales del API (getCash):",
            response.message
          );
          setApiTotalMonto(0);
          setApiInstitucionMontos([]);
        }
      } catch (error) {
        console.error(
          "Error al llamar a cartera_graficos.getCash() para monto y instituciones:",
          error
        );
        setApiTotalMonto(0);
        setApiInstitucionMontos([]);
      }
    };

    fetchTotalCashAndInstitutions();
  }, []);

  // useEffect para obtener los datos del Análisis Completo (getAnalisisCompleto)
  useEffect(() => {
    const fetchAnalisisCompleto = async () => {
      try {
        const response = await cartera_graficos.getAnalisisCompleto();
        if (response.ok) {
          setApiTotalProyectos(response.totalProyectos || 0);
          setApiTotalAcademicos(
            response.academicos?.totalAcademicosUnicos || 0
          );
          setApiTotalEscuelas(
            response.unidadesAcademicas?.totalUnidadesDistintas || 0
          );
          setApiTematicasFromAnalisis(response.tematicas?.datos || []);
          setApiUnidadesAcademicasFromAnalisis(
            response.unidadesAcademicas?.datos || []
          );
        } else {
          console.error(
            "Error al obtener los datos del Análisis Completo del API:",
            response.message
          );
          setApiTotalProyectos(0);
          setApiTotalAcademicos(0);
          setApiTotalEscuelas(0);
          setApiTematicasFromAnalisis([]);
          setApiUnidadesAcademicasFromAnalisis([]);
        }
      } catch (error) {
        console.error(
          "Error al llamar a cartera_graficos.getAnalisisCompleto():",
          error
        );
        setApiTotalProyectos(0);
        setApiTotalAcademicos(0);
        setApiTotalEscuelas(0);
        setApiTematicasFromAnalisis([]);
        setApiUnidadesAcademicasFromAnalisis([]);
      }
    };

    fetchAnalisisCompleto();
  }, []);

  // useEffect para obtener los datos de Proyectos por Profesor (getProyectosXProfesor)
  useEffect(() => {
    const fetchProyectosXProfesor = async () => {
      try {
        const response = await cartera_graficos.getProyectosXProfesor();
        if (response.ok) {
          setApiProyectosPorProfesor(response.datos || []);
        } else {
          console.error(
            "Error al obtener los proyectos por profesor del API:",
            response.message
          );
          setApiProyectosPorProfesor([]);
        }
      } catch (error) {
        console.error(
          "Error al llamar a cartera_graficos.getProyectosXProfesor():",
          error
        );
        setApiProyectosPorProfesor([]);
      }
    };

    fetchProyectosXProfesor();
  }, []);

  // useEffect para obtener los datos de Proyectos por Temática (getProyectosXTematica)
  useEffect(() => {
    const fetchProyectosXTematica = async () => {
      try {
        const response = await cartera_graficos.getProyectosXTematica();
        if (response.ok) {
          setApiProyectosPorTematica(response.datos || []);
        } else {
          console.error(
            "Error al obtener los proyectos por temática del API:",
            response.message
          );
          setApiProyectosPorTematica([]);
        }
      } catch (error) {
        console.error(
          "Error al llamar a cartera_graficos.getProyectosXTematica():",
          error
        );
        setApiProyectosPorTematica([]);
      }
    };

    fetchProyectosXTematica();
  }, []);

  // **Nuevo useEffect para obtener los datos de Proyectos por Unidad Académica (getProyectosXUnidadAcademica)**
  useEffect(() => {
    const fetchProyectosXUnidadAcademica = async () => {
      try {
        const response = await cartera_graficos.getProyectosXUnidadAcademica();
        if (response.ok) {
          setApiProyectosXUnidadAcademica(response.datos || []);
        } else {
          console.error(
            "Error al obtener los proyectos por unidad académica del API:",
            response.message
          );
          setApiProyectosXUnidadAcademica([]);
        }
      } catch (error) {
        console.error(
          "Error al llamar a cartera_graficos.getProyectosXUnidadAcademica():",
          error
        );
        setApiProyectosXUnidadAcademica([]);
      }
    };

    fetchProyectosXUnidadAcademica();
  }, []); // Se ejecuta una sola vez al montar el componente

  useEffect(() => {
    let currentProyectos = [...initialProyectosData]; // Usa una copia para no mutar el original
    let currentProfesoresPorUnidad = initialProfesoresPorUnidadData; // Mantener para academicosInFilteredProjects de profesores

    // --- Lógica de filtrado de los datos iniciales (currentProyectos) ---
    // Este `currentProyectos` es crucial para filtrar dinámicamente
    // los datos del API de proyectos por profesor, temáticas, y unidades académicas.
    if (selectedEscuela !== "Todas las Escuelas") {
      currentProyectos = currentProyectos.filter(
        (p) => p.unidad === selectedEscuela
      );
    }

    if (selectedTematica !== "Todas las Temáticas") {
      currentProyectos = currentProyectos.filter(
        (p) => p.tematica === selectedTematica
      );
    }

    if (selectedInstitucion !== "Todas las Instituciones") {
      currentProyectos = currentProyectos.filter(
        (p) => p.institucion === selectedInstitucion
      );
    }

    if (selectedEstatus !== "Todos los Estatus") {
      currentProyectos = currentProyectos.filter(
        (p) => p.estatus === selectedEstatus
      );
    }

    setFilteredProyectos(currentProyectos);

    // **Modificación: filteredProfesoresPorUnidad ahora usa apiProyectosXUnidadAcademica con filtro condicional**
    let finalProyectosXUnidadAcademicaData = [...apiProyectosXUnidadAcademica];

    if (
      selectedTematica !== "Todas las Temáticas" ||
      selectedInstitucion !== "Todas las Instituciones" ||
      selectedEstatus !== "Todos los Estatus"
    ) {
      // Necesitamos las unidades de los proyectos que han sido filtrados por otros criterios
      const unidadesInFilteredProjects = new Set(
        currentProyectos.map((p) => p.unidad)
      );
      finalProyectosXUnidadAcademicaData =
        finalProyectosXUnidadAcademicaData.filter((u) =>
          unidadesInFilteredProjects.has(u.nombre)
        );
    }

    // Si `selectedEscuela` no es "Todas las Escuelas", aplicamos un filtro adicional
    if (selectedEscuela !== "Todas las Escuelas") {
      finalProyectosXUnidadAcademicaData =
        finalProyectosXUnidadAcademicaData.filter(
          (u) => u.nombre === selectedEscuela
        );
    }

    // Mapear al formato esperado si es necesario y ordenar
    const processedProyectosXUnidadAcademica =
      finalProyectosXUnidadAcademicaData
        .map((item) => ({
          // El nombre "UnidadAcademica" y "proyectos" se ajusta para el uso original
          UnidadAcademica: item.nombre,
          ProyectosCount: item.cantidad,
        }))
        .sort((a, b) => b.ProyectosCount - a.ProyectosCount);

    setFilteredProfesoresPorUnidad(processedProyectosXUnidadAcademica); // Renombre conceptual: ahora contiene ProyectosCount

    // Agrupar y contar proyectos por profesor (mantiene la lógica de cruce anterior)
    let finalProyectosPorProfesorData = [...apiProyectosPorProfesor];

    if (
      selectedEscuela !== "Todas las Escuelas" ||
      selectedTematica !== "Todas las Temáticas" ||
      selectedInstitucion !== "Todas las Instituciones" ||
      selectedEstatus !== "Todos los Estatus"
    ) {
      const academicosInFilteredProjects = new Set();
      currentProyectos.forEach((proyecto) => {
        // Asume que initialProyectosPorProfesorData tiene el mapeo id_proyecto -> academico
        // Si apiProyectosPorProfesor contiene ya el conteo por nombre,
        // necesitamos saber qué profesores están en `currentProyectos`
        // Para esto, la `initialProyectosData` debería tener el listado de académicos por proyecto.
        // Si no es así, esta lógica podría necesitar un ajuste más profundo para ser precisa.
        // Por ahora, usamos el enfoque original de cruce.
        const relatedProfessors = initialProyectosPorProfesorData.filter(
          (p) => p.id_proyecto === proyecto.id_proyecto
        );
        relatedProfessors.forEach((prof) => {
          academicosInFilteredProjects.add(
            `${prof.NombreAcademico} ${prof.ApellidoAcademico || ""}`.trim()
          );
        });
      });

      // Filtra la data del API por los académicos encontrados en los proyectos filtrados.
      finalProyectosPorProfesorData = finalProyectosPorProfesorData.filter(
        (p) => academicosInFilteredProjects.has(p.nombre)
      );
    }

    const finalProyectosPorProfesor = finalProyectosPorProfesorData
      .map((p) => ({
        profesor: p.nombre,
        proyectos: p.cantidad,
      }))
      .sort((a, b) => b.proyectos - a.proyectos);

    setFilteredProyectosPorProfesor(finalProyectosPorProfesor);

    // Recalcular Indicadores Principales Compactos
    setIndicadoresPrincipales({
      proyectosEnCartera: apiTotalProyectos,
      montoFormulado: formatMM(apiTotalMonto),
      escuelasFIN: apiTotalEscuelas,
      academicosInvolucrados: apiTotalAcademicos,
    });

    // --- LÓGICA DE PROYECTOS POR TEMÁTICA ---
    let finalProyectosPorTematicaData = [...apiProyectosPorTematica];

    // Primero, filtra por la temática seleccionada si no es "Todas las Temáticas"
    if (selectedTematica !== "Todas las Temáticas") {
      finalProyectosPorTematicaData = finalProyectosPorTematicaData.filter(
        (t) => t.nombre === selectedTematica
      );
    }

    // Luego, si hay otros filtros aplicados (Escuela, Institución, Estatus),
    // necesitamos determinar qué temáticas están presentes en los `currentProyectos` filtrados
    // y ajustar las cantidades.
    if (
      selectedEscuela !== "Todas las Escuelas" ||
      selectedInstitucion !== "Todas las Instituciones" ||
      selectedEstatus !== "Todos los Estatus"
    ) {
      const tematicaCounts = currentProyectos.reduce((acc, proyecto) => {
        acc[proyecto.tematica] = (acc[proyecto.tematica] || 0) + 1;
        return acc;
      }, {});

      finalProyectosPorTematicaData = finalProyectosPorTematicaData.filter(
        (t) => tematicaCounts[t.nombre]
      ); // Solo incluye temáticas presentes en los proyectos filtrados

      // Ahora, actualiza las cantidades para reflejar el conteo de `currentProyectos`
      finalProyectosPorTematicaData = finalProyectosPorTematicaData.map(
        (t) => ({
          ...t,
          cantidad: tematicaCounts[t.nombre] || 0, // Usa el conteo filtrado
        })
      );
    }

    // Ordenar por cantidad descendente para el gráfico
    finalProyectosPorTematicaData.sort((a, b) => b.cantidad - a.cantidad);

    setFilteredProyectosPorTematica(finalProyectosPorTematicaData); // Establece el nuevo estado

    // Temáticas Destacadas (usa filteredTematicasDestacadas que ya tiene la data del API con filtro condicional)
    // Usaremos la misma `finalProyectosPorTematicaData` para consistencia.
    const countsTematicas = finalProyectosPorTematicaData
      .map((item) => item.nombre)
      .slice(0, 6); // Limitar a las 6 primeras para destacadas

    setTematicasDestacadas(countsTematicas);

    // Instrumentos Postulados (usando apiInstitucionMontos del API)
    let filteredApiInstitucionMontos = [...apiInstitucionMontos];

    if (selectedInstitucion !== "Todas las Instituciones") {
      filteredApiInstitucionMontos = filteredApiInstitucionMontos.filter(
        (item) => item.institucion === selectedInstitucion
      );
    }

    const processedInstrumentsForPdf = filteredApiInstitucionMontos
      .map((instrument) => ({
        name: instrument.institucion,
        monto: instrument.monto,
        montoFormatted: formatMM(instrument.monto),
      }))
      .sort((a, b) => b.monto - a.monto);

    const processedInstruments = processedInstrumentsForPdf.slice(0, 5);

    setAllInstrumentosForPdf(processedInstrumentsForPdf);
    setInstrumentosPostulados(processedInstruments);
  }, [
    initialProyectosData,
    initialProfesoresPorUnidadData,
    initialProyectosPorProfesorData,
    selectedEscuela,
    selectedTematica,
    selectedInstitucion,
    selectedEstatus,
    apiTotalMonto,
    apiInstitucionMontos,
    apiTotalProyectos,
    apiTotalEscuelas,
    apiTotalAcademicos,
    apiTematicasFromAnalisis,
    apiUnidadesAcademicasFromAnalisis,
    apiProyectosPorProfesor,
    apiProyectosPorTematica,
    apiProyectosXUnidadAcademica, // **Nueva dependencia**
  ]);

  const resetFilters = useCallback(() => {
    setSelectedEscuela("Todas las Escuelas");
    setSelectedTematica("Todas las Temáticas");
    setSelectedInstitucion("Todas las Instituciones");
    setSelectedEstatus("Todos los Estatus");
  }, []);

  return {
    selectedEscuela,
    setSelectedEscuela,
    selectedTematica,
    setSelectedTematica,
    selectedInstitucion,
    setSelectedInstitucion,
    selectedEstatus,
    setSelectedEstatus,
    opcionesEscuela,
    opcionesTematica,
    opcionesInstitucion,
    opcionesEstatus,
    resetFilters,
    filteredProyectos,
    filteredProfesoresPorUnidad, // Este ahora contiene el conteo de proyectos por unidad
    filteredProyectosPorProfesor,
    filteredProyectosPorTematica, // **EXPORTO EL NUEVO ESTADO**
    indicadoresPrincipales,
    tematicasDestacadas,
    instrumentosPostulados,
    allInstrumentosForPdf,
  };
};
