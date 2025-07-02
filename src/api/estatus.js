// src/api/estatusService.js
import axiosClient from "./axiosClient";

const estatusService = {
  // POST /estatus/
  // Crear un nuevo estatus
  crearEstatus: async (dataEstatus) => {
    const response = await axiosClient.post("/estatus", dataEstatus);
    return response.data;
  },

  // GET /estatus/
  // Obtener todos los estatus
  getAllEstatus: async () => {
    const response = await axiosClient.get("/estatus");
    return response.data;
  },

  // GET /estatus/{id}
  // Obtener un estatus por su ID
  getEstatusPorId: async (id) => {
    const response = await axiosClient.get(`/estatus/${id}`);
    return response.data;
  },

  // PATCH /estatus/{id}
  // Actualizar parcialmente un estatus por su ID
  actualizarParcialEstatus: async (id, dataParcial) => {
    const response = await axiosClient.patch(`/estatus/${id}`, dataParcial);
    return response.data;
  },

  // DEL /estatus/{id}
  // Eliminar un estatus por su ID
  eliminarEstatus: async (id) => {
    const response = await axiosClient.delete(`/estatus/${id}`);
    return response.data;
  },

  // GET /estatus/search/{tipo}
  // Buscar estatus por tipo 
  buscarEstatusPorTipo: async (tipo) => {
    const response = await axiosClient.get(`/estatus/search/${tipo}`);
    return response.data;
  },
};

export default estatusService;