import axiosClient from "./axiosClient";
const PROJECTS_API_URL = import.meta.env.VITE_PROJECTS_API_URL;
const PROJECTS_ANALISIS_API_URL = import.meta.env
  .VITE_PROJECTS_ANALISIS_API_URL;

const cartera_proyecto = {
  // GET /proyectos/
  getAllproyectos: async () => {
    const response = await axiosClient.get(PROJECTS_API_URL);
    return response.data;
  },
  // GET /proyectos/analisis-completo
  getAnalisisCompleto: async () => {
    const response = await axiosClient.get(PROJECTS_ANALISIS_API_URL);
    return response.data;
  },
};

export default cartera_proyecto;
