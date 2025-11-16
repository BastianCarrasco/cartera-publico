// src/components/dashboard/DashboardBarChart.jsx
import { Bar } from "react-chartjs-2";

export function DashboardBarChart({
  title,
  description,
  insight,
  data,
  options,
  hasData,
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
      <h4 className="text-sm text-gray-600">
        <strong>Datos que muestra:</strong> {description}
      </h4>
      <h4 className="text-sm text-gray-600 mb-4">
        <strong>Insight principal:</strong> {insight}
      </h4>
      <div className="h-80 flex items-center justify-center">
        {hasData ? (
          <Bar data={data} options={options} />
        ) : (
          <p className="text-gray-500">
            No hay datos disponibles para la selección actual.
          </p>
        )}
      </div>
    </div>
  );
}
