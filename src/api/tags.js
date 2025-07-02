// src/api/tagsService.js
import axiosClient from "./axiosClient";

// tag = detalle apoyo
const tagsService = {
  // POST /tags/
  // crear un tag nuevo. Le mando los datos en el 'body'.
  crearTag: async (dataTag) => {
    const response = await axiosClient.post("/tags", dataTag);
    return response.data;
  },

  // GET /tags/
  // Esto me trae todos los tags que tengo registrados.
  getAllTags: async () => {
    const response = await axiosClient.get("/tags");
    return response.data;
  },

  // GET /tags/{id}
  // Si necesito los detalles de un tag específico, le paso su ID.
  getTagPorId: async (id) => {
    const response = await axiosClient.get(`/tags/${id}`);
    return response.data;
  },

  // PATCH /tags/{id}
  // Con esta, puedo actualizar parcialmente un tag existente.
  // Le paso el ID y solo los datos que quiero cambiar.
  actualizarParcialTag: async (id, dataParcial) => {
    const response = await axiosClient.patch(`/tags/${id}`, dataParcial);
    return response.data;
  },

  // DEL /tags/{id}
  // Para eliminar un tag específico, solo necesito su ID.
  eliminarTag: async (id) => {
    const response = await axiosClient.delete(`/tags/${id}`);
    return response.data;
  },

  // GET /tags/search/{tag}
  // Uso esto para buscar tags por texto. Le paso el texto del tag directamente en la URL.
  buscarTagsPorTexto: async (tagTexto) => {
    const response = await axiosClient.get(`/tags/search/${tagTexto}`);
    return response.data;
  },
};

export default tagsService;