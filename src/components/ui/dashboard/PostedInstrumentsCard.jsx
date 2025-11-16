// src/components/dashboard/PostedInstrumentsCard.jsx
import { renderInstitucionLogo } from "../../../pages/components/ProjectCard";

export function PostedInstrumentsCard({ instrumentosPostulados }) {
  return (
    <div className="bg-[#e1edfd] rounded-xl p-6 text-gray-900 shadow-lg border border-gray-100">
      <h3 className="text-lg text-center font-semibold">
        Instrumentos Postulados
      </h3>
      <h3 className="text-sm text-gray-500 text-center font-semibold mb-4">
        Top 5 (por Monto)
      </h3>
      <div className="flex flex-col ">
        {instrumentosPostulados.map((instrumento, index) => (
          <div key={index} className="flex items-center mb-2 gap-4">
            {renderInstitucionLogo(instrumento.name || "")}
            <span className="flex-grow">
              {instrumento.name || "Sin información"}
            </span>
            <span className="font-semibold">{instrumento.montoFormatted}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
