// src/api/proyectosAcademicoService.js
import axiosClient from "./axiosClient";

const proyectosAcademicoService = {
  // POST /proyectoacademico/
  // creo una nueva relación entre un proyecto y un académico.
  // asocio un académico a un proyecto
  crearRelacionProyectoAcademico: async (dataRelacion) => {
    const response = await axiosClient.post("/proyectoacademico", dataRelacion);
    return response.data;
  },

  // GET /proyectoacademico/
  // me trae todas las relaciones proyecto-académico existentes.
  // Es útil para ver todas las asociaciones.
  getAllRelacionesProyectoAcademico: async () => {
    const response = await axiosClient.get("/proyectoacademico");
    return response.data;
  },

  // GET /proyectoacademico/{id}
  // Si necesito los detalles de una relación específica (ej. la asociación de un académico con un proyecto),
  // uso este endpoint y le paso el ID de esa relación.
  getRelacionProyectoAcademicoPorId: async (id) => {
    const response = await axiosClient.get(`/proyectoacademico/${id}`);
    return response.data;
  },

  // PUT /proyectoacademico/{id}
  // actualizar completamente una relación proyecto-académico existente.
  // Le mando el ID de la relación y el objeto completo con los datos actualizados.
  actualizarRelacionProyectoAcademico: async (id, dataRelacionCompleta) => {
    const response = await axiosClient.put(`/proyectoacademico/${id}`, dataRelacionCompleta);
    return response.data;
  },

  // DEL /proyectoacademico/{id}
  // Para eliminar una relación proyecto-académico específica, solo necesito su ID.
  eliminoRelacionProyectoAcademico: async (id) => {
    const response = await axiosClient.delete(`/proyectoacademico/${id}`);
    return response.data;
  },

  // GET /proyectoacademico/project/{projectId}
  // Esto me permite obtener todas las relaciones (académicos) asociadas a un proyecto específico.
  getRelacionesPorProyectoId: async (projectId) => {
    const response = await axiosClient.get(`/proyectoacademico/project/${projectId}`);
    return response.data;
  },

  // DEL /proyectoacademico/project/{projectId}
  // Con esto puedo eliminar *todas* las relaciones de académicos para un proyecto específico.
  eliminarRelacionesPorProyectoId: async (projectId) => {
    const response = await axiosClient.delete(`/proyectoacademico/project/${projectId}`);
    return response.data;
  },

  // GET /proyectoacademico/academico/{academicoId}
  // Esto me trae todas las relaciones (proyectos) en las que participa un académico específico.
  getRelacionesPorAcademicoId: async (academicoId) => {
    const response = await axiosClient.get(`/proyectoacademico/academico/${academicoId}`);
    return response.data;
  },

  // DEL /proyectoacademico/academico/{academicoId}
  // Con esto puedo eliminar *todas* las relaciones de proyectos para un académico específico.
  eliminarRelacionesPorAcademicoId: async (academicoId) => {
    const response = await axiosClient.delete(`/proyectoacademico/academico/${academicoId}`);
    return response.data;
  },

  // GET /proyectoacademico/jefes
  // Esto me trae la lista de todos los académicos que son "jefes" en algún proyecto.
  getTodosLosJefesDeProyecto: async () => {
    const response = await axiosClient.get("/proyectoacademico/jefes");
    return response.data;
  },
};

export default proyectosAcademicoService;