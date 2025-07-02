// src/api/proyectosService.js
import axiosClient from "./axiosClient";

const proyectosService = {
  // GET /proyectos/crudo
  // obtengo todos los proyectos con todos los datos relacionados, sin procesar.
  getAllProyectosCrudo: async () => {
    const response = await axiosClient.get("/proyectos/crudo");
    return response.data;
  },

  // GET /proyectos/{id}
  // Uso esta para conseguir un proyecto específico por su ID, con todos sus datos relacionados.
  getProyectoPorId: async (id) => {
    const response = await axiosClient.get(`/proyectos/${id}`);
    return response.data;
  },

  // PUT /proyectos/{id}
  // Para actualizar completamente un proyecto existente.
  // Le envío el ID del proyecto y el objeto completo con los nuevos datos.
  actualizarProyecto: async (id, dataProyectoCompleto) => {
    const response = await axiosClient.put(`/proyectos/${id}`, dataProyectoCompleto);
    return response.data;
  },

  // DEL /proyectos/{id}
  // Con esto puedo eliminar un proyecto de la base de datos, solo necesito su ID.
  eliminarProyecto: async (id) => {
    const response = await axiosClient.delete(`/proyectos/${id}`);
    return response.data;
  },

  // GET /proyectos/status/{statusId}
  // Esta función me permite filtrar proyectos por el ID de su estatus.
  getProyectosPorStatusId: async (statusId) => {
    const response = await axiosClient.get(`/proyectos/status/${statusId}`);
    return response.data;
  },

  // GET /proyectos/convocatoria/{nombre}
  // Con esto busco proyectos filtrados por el nombre de la convocatoria.
  getProyectosPorConvocatoriaNombre: async (nombre) => {
    const response = await axiosClient.get(`/proyectos/convocatoria/${nombre}`);
    return response.data;
  },

  // GET /proyectos/search
  // Esta es mi función de búsqueda general de proyectos por nombre.
  // así que le mando un objeto { name: 'mi_busqueda' }.
  buscarProyectos: async (nombre) => {
    const response = await axiosClient.get("/proyectos/search", { params: { name: nombre } });
    return response.data;
  },

  // POST /proyectos/
  // Con esto creo un nuevo proyecto en la base de datos.
  crearProyecto: async (dataProyecto) => {
    const response = await axiosClient.post("/proyectos", dataProyecto);
    return response.data;
  },
};

export default proyectosService;