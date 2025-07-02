// src/api/respuestasCuestionarioService.js
import axiosClient from "./axiosClient";

const respuestasCuestionarioService = {
  // POST /respuestas-cuestionario/
  // registrar una nueva respuesta a un cuestionario.
  // Le envío todos los datos de la respuesta en el 'body'.
  registrarRespuestaCuestionario: async (dataRespuesta) => {
    const response = await axiosClient.post("/respuestas-cuestionario", dataRespuesta);
    return response.data;
  },

  // GET /respuestas-cuestionario/
  // obtengo todas las respuestas registradas de los cuestionarios.
  getAllRespuestasCuestionario: async () => {
    const response = await axiosClient.get("/respuestas-cuestionario");
    return response.data;
  },

  // GET /respuestas-cuestionario/{id}
  // obtener una respuesta específica por su ID.
  getRespuestaCuestionarioPorId: async (id) => {
    const response = await axiosClient.get(`/respuestas-cuestionario/${id}`);
    return response.data;
  },

  // PATCH /respuestas-cuestionario/{id}
  // Esta es para actualizar una parte de una respuesta existente.
  // Le paso el ID y solo los datos que quiero cambiar.
  actualizarParcialRespuestaCuestionario: async (id, dataParcial) => {
    const response = await axiosClient.patch(`/respuestas-cuestionario/${id}`, dataParcial);
    return response.data;
  },

  // DEL /respuestas-cuestionario/{id}
  // Para eliminar una respuesta de cuestionario, solo necesito su ID.
  eliminarRespuestaCuestionario: async (id) => {
    const response = await axiosClient.delete(`/respuestas-cuestionario/${id}`);
    return response.data;
  },

  // GET /respuestas-cuestionario/investigador/{id}
  // obtengo todas las respuestas asociadas a un ID de investigador específico.
  getRespuestasPorInvestigadorId: async (investigadorId) => {
    const response = await axiosClient.get(`/respuestas-cuestionario/investigador/${investigadorId}`);
    return response.data;
  },

  // GET /respuestas-cuestionario/escuela/{id}
  // para filtrar y obtener respuestas por el ID de una escuela.
  getRespuestasPorEscuelaId: async (escuelaId) => {
    const response = await axiosClient.get(`/respuestas-cuestionario/escuela/${escuelaId}`);
    return response.data;
  },
};

export default respuestasCuestionarioService;