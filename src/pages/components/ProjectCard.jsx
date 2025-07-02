import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Users, // Para el líder del proyecto
  Tag, // Para temáticas (puede ser genérico)
  Calendar, // Para la fecha
  Zap, // Rayo para "Almacenamiento Energía"
  FlaskRound, // Para "Hidrógeno"
  Lightbulb, // Para "Contaminación Lumínica"
  Pickaxe,
  Dna,
  BatteryCharging,
  CircleDollarSign,
} from "lucide-react";

// Importaciones de logos (estas también podrían moverse a un archivo de constantes compartidas)
import anidLogo from "../../assets/tipos_convocatorias/anid_rojo_azul.png";
import corfoLogo from "../../assets/tipos_convocatorias/corfo2024.png";
import goreLogo from "../../assets/tipos_convocatorias/gore-valpo.jpg";
import sqmLogo from "../../assets/instituciones/sqm.png";
import codesserLogo from "../../assets/instituciones/logo-codesser2.png";
import pucvLogo from "../../assets/instituciones/pucv.svg";

const INSTITUCION_LOGOS = {
  ANID: anidLogo,
  CORFO: corfoLogo,
  "GORE-Valparaíso": goreLogo,
  SQM: sqmLogo,
  CODESSER: codesserLogo,
  PUCV: pucvLogo,
};

export const getStatusBadge = (estatus) => {
  const baseClasses =
    "px-2.5 py-1 rounded-full text-s font-medium whitespace-nowrap flex-shrink-0";
  let colorClasses = "";

  switch (estatus) {
    case "Postulado":
      colorClasses = "bg-blue-100 text-blue-700 border-blue-200 font-semibold";
      break;
    case "Perfil":
      colorClasses =
        "bg-yellow-100 text-yellow-700 border-yellow-200 font-semibold";
      break;
    case "Adjudicado":
      colorClasses =
        "bg-green-100 text-green-700 border-green-200 font-semibold";
      break;
    default:
      colorClasses = "bg-gray-100 text-gray-700 border-gray-200 font-semibold";
      break;
  }
  return (
    <Badge className={`${baseClasses} ${colorClasses}`}>
      <span>{estatus}</span>
    </Badge>
  );
};

export const getThematicBadge = (tematica) => {
  const baseClasses =
    "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium";
  let icon = <Tag className="h-4 w-4" />;
  let colorClasses = "bg-gray-100 text-gray-700";

  switch (tematica) {
    case "Almacenamiento Energía":
      icon = <Zap className="h-4 w-4" />;
      colorClasses = "bg-teal-100 text-teal-700";
      break;
    case "Hidrógeno":
      icon = <FlaskRound className="h-6 w-6" />;
      colorClasses = "bg-cyan-100 text-cyan-700";
      break;
    case "Contaminación Lumínica":
      icon = <Lightbulb className="h-4 w-4" />;
      colorClasses = "bg-yellow-100 text-yellow-700";
      break;
    case "Minería":
      icon = <Pickaxe className="h-4 w-4" />;
      colorClasses = "bg-orange-100 text-orange-700";
      break;
    case "Biotecnología":
      icon = <Dna className="h-4 w-4" />;
      colorClasses = "bg-purple-100 text-purple-700";
      break;
    case "Litio":
      icon = <BatteryCharging className="h-4 w-4" />;
      colorClasses = "bg-slate-100 text-slate-700";
      break;
    default:
      icon = <Tag className="h-4 w-4" />;
      colorClasses = "bg-gray-100 text-gray-700";
      break;
  }
  return (
    <Badge className={`${baseClasses} ${colorClasses}`}>
      {icon} {tematica}
    </Badge>
  );
};

export const renderInstitucionLogo = (nombreInstitucion) => {
  const logoSrc = INSTITUCION_LOGOS[nombreInstitucion];
  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={`${nombreInstitucion} Logo`}
        className="h-6 w-6 object-contain rounded-md border border-gray-200"
      />
    );
  } else if (
    nombreInstitucion === "PRIVADA" ||
    nombreInstitucion === "CODESSER" ||
    nombreInstitucion === "SQM"
  ) {
    return (
      <div className="h-5 w-5 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 text-[0.7rem] font-bold flex-shrink-0">
        {nombreInstitucion === "PRIVADA"
          ? "PRIV"
          : nombreInstitucion.substring(0, 4).toUpperCase()}
      </div>
    );
  }
  return null;
};

function ProjectCard({ project, academicosDelProyecto, onClick }) {
  // Added onClick prop

  const formatDateShort = (dateString) => {
    if (!dateString) return "Sin fecha";
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return "Fecha Inválida";
      const options = { month: "short", year: "numeric" };
      let formatted = date.toLocaleDateString("es-CL", options);
      formatted = formatted.replace(".", "");
      return formatted;
    } catch (e) {
      console.warn(
        "Invalid date string for ProjectCard (short format):",
        dateString,
        e
      );
      return "Fecha Inválida";
    }
  };

  const academicosNames =
    academicosDelProyecto && Array.isArray(academicosDelProyecto.profesores)
      ? academicosDelProyecto.profesores
          .map((p) => p.nombre_completo)
          .join(", ")
      : "N/A";

  return (
    <Card
      className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full cursor-pointer"
      onClick={onClick} // Agregamos el onClick aquí
    >
      <CardHeader className="bg-gradient-to-r from-[#2E5C8A] to-[#3A6FA7] p-4 flex-shrink-0">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-white leading-tight pr-4 flex-grow line-clamp-2">
            {project.nombre || "Nombre no disponible"}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {getThematicBadge(project.tematica)}
          {project.institucion && (
            <Badge className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {renderInstitucionLogo(project.institucion)}
              <span>{project.institucion}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        {/* Líder / Profesores */}
        <div className="flex items-center text-gray-700 text-sm mb-2">
          <Users className="h-4 w-4 mr-2 text-gray-500" />
          <div className="flex flex-col">
            <p className="font-medium text-gray-900">{academicosNames}</p>{" "}
            {/* Nombres de académicos */}
            <p className="text-xs text-gray-500">
              {project.unidad || "Sin información"}
            </p>{" "}
            {/* Unidad responsable */}
          </div>
        </div>
        {/* Monto y Tipo de Apoyo */}
        <div className="flex items-center text-gray-700 text-sm mb-2">
          <CircleDollarSign className="h-4 w-4 mr-2 text-gray-500" />
          <div className="flex flex-col">
            <p className="font-medium text-gray-900">
              ${project.monto.toLocaleString("es-CL")}
            </p>
            <p className="text-xs text-gray-500">
              {project.apoyo || "Sin información"} (
              {project.detalle_apoyo || "Sin información"})
            </p>
          </div>
        </div>
        {/* **** Nuevo contenedor Flexbox para la Fecha y el Badge al final **** */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          {" "}
          {/* mt-auto y pt-4 para empujar abajo y separar */}
          {/* Fecha de Postulación */}
          <div className="flex items-center text-gray-700 text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <p className="font-semibold">
              {formatDateShort(project.fecha_postulacion)}
            </p>
          </div>
          {/* Badge de estatus */}
          {getStatusBadge(project.estatus)}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
