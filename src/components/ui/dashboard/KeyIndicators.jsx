// src/components/dashboard/KeyIndicators.jsx
import {
  FileText,
  DollarSign,
  GraduationCap,
  Users,
  Building2,
  University,
} from "lucide-react";

export function KeyIndicators({ indicadores }) {
  const {
    proyectosEnCartera,
    montoFormulado,
    escuelasFIN,
    academicosInvolucrados,
  } = indicadores;

  const indicatorItems = [
    {
      label: "Proyectos en Cartera",
      value: proyectosEnCartera,
      icon: FileText,
    },
    {
      label: "MM$ Formulados",
      value: montoFormulado,
      icon: DollarSign,
    },
    {
      label: "Escuelas FIN",
      value: escuelasFIN,
      icon: GraduationCap,
    },
    {
      label: "Académicos Involucrados",
      value: academicosInvolucrados,
      icon: Users,
    },
    {
      label: "Empresas Partners",
      value: 12, // Valor fijo según tu código original
      icon: Building2,
    },
    {
      label: "Universidades Partners",
      value: 5, // Valor fijo según tu código original
      icon: University,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {indicatorItems.map((item, index) => (
        <div
          key={index}
          className="bg-[#e1edfd] rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-gray-600">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
          </div>
          <item.icon className="w-6 h-6 text-gray-700 opacity-70" />
        </div>
      ))}
    </div>
  );
}
