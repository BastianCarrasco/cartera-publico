// src/api/estadisticasService.js
import axiosClient from "./axiosClient";

const estadisticasService = {
  // GET /estadisticas/academicos-por-unidad
  // Obtener el total de académicos por unidad académica
  getAcademicosPorUnidad: async () => {
    const response = await axiosClient.get("/estadisticas/academicos-por-unidad");
    return response.data;
  },

  // GET /estadisticas/proyectos-por-profesor
  // Obtener el número de proyectos por cada profesor/académico
  getProyectosPorProfesor: async () => {
    const response = await axiosClient.get("/estadisticas/proyectos-por-profesor");
    return response.data;
  },
};

export default estadisticasService;