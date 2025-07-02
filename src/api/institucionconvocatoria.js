
import axiosClient from "./axiosClient";

const institucionesConvocatoriaService = {
  // POST /inst-convo/
  // crear una nueva institución de convocatoria. 
  crearInstitucionConvocatoria: async (dataInstitucion) => {
    const response = await axiosClient.post("/inst-convo", dataInstitucion);
    return response.data;
  },

  // GET /inst-convo/
  // trae todas las instituciones de convocatoria que tengo registradas.
  getAllInstitucionesConvocatoria: async () => {
    const response = await axiosClient.get("/inst-convo");
    return response.data;
  },

  // GET /inst-convo/{id}
  // Si necesito los detalles de una institución específica, uso este endpoint y le paso su ID.
  getInstitucionConvocatoriaPorId: async (id) => {
    const response = await axiosClient.get(`/inst-convo/${id}`);
    return response.data;
  },

  // PUT /inst-convo/{id}
  // Uso esta para actualizar completamente una institución de convocatoria por su ID.
  // Aquí le mando el ID y el objeto completo con los datos actualizados.
  actualizarInstitucionConvocatoria: async (id, dataInstitucionCompleto) => {
    const response = await axiosClient.put(`/inst-convo/${id}`, dataInstitucionCompleto);
    return response.data;
  },

  // DEL /inst-convo/{id}
  // Para eliminar una institución de convocatoria, solo le paso su ID.
  eliminarInstitucionConvocatoria: async (id) => {
    const response = await axiosClient.delete(`/inst-convo/${id}`);
    return response.data;
  },

  // GET /inst-convo/search
  // buscar instituciones de convocatoria por nombre.
  // La API espera un query parameter 'nombre', así que le mando un objeto con { nombre: 'mi_termino_de_busqueda' }.
  buscarInstitucionesConvocatoria: async (nombre) => {
    const response = await axiosClient.get("/inst-convo/search", { params: { nombre: nombre } });
    return response.data;
  },
};

export default institucionesConvocatoriaService;