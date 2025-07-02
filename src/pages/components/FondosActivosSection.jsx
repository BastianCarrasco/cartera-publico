// src/components/FondosActivosSection.jsx
import { useState, useEffect, useCallback } from "react";
import fondosService from "../../api/fondos.js"; // Verificar la ruta si es necesario: "../api/fondos.js
import tipoConvocatoriaService from "../../api/tipoconvocatoria.js"; // Verificar la ruta si es necesario: "../api/tipoconvocatoria.js"
import { useError } from "@/contexts/ErrorContext";
import { Spinner } from "@/components/ui/spinner";

// Iconos de Lucide React
import { Calendar, DollarSign, Clock } from "lucide-react";

// Importa los logos de las imágenes
import anidLogo from "../../assets/tipos_convocatorias/anid_rojo_azul.png";
import corfoLogo from "../../assets/tipos_convocatorias/corfo2024.png";
import goreLogo from "../../assets/tipos_convocatorias/gore-valpo.jpg";
import internasPucvLogo from "../../assets/tipos_convocatorias/internaspucv.svg";
import privadaLogo from "../../assets/tipos_convocatorias/private.png";

const FONDO_LOGOS = {
  ANID: anidLogo,
  CORFO: corfoLogo,
  GORE: goreLogo,
  Internas: internasPucvLogo,
  PRIVADA: privadaLogo,
};

export default function FondosActivosSection() {
  const [fondosActivos, setFondosActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setError } = useError();
  const [tipoFondoMap, setTipoFondoMap] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date()); // Mantener para el cálculo de días

  // --- Helpers (sin cambios) ---
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Fecha no especificada";
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("es-CL", options);
    } catch (e) {
      console.warn("Invalid date string:", dateString, e);
      return "Fecha inválida";
    }
  }, []);

  const isFondoVigente = useCallback(
    (fondo) => {
      if (!fondo.inicio || !fondo.cierre) return false;

      const hoy = currentDate; // Usa currentDate del estado
      const hoyUTC = new Date(hoy.toISOString().slice(0, 10));
      hoyUTC.setUTCHours(0, 0, 0, 0);

      const inicioFondoUTC = new Date(fondo.inicio);
      const cierreFondoUTC = new Date(fondo.cierre);

      inicioFondoUTC.setUTCHours(0, 0, 0, 0);
      cierreFondoUTC.setUTCHours(23, 59, 59, 999);

      return hoyUTC >= inicioFondoUTC && hoyUTC <= cierreFondoUTC;
    },
    [currentDate]
  ); // Dependencia: currentDate

  const getDaysRemaining = useCallback(
    (cierreDateString) => {
      if (!cierreDateString) return null;

      const cierre = new Date(cierreDateString);
      cierre.setHours(23, 59, 59, 999);

      const hoy = currentDate; // Usa currentDate del estado
      const hoyInicioDia = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate()
      );
      const cierreInicioDia = new Date(
        cierre.getFullYear(),
        cierre.getMonth(),
        cierre.getDate()
      );

      const diffTime = cierreInicioDia.getTime() - hoyInicioDia.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Cierra hoy";
      if (diffDays === 1) return "Cierra mañana";
      if (diffDays > 1) return `en ${diffDays} días`;
      return null;
    },
    [currentDate]
  ); // Dependencia: currentDate

  // Función para obtener el renderizable del "logo"
  const renderFondoIconOrLogo = useCallback((tipoFondoNombre) => {
    const logoSrc = FONDO_LOGOS[tipoFondoNombre];
    if (logoSrc) {
      return (
        <img
          src={logoSrc}
          alt={`${tipoFondoNombre} Logo`}
          className="h-10 w-10 object-contain rounded-full border border-gray-200 p-1 bg-white shadow-sm flex-shrink-0"
        />
      );
    } else if (tipoFondoNombre === "PRIVADA") {
      return (
        <div className="h-10 w-10 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 text-sm font-bold flex-shrink-0">
          PRIV
        </div>
      );
    } else {
      return (
        <div className="h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full text-blue-800 text-sm font-bold flex-shrink-0">
          {tipoFondoNombre ? tipoFondoNombre.charAt(0) : "F"}
        </div>
      );
    }
  }, []);

  // --- Fetching de datos (incluyendo tipos de convocatoria) ---
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const tiposResponse =
        await tipoConvocatoriaService.getAllTiposConvocatoria();
      const newTipoFondoMap = tiposResponse.reduce((map, tipo) => {
        map[tipo.id] = tipo.nombre;
        return map;
      }, {});
      setTipoFondoMap(newTipoFondoMap); // Guarda el mapa dinámico

      const fondosResponse = await fondosService.getAllFondos();

      const processedAndFilteredFondos = fondosResponse
        .map((fondo) => {
          fondo["tipo de fondo"] = newTipoFondoMap[fondo.tipo] || "Desconocido"; // Usa el mapa dinámico aquí
          return fondo;
        })
        .filter((fondo) => isFondoVigente(fondo));

      // **** ELIMINADO: Código del fondo de prueba ****

      setFondosActivos(processedAndFilteredFondos);
    } catch (e) {
      console.error("Error fetching data for Fondos Activos:", e);
      setError(
        e.message ||
          "Error desconocido al cargar los fondos activos y sus tipos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const timer = setInterval(
      () => {
        setCurrentDate(new Date());
      },
      1000 * 60 * 60 * 24
    );

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Fondos Activos
      </h3>

      {loading ? (
        <div className="flex justify-center items-center h-24">
          <Spinner size={32} className="text-[#2E5C8A]" />
        </div>
      ) : fondosActivos.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No hay fondos activos en este momento.
        </div>
      ) : (
        <div className="space-y-4">
          {fondosActivos.map((fondo) => (
            <div
              key={fondo.id}
              className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
            >
              {/* Solo renderiza el logo/iniciales */}
              {renderFondoIconOrLogo(fondo["tipo de fondo"])}

              <div className="flex-grow ">
                <h4 className="font-medium text-gray-900 text-base leading-tight">
                  {fondo.nombre}
                </h4>
                {/* Nombre del tipo de fondo debajo del nombre del fondo */}
                {fondo["tipo de fondo"] && (
                  <p className="text-[0.7rem] text-gray-500 uppercase leading-tight mb-2">
                    {fondo["tipo de fondo"]}
                  </p>
                )}

                <div className="flexflex-col justify-between w-full text-xs text-gray-600 mb-1">
                  <div className="flex items-center ">
                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                    <span>Cierre: {formatDate(fondo.cierre)}</span>
                  </div>

                  {getDaysRemaining(fondo.cierre) && (
                    <span className=" py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />{" "}
                      {getDaysRemaining(fondo.cierre)}
                    </span>
                  )}
                </div>

                <p className="text-xs mt-1 font-semibold text-green-600 flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-500" />
                  {fondo.financiamiento || "Monto no especificado"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
