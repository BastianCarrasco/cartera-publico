// src/api/tematicasService.js
import axiosClient from "./axiosClient";

const tematicasService = {
  // POST /tematicas/
  // crear una nueva temática en la base de datos.
  // Le envío los datos de la temática en el 'body'.
  crearTematica: async (dataTematica) => {
    const response = await axiosClient.post("/tematicas", dataTematica);
    return response.data;
  },

  // GET /tematicas/
  // me trae todas las temáticas registradas.
  getAllTematicas: async () => {
    const response = await axiosClient.get("/tematicas");
    return response.data;
  },

  // GET /tematicas/{id}
  // Uso esto para obtener una temática específica por su ID.
  getTematicaPorId: async (id) => {
    const response = await axiosClient.get(`/tematicas/${id}`);
    return response.data;
  },

  // PUT /tematicas/{id}
  // Actualizo completamente una temática existente por su ID.
  // Le paso el ID y el objeto completo con los datos actualizados.
  actualizarTematica: async (id, dataTematicaCompleta) => {
    const response = await axiosClient.put(`/tematicas/${id}`, dataTematicaCompleta);
    return response.data;
  },

  // DEL /tematicas/{id}
  // Para eliminar una temática específica, solo necesito su ID.
  eliminarTematica: async (id) => {
    const response = await axiosClient.delete(`/tematicas/${id}`);
    return response.data;
  },

  // GET /tematicas/search
  // Con esto puedo buscar temáticas por nombre 
  buscarTematicas: async (queryParams) => {
    const response = await axiosClient.get("/tematicas/search", { params: queryParams });
    return response.data;
  },
};

export default tematicasService;