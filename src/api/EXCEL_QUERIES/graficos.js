import axiosClient from "../axiosClient";

const PROJECTS_CASH_API_URL = import.meta.env.VITE_PROJECTS_CASH;
const PROJECTS_ANALISIS_API_URL = import.meta.env
  .VITE_PROJECTS_ANALISIS_API_URL;

const PROJECTS_X_PROFESSOR_API_URL = import.meta.env.VITE_PROJECTS_X_PROFESSOR;
const PROJECTS_X_TEMATICA_API_URL = import.meta.env.VITE_PROJECTS_X_TEMATICA;
const PROJECTS_X_UNIDAD_ACADEMICA_API_URL = import.meta.env
  .VITE_PROJECTS_X_UNIDAD_ACADEMICA;
const UNIDAD_ACADEMICA_X_PROFESOR_API_URL = import.meta.env
  .VITE_UNIDAD_ACADEMICA_X_PROFESOR;

const cartera_graficos = {
  // GET /proyectos/analisis-completo
  getCash: async () => {
    const response = await axiosClient.get(PROJECTS_CASH_API_URL);
    return response.data;
  },
  getAnalisisCompleto: async () => {
    const response = await axiosClient.get(PROJECTS_ANALISIS_API_URL);
    return response.data;
  },
  getProyectosXProfesor: async () => {
    const response = await axiosClient.get(PROJECTS_X_PROFESSOR_API_URL);
    return response.data;
  },
  getProyectosXTematica: async () => {
    const response = await axiosClient.get(PROJECTS_X_TEMATICA_API_URL);
    return response.data;
  },
  getProyectosXUnidadAcademica: async () => {
    const response = await axiosClient.get(PROJECTS_X_UNIDAD_ACADEMICA_API_URL);
    return response.data;
  },
  getUnidadAcademicaXProfesor: async () => {
    const response = await axiosClient.get(UNIDAD_ACADEMICA_X_PROFESOR_API_URL);
    return response.data;
  },
};

export default cartera_graficos;
