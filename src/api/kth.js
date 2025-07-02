// src/api/kthService.js
import axiosClient from "./axiosClient";

const kthService = {
  // POST /kth/
  // crear una nueva entrada KTH.
  crearEntradaKTH: async (dataKTH) => {
    const response = await axiosClient.post("/kth", dataKTH);
    return response.data;
  },

  // GET /kth/
  // obtener todas las entradas KTH existentes.
  getAllEntradasKTH: async () => {
    const response = await axiosClient.get("/kth");
    return response.data;
  },

  // GET /kth/{id}
  // obtener una entrada KTH específica por su ID.
  getEntradaKTHPorId: async (id) => {
    const response = await axiosClient.get(`/kth/${id}`);
    return response.data;
  },

  // PUT /kth/{id}
  // Actualizo completamente una entrada KTH existente, le paso el ID y todos los datos nuevos.
  actualizarEntradaKTH: async (id, dataKTHCompleto) => {
    const response = await axiosClient.put(`/kth/${id}`, dataKTHCompleto);
    return response.data;
  },

  // DEL /kth/{id}
  // eliminar una entrada KTH específica por su ID.
  eliminarEntradaKTH: async (id) => {
    const response = await axiosClient.delete(`/kth/${id}`);
    return response.data;
  },

  // GET /kth/project/{projectId}
  // busco entradas KTH asociadas a un proyecto específico, usando el ID del proyecto.
  getEntradasKTHPorProyectoId: async (projectId) => {
    const response = await axiosClient.get(`/kth/project/${projectId}`);
    return response.data;
  },
};

export default kthService;