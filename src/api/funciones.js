// src/api/funcionesService.js
import axiosClient from "./axiosClient";

const funcionesService = {
  // GET /funciones/data
  // obtener todos los proyectos, pero con los datos
  // ya cruzados e intersectados con sus tablas relacionadas.
  getDataInterseccionProyectos: async () => {
    const response = await axiosClient.get("/funciones/data");
    return response.data;
  },

  // GET /funciones/academicosXProyecto
  // obtengo una lista de académicos agrupados por proyecto.
  // para ver quién trabaja en qué.
  getAcademicosPorProyecto: async () => {
    const response = await axiosClient.get("/funciones/academicosXProyecto");
    return response.data;
  },

  // POST /funciones/crearProyectoConAcademicos
  // crear un proyecto nuevo
  // y, al mismo tiempo, asociarle los académicos. Me pide todo en el 'body'.
  crearProyectoConAcademicos: async (dataProyectoConAcademicos) => {
    const response = await axiosClient.post("/funciones/crearProyectoConAcademicos", dataProyectoConAcademicos);
    return response.data;
  },
};

export default funcionesService;