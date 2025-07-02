// src/api/fondosService.js
import axiosClient from "./axiosClient";

const fondosService = {
  // POST /fondos/
  // Voy a usar esto para crear un nuevo fondo en la base de datos.
  crearFondo: async (dataFondo) => {
    const response = await axiosClient.post("/fondos", dataFondo);
    return response.data;
  },

  // GET /fondos/
  // Con esto, obtengo la lista completa de todos los fondos disponibles.
  getAllFondos: async () => {
    const response = await axiosClient.get("/fondos");
    return response.data;
  },

  // GET /fondos/{id}
  // Uso esta para conseguir los detalles de un fondo específico, pasándole su ID.
  getFondoPorId: async (id) => {
    const response = await axiosClient.get(`/fondos/${id}`);
    return response.data;
  },

  // PUT /fondos/{id}
  // Para actualizar un fondo existente. Aquí le mando el ID y todos los datos completos para reemplazarlo.
  actualizarFondo: async (id, dataFondoCompleto) => {
    const response = await axiosClient.put(`/fondos/${id}`, dataFondoCompleto);
    return response.data;
  },

  // DEL /fondos/{id}
  // Uso esto para eliminar un fondo de la base de datos, pasándole su ID.
  eliminarFondo: async (id) => {
    const response = await axiosClient.delete(`/fondos/${id}`);
    return response.data;
  },

  // GET /fondos/search
  // voy a asumir que usa query parameters (por ejemplo, /fondos/search?nombre=ejemplo).
  // Le paso un objeto 'queryParams' y Axios se encarga de convertirlo a la URL correcta.
  buscarFondos: async (queryParams) => {
    const response = await axiosClient.get("/fondos/search", { params: queryParams });
    return response.data;
  },
};

export default fondosService;