// src/components/dashboard/hooks/useDashboardData.js
import { useState, useEffect, useCallback } from "react";
import { useError } from "@/contexts/ErrorContext";
import funcionesService from "../../../../api/funciones.js";
import estadisticasService from "../../../../api/estadisticas.js";
import unidadesAcademicasService from "../../../../api/unidadesacademicas.js";

export const useDashboardData = () => {
  const [proyectosData, setProyectosData] = useState([]);
  const [profesoresPorUnidadData, setProfesoresPorUnidadData] = useState([]);
  const [proyectosPorProfesorData, setProyectosPorProfesorData] = useState([]);
  const [academicosData, setAcademicosData] = useState([]); // Puede que no se use directamente aquí, pero lo mantenemos para consistencia
  const [unidadesData, setUnidadesData] = useState([]);
  const [unidadesMap, setUnidadesMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [errorLocal, setErrorLocal] = useState(null);
  const { setError: setErrorGlobal } = useError();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorLocal(null);
    setErrorGlobal(null);
    try {
      const [
        proyectosRes,
        profesoresPorUnidadRes,
        proyectosPorProfesorRes,
        unidadesRes,
      ] = await Promise.all([
        funcionesService.getDataInterseccionProyectos(),
        estadisticasService.getAcademicosPorUnidad(),
        estadisticasService.getProyectosPorProfesor(),
        unidadesAcademicasService.getAllUnidadesAcademicas(),
      ]);

      const newUnidadesMap = unidadesRes.reduce((map, unidad) => {
        map[unidad.id_unidad] = unidad;
        return map;
      }, {});
      setUnidadesMap(newUnidadesMap);
      setUnidadesData(unidadesRes);

      setProyectosData(proyectosRes);
      setProyectosPorProfesorData(proyectosPorProfesorRes);
      setProfesoresPorUnidadData(profesoresPorUnidadRes);

      // setAcademicosData(academicosRes); // Si se necesita cargar académicos directamente
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setErrorGlobal({
        type: "error",
        title: "Error al cargar los datos del dashboard.",
        description:
          "Hubo un problema al obtener la información. Intente de nuevo más tarde.",
      });
      setErrorLocal(
        "Error al cargar los datos del dashboard. Intente de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  }, [setErrorGlobal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    proyectosData,
    profesoresPorUnidadData,
    proyectosPorProfesorData,
    academicosData, // Se retorna por si se necesita en otro lugar
    unidadesData,
    unidadesMap,
    loading,
    errorLocal,
    fetchData, // Por si se necesita re-cargar los datos
  };
};
