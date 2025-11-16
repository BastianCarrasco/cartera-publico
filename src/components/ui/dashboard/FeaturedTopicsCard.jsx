// src/components/dashboard/FeaturedTopicsCard.jsx

export function FeaturedTopicsCard({ tematicasDestacadas }) {
  return (
    <div className="bg-[#e1edfd] items-center rounded-xl p-6 text-gray-900 shadow-lg border border-gray-100">
      <h3 className="text-lg text-center font-semibold">
        Temáticas Destacadas
      </h3>
      <h3 className="text-sm text-gray-500 text-center font-semibold mb-4">
        Top 6 (por Proyecto)
      </h3>
      <div className="flex flex-col gap-2">
        {tematicasDestacadas.map((tematica, index) => (
          <span
            key={index}
            className="bg-slate-50 text-blue-800 px-3 py-1 rounded-full text-center text-sm font-medium"
          >
            {tematica}
          </span>
        ))}
      </div>
    </div>
  );
}
