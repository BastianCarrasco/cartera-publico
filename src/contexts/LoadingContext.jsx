import { createContext, useContext, useState } from "react";
import { Spinner } from "@/components/ui/spinner"; // Importa tu componente Spinner

// 1. Crear el contexto
const LoadingContext = createContext(null);

// 2. Crear el hook personalizado para consumir el contexto
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

// 3. Crear el proveedor del contexto
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F4F8FD] bg-opacity-30">
          {/* Usa tu componente Spinner aquí */}
          <Spinner size={64} className="text-[#2E5C8A]" />
          {/* Puedes ajustar el size y className para el color específico si el spinner por defecto no es el deseado */}
          {/* El color por defecto en Spinner.jsx es blue-800, pero puedes sobrescribirlo con className */}
        </div>
      )}
    </LoadingContext.Provider>
  );
};
