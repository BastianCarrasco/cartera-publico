// src/api/tipoConvocatoriaService.js
import axiosClient from "./axiosClient";

const tipoConvocatoriaService = {
  // POST /tipo-convo/
  // Uso esta para crear un tipo de convocatoria nuevo.
  // Le mando el objeto con la información del tipo de convocatoria.
  crearTipoConvocatoria: async (dataTipoConvocatoria) => {
    const response = await axiosClient.post("/tipo-convo", dataTipoConvocatoria);
    return response.data;
  },

  // GET /tipo-convo/
  // Con esta, obtengo una lista de todos los tipos de convocatoria registrados.
  getAllTiposConvocatoria: async () => {
    const response = await axiosClient.get("/tipo-convo");
    return response.data;
  },

  // GET /tipo-convo/{id}
  // Para obtener los detalles de un tipo de convocatoria específico por su ID.
  getTipoConvocatoriaPorId: async (id) => {
    const response = await axiosClient.get(`/tipo-convo/${id}`);
    return response.data;
  },

  // PUT /tipo-convo/{id}
  // Actualizo completamente un tipo de convocatoria existente.
  // Le paso el ID y el objeto completo con todos los datos actualizados.
  actualizarTipoConvocatoria: async (id, dataTipoConvocatoriaCompleta) => {
    const response = await axiosClient.put(`/tipo-convo/${id}`, dataTipoConvocatoriaCompleta);
    return response.data;
  },

  // DEL /tipo-convo/{id}
  // Para eliminar un tipo de convocatoria, solo necesito su ID.
  eliminarTipoConvocatoria: async (id) => {
    const response = await axiosClient.delete(`/tipo-convo/${id}`);
    return response.data;
  },

  // GET /tipo-convo/search
  // Uso esta para buscar tipos de convocatoria por nombre.
  // La API espera un query parameter 'name' (ej. ?name=mi_busqueda),
  // así que le mando un objeto 'queryParams' con esa propiedad.
  buscarTiposConvocatoria: async (queryParams) => {
    const response = await axiosClient.get("/tipo-convo/search", { params: queryParams });
    return response.data;
  },
};

export default tipoConvocatoriaService;