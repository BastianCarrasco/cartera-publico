import { createContext, useContext, useState, useEffect } from "react";

const ProyectosContext = createContext();

export function ProyectosProvider({ children }) {
  const [proyectosContexto, setProyectosContexto] = useState([]);

  return (
    <ProyectosContext.Provider
      value={{ proyectosContexto, setProyectosContexto }}
    >
      {children}
    </ProyectosContext.Provider>
  );
}

export function useProyectos() {
  return useContext(ProyectosContext);
}
