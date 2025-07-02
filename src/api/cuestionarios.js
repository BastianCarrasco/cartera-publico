// src/api/cuestionariosService.js
import axiosClient from "./axiosClient";

const cuestionariosService = {
  // POST /cuestionarios/
  // Crear un nuevo cuestionario (ej. registrar una nueva respuesta de formulario)
  crearCuestionario: async (dataCuestionario) => {
    const response = await axiosClient.post("/cuestionarios", dataCuestionario);
    return response.data;
  },

  // GET /cuestionarios/
  // Obtener todos los cuestionarios (ej. todas las respuestas de formularios)
  getAllCuestionarios: async () => {
    const response = await axiosClient.get("/cuestionarios");
    return response.data;
  },

  // GET /cuestionarios/{id}
  // Obtener un cuestionario específico por su ID
  getCuestionarioPorId: async (id) => {
    const response = await axiosClient.get(`/cuestionarios/${id}`);
    return response.data;
  },

  // PATCH /cuestionarios/{id}
  // Actualizar parcialmente un cuestionario por su ID
  actualizarParcialCuestionario: async (id, dataParcial) => {
    const response = await axiosClient.patch(`/cuestionarios/${id}`, dataParcial);
    return response.data;
  },

  // DEL /cuestionarios/{id}
  // Eliminar un cuestionario por su ID
  eliminarCuestionario: async (id) => {
    const response = await axiosClient.delete(`/cuestionarios/${id}`);
    return response.data;
  },

  // GET /cuestionarios/buscar/{pregunta}
  // Buscar cuestionarios por una pregunta específica (asumiendo que 'pregunta' es un texto de búsqueda)
  buscarCuestionarioPorPregunta: async (pregunta) => {
    const response = await axiosClient.get(`/cuestionarios/buscar/${pregunta}`);
    return response.data;
  },
};

export default cuestionariosService;