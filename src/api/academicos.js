import axiosClient from "./axiosClient";

const academicosService = {
  // GET /academicos/
  getAllAcademicos: async () => {
    const response = await axiosClient.get("/academicos");
    return response.data;
  },

  // POST /academicos/
  crearAcademico: async (dataAcademico) => {
    const response = await axiosClient.post("/academicos", dataAcademico);
    return response.data;
  },

  // GET /academicos/{id}
  getAcademicoPorId: async (id) => {
    const response = await axiosClient.get(`/academicos/${id}`);
    return response.data;
  },

  // GET /academicos/buscar/{termino}
  buscarAcademico: async (nombre_o_apellido) => {
    const response = await axiosClient.get(
      `/academicos/buscar/${nombre_o_apellido}`
    );
    return response.data;
  },

  // PUT /academicos/{id}
  actualizarAcademico: async (id, dataAcademico) => {
    const response = await axiosClient.put(`/academicos/${id}`, dataAcademico);
    return response.data;
  },

  // DELETE /academicos/{id}
  eliminarAcademico: async (id) => {
    const response = await axiosClient.delete(`/academicos/${id}`);
    return response.data;
  },

  // PATCH /academicos/{id}
  actualizarParcialAcademico: async (id, dataParcial) => {
    const response = await axiosClient.patch(`/academicos/${id}`, dataParcial);
    return response.data;
  },

  // GET /academicos/fotos-global
  getAllFotosAcademicos: async () => {
    const response = await axiosClient.get("/academicos/fotos-global");
    return response.data;
  },

  // GET /academicos/{id}/fotos
  getFotosPorAcademico: async (id) => {
    const response = await axiosClient.get(`/academicos/${id}/fotos`);
    return response.data;
  },

  // POST /academicos/{id}/fotos
  // Sube una nueva foto para un académico específico
  // fotoData debe ser un objeto FormData (ej. { foto: File })
  subirFotoAcademico: async (id, linkFoto) => {
    const response = await axiosClient.post(
      `/academicos/${id}/fotos`,
      linkFoto
    );
    return response.data;
  },

  // GET /academicos/{id}/fotos/{fotoId}
  getFotoAcademicoPorId: async (id, fotoId) => {
    const response = await axiosClient.get(`/academicos/${id}/fotos/${fotoId}`);
    // Dependiendo de la API, esto puede retornar la URL de la imagen o los bytes
    return response.data;
  },

  // PATCH /academicos/{id}/fotos/{fotoId}
  // Actualiza parcialmente una foto específica (ej. metadatos de la foto, no el archivo binario)
  // photoPatchData podría ser { descripcion: "Nueva descripción" }
  actualizarParcialFotoAcademico: async (id, fotoId, linkFoto) => {
    const response = await axiosClient.patch(
      `/academicos/${id}/fotos/${fotoId}`,
      linkFoto
    );
    return response.data;
  },

  // DELETE /academicos/{id}/fotos/{fotoId}
  eliminarFotoAcademico: async (id, fotoId) => {
    const response = await axiosClient.delete(
      `/academicos/${id}/fotos/${fotoId}`
    );
    return response.data;
  },
};

export default academicosService;
