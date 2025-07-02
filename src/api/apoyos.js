import axiosClient from "./axiosClient";

const apoyosService = {
  // GET /apoyos/
  // Obtener todos los apoyos
  getAllApoyos: async () => {
    const response = await axiosClient.get("/apoyos");
    return response.data;
  },

  // POST /apoyos/
  // Crear un nuevo apoyo
  crearApoyo: async (dataApoyo) => {
    const response = await axiosClient.post("/apoyos", dataApoyo);
    return response.data;
  },

  // GET /apoyos/{id}
  // Obtener un apoyo por su ID
  getApoyoPorId: async (id) => {
    const response = await axiosClient.get(`/apoyos/${id}`);
    return response.data;
  },

  // PUT /apoyos/{id}
  // Actualizar completamente un apoyo por su ID (reemplazo total)
  actualizarApoyo: async (id, dataApoyoCompleto) => {
    const response = await axiosClient.put(`/apoyos/${id}`, dataApoyoCompleto);
    return response.data;
  },

  // PATCH /apoyos/{id}
  // Actualizar parcialmente un apoyo por su ID
  actualizarParcialApoyo: async (id, dataApoyoParcial) => {
    const response = await axiosClient.patch(`/apoyos/${id}`, dataApoyoParcial);
    return response.data;
  },

  // DELETE /apoyos/{id}
  // Eliminar un apoyo por su ID
  eliminarApoyo: async (id) => {
    const response = await axiosClient.delete(`/apoyos/${id}`);
    return response.data;
  },
};

export default apoyosService;
