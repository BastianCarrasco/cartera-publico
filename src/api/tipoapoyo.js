// src/api/tipoApoyoService.js
import axiosClient from "./axiosClient";

const tipoApoyoService = {
  // POST /tipo-apoyo/
  // crear un nuevo tipo de apoyo. Le envío los datos en el 'body'.
  crearTipoApoyo: async (dataTipoApoyo) => {
    const response = await axiosClient.post("/tipo-apoyo", dataTipoApoyo);
    return response.data;
  },

  // GET /tipo-apoyo/
  // trae todos los tipos de apoyo registrados.
  getAllTiposApoyo: async () => {
    const response = await axiosClient.get("/tipo-apoyo");
    return response.data;
  },

  // GET /tipo-apoyo/{id}
  // Si necesito los detalles de un tipo de apoyo específico, uso este endpoint y le paso su ID.
  getTipoApoyoPorId: async (id) => {
    const response = await axiosClient.get(`/tipo-apoyo/${id}`);
    return response.data;
  },

  // PUT /tipo-apoyo/{id}
  // Uso esta para actualizar completamente un tipo de apoyo existente por su ID.
  // Le mando el ID y el objeto completo con los datos actualizados.
  actualizarTipoApoyo: async (id, dataTipoApoyoCompleto) => {
    const response = await axiosClient.put(`/tipo-apoyo/${id}`, dataTipoApoyoCompleto);
    return response.data;
  },

  // DEL /tipo-apoyo/{id}
  // Para eliminar un tipo de apoyo específico, solo necesito su ID.
  eliminarTipoApoyo: async (id) => {
    const response = await axiosClient.delete(`/tipo-apoyo/${id}`);
    return response.data;
  },

  // GET /tipo-apoyo/search
  // Con esto puedo buscar tipos de apoyo por su nombre o texto.
  // La API espera un query parameter 'tipo' (ej. ?tipo=mi_busqueda),
  buscarTiposApoyo: async (queryParams) => {
    const response = await axiosClient.get("/tipo-apoyo/search", { params: queryParams });
    return response.data;
  },
};

export default tipoApoyoService;