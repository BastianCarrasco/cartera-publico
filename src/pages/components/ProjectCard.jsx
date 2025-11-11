import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Users,
  Tag,
  Calendar,
  Zap,
  FlaskRound,
  Lightbulb,
  Pickaxe,
  Dna,
  BatteryCharging,
  CircleDollarSign,
  GraduationCap,
  Scale,
  Droplet,
  Plug,
  HeartPulse,
  Recycle,
  Utensils,
  Network,
  Atom,
  RadioTower,
  Code,
  Layers,
  RectangleGoggles,
  BookOpenCheck,
  Telescope,
  ShieldAlert,
  Radar,
} from "lucide-react";

// Importaciones de logos (estas también podrían moverse a un archivo de constantes compartidas)
import anidLogo from "../../assets/tipos_convocatorias/anid_rojo_azul.png";
import corfoLogo from "../../assets/tipos_convocatorias/corfo2024.png";
import goreLogo from "../../assets/tipos_convocatorias/gore-valpo.jpg";
import sqmLogo from "../../assets/instituciones/sqm.png";
import codesserLogo from "../../assets/instituciones/logo-codesser2.png";
import pucvLogo from "../../assets/instituciones/pucv.svg";
import logoLacnic from "../../assets/instituciones/Logo-LACNIC.png";
import armadaLogo from "../../assets/instituciones/armadaLogo.png";

const INSTITUCION_LOGOS = {
  ANID: anidLogo,
  CORFO: corfoLogo,
  "GORE-Valparaíso": goreLogo,
  "CORFO-Magallanes": corfoLogo, // Assuming CORFO-Magallanes uses the same CORFO logo
  SQM: sqmLogo,
  CODESSER: codesserLogo,
  PUCV: pucvLogo,
  LACNIC: logoLacnic,
  "Armada de Chile": armadaLogo,
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
  const iconClass = "h-6 w-6";
  let icon;
  let colorClasses = "bg-sky-200 text-gray-800";

  switch (tematica) {
    case "Almacenamiento Energía":
      icon = <Zap className={iconClass} />;
      break;
    case "Hidrógeno":
      icon = <FlaskRound className={iconClass} />;
      break;
    case "Contaminación Lumínica":
      icon = <Lightbulb className={iconClass} />;
      break;
    case "Educación":
      icon = <GraduationCap className={iconClass} />;
      break;
    case "Software":
      icon = <Code className={iconClass} />;
      break;
    case "Seguridad":
      icon = <ShieldAlert className={iconClass} />;
      break;
    case "Sensores":
      icon = <Radar className={iconClass} />;
      break;
    case "Minería":
      icon = <Pickaxe className={iconClass} />;
      break;
    case "Agua":
      icon = <Droplet className={iconClass} />;
      break;
    case "Energía":
      icon = <Plug className={iconClass} />;
      break;
    case "LegalTech":
      icon = <Scale className={iconClass} />;
      break;
    case "Salud":
      icon = <HeartPulse className={iconClass} />;
      break;
    case "Economía Circular":
      icon = <Recycle className={iconClass} />;
      break;
    case "Alimentos":
      icon = <Utensils className={iconClass} />;
      break;
    case "Interdisciplina":
      icon = <Network className={iconClass} />;
      break;
    case "Gemelos Digitales":
      icon = <Layers className={iconClass} />;
      break;
    case "Realidad Virtual":
      icon = <RectangleGoggles className={iconClass} />;
      break;
    case "Armonización Curricular":
      icon = <BookOpenCheck className={iconClass} />;
      break;
    case "Astronomía":
      icon = <Telescope className={iconClass} />;
      break;
    case "STEM":
      icon = <Atom className={iconClass} />;
      break;
    case "Telecomunicaciones":
      icon = <RadioTower className={iconClass} />;
      break;
    case "Biotecnología":
      icon = <Dna className={iconClass} />;
      break;
    case "Litio":
      icon = <BatteryCharging className={iconClass} />;
      break;
    default:
      icon = <Tag className={iconClass} />;
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
  } else if (nombreInstitucion === "PRIVADA") {
    return (
      <div className="h-5 w-5 flex items-center justify-center bg-gray-200 rounded-full text-gray-700 text-[0.7rem] font-bold flex-shrink-0">
        PRIV
      </div>
    );
  }
  return null;
};

function ProjectCard({
  project,
  academicosDelProyecto, // Still received but adapted from main component
  estudiantesDelProyecto, // Still received but adapted from main component
  onClick,
}) {
  const formatDateShort = (dateString) => {
    if (!dateString) return "Sin fecha";
    // Parse "sept-24" format
    const monthMap = {
      "ene-": "ene",
      "feb-": "feb",
      "mar-": "mar",
      "abr-": "abr",
      "may-": "may",
      "jun-": "jun",
      "jul-": "jul",
      "ago-": "ago",
      "sept-": "sept",
      "oct-": "oct",
      "nov-": "nov",
      "dic-": "dic",
    };

    const parts = dateString.split("-");
    if (parts.length === 2) {
      const monthStr = parts[0].toLowerCase();
      const yearStr = parts[1];
      if (monthMap[`${monthStr}-`]) {
        return `${
          monthMap[`${monthStr}-`].charAt(0).toUpperCase() +
          monthMap[`${monthStr}-`].slice(1).replace(".", "")
        }-${yearStr}`;
      }
    }
    // Fallback if not "MMM-YY" format
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha Inválida";
      const options = { month: "short", year: "numeric" };
      let formatted = date.toLocaleDateString("es-CL", options);
      formatted = formatted.replace(".", ""); // Remove period from short month
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

  // Academic names are now directly from project object or constructed from string props
  const academicosNames = [project.lider_academico, project.partner_academico]
    .filter(Boolean)
    .join(", ");

  const estudiantesNames = project.estudiantes || ""; // Students is a single string

  return (
    <Card
      className="relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full cursor-pointer"
      onClick={onClick}
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
            <p className="font-medium text-gray-900">
              {academicosNames || "Sin académicos involucrados"}
            </p>
            <p className="text-xs text-gray-500">
              {project.unidad || "Sin información"}
            </p>
          </div>
        </div>

        {/* Monto y Tipo de Apoyo */}
        <div className="flex items-center text-gray-700 text-sm mb-2">
          <CircleDollarSign className="h-4 w-4 mr-2 text-gray-500" />
          <div className="flex flex-col">
            <p className="font-medium text-gray-900">
              {project.monto !== null && project.monto !== undefined
                ? `$${project.monto.toLocaleString("es-CL")}`
                : "Sin información"}
            </p>
            <p className="text-xs text-gray-500">
              Apoyo {project.apoyo || "Sin información"} (
              {project.detalle_apoyo || "Sin información"})
            </p>
          </div>
        </div>

        {estudiantesNames.length > 0 && (
          <div className="flex items-center text-gray-700 text-sm mb-2">
            <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
            <div className="flex flex-col">
              <p className="font-medium text-gray-900">{estudiantesNames}</p>
              <p className="text-xs text-gray-500">Estudiantes Involucrados</p>
            </div>
          </div>
        )}
        {/* **** Nuevo contenedor Flexbox para la Fecha y el Badge al final **** */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
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
