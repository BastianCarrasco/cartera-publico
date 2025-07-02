// src/api/unidadesAcademicasService.js
import axiosClient from "./axiosClient";

const unidadesAcademicasService = {
  // POST /unidades/
  // Uso esta función para crear una nueva unidad académica. Le envío los datos en el 'body'.
  crearUnidadAcademica: async (dataUnidad) => {
    const response = await axiosClient.post("/unidades", dataUnidad);
    return response.data;
  },

  // GET /unidades/
  // Esto me trae todas las unidades académicas registradas.
  getAllUnidadesAcademicas: async () => {
    const response = await axiosClient.get("/unidades");
    return response.data;
  },

  // GET /unidades/{id}
  // Si necesito los detalles de una unidad académica específica, uso este endpoint y le paso su ID.
  getUnidadAcademicaPorId: async (id) => {
    const response = await axiosClient.get(`/unidades/${id}`);
    return response.data;
  },

  // PUT /unidades/{id}
  // Uso esta para actualizar completamente una unidad académica existente.
  // Le mando el ID y el objeto completo con los datos actualizados.
  actualizarUnidadAcademica: async (id, dataUnidadCompleta) => {
    const response = await axiosClient.put(
      `/unidades/${id}`,
      dataUnidadCompleta
    );
    return response.data;
  },

  // PATCH /unidades/{id}
  // Esta es para actualizar campos específicos de una unidad académica existente.
  // Le paso el ID y solo los datos que quiero cambiar.
  actualizarParcialUnidadAcademica: async (id, dataParcial) => {
    const response = await axiosClient.patch(`/unidades/${id}`, dataParcial);
    return response.data;
  },

  // DEL /unidades/{id}
  // Para eliminar una unidad académica específica, solo necesito su ID.
  eliminarUnidadAcademica: async (id) => {
    const response = await axiosClient.delete(`/unidades/${id}`);
    return response.data;
  },

  // GET /unidades/buscar/{nombre}
  // Con esto busco unidades académicas por su nombre.
  buscarUnidadesAcademicasPorNombre: async (nombre) => {
    const response = await axiosClient.get(`/unidades/buscar/${nombre}`);
    return response.data;
  },
};

export default unidadesAcademicasService;
