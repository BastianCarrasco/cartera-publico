// src/components/dashboard/DashboardFilters.jsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function DashboardFilters({
  selectedEscuela,
  setSelectedEscuela,
  opcionesEscuela,
  selectedTematica,
  setSelectedTematica,
  opcionesTematica,
  selectedInstitucion,
  setSelectedInstitucion,
  opcionesInstitucion,
  selectedEstatus,
  setSelectedEstatus,
  opcionesEstatus,
  resetFilters,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <div>
        <label
          htmlFor="select-escuela"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Filtrar por Escuela
        </label>
        <Select onValueChange={setSelectedEscuela} value={selectedEscuela}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar Escuela" />
          </SelectTrigger>
          <SelectContent>
            {opcionesEscuela.map((opcion) => (
              <SelectItem key={opcion} value={opcion}>
                {opcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label
          htmlFor="select-tematica"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Filtrar por Temática
        </label>
        <Select onValueChange={setSelectedTematica} value={selectedTematica}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar Temática" />
          </SelectTrigger>
          <SelectContent>
            {opcionesTematica.map((opcion) => (
              <SelectItem key={opcion} value={opcion}>
                {opcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label
          htmlFor="select-institucion"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Filtrar por Tipo de Fondo
        </label>
        <Select
          onValueChange={setSelectedInstitucion}
          value={selectedInstitucion}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar Institución" />
          </SelectTrigger>
          <SelectContent>
            {opcionesInstitucion.map((opcion) => (
              <SelectItem key={opcion} value={opcion}>
                {opcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label
          htmlFor="select-estatus"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Filtrar por Estatus
        </label>
        <Select onValueChange={setSelectedEstatus} value={selectedEstatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los Estatus" />
          </SelectTrigger>
          <SelectContent>
            {opcionesEstatus.map((opcion) => (
              <SelectItem key={opcion} value={opcion}>
                {opcion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-1 flex items-end">
        <Button
          onClick={resetFilters}
          className="w-full cursor-pointer px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Limpiar Filtros
        </Button>
      </div>
    </div>
  );
}
