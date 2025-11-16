/**
 * Genera datos y opciones básicas para un gráfico de barras (Chart.js style).
 * @param {string[]} labels - Las etiquetas para el eje (X o Y según orientación).
 * @param {number[]} data - Los valores numéricos para cada barra.
 * @param {string} datasetLabel - La etiqueta para el dataset.
 * @param {string} chartTitle - Título del gráfico.
 * @param {"x" | "y"} [orientation="x"] - Dirección de la barra ("x" = vertical, "y" = horizontal).
 */
export function generateBarChartData(
  labels,
  data,
  datasetLabel,
  chartTitle,
  orientation = "x"
) {
  const chartData = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data,
        backgroundColor: "rgba(75, 192, 192, 0.6)", // color de las barras
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: orientation, // ← clave: "x" = vertical, "y" = horizontal
    plugins: {
      title: { display: true, text: chartTitle },
      legend: { display: true, position: "top" },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: orientation === "y" ? datasetLabel : "" },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: orientation === "x" ? datasetLabel : "" },
      },
    },
  };

  return { data: chartData, options: chartOptions };
}

/**
 * Genera datos desde un array de objetos con las propiedades 'nombre' y 'cantidad'.
 * @param {Array<{nombre: string, cantidad: number}>} rawData
 * @param {string} datasetLabel
 * @param {string} chartTitle
 * @param {"x" | "y"} orientation
 */
export function generateBarChartDataFromCategorical(
  rawData,
  datasetLabel,
  chartTitle,
  orientation = "x" // default: vertical
) {
  const labels = rawData.map((item) => item.nombre);
  const data = rawData.map((item) => item.cantidad);
  return generateBarChartData(
    labels,
    data,
    datasetLabel,
    chartTitle,
    orientation
  );
}

/**
 * Convierte un número a formato "millones" (MM$).
 * @param {number} amount - El monto numérico.
 * @returns {string} El monto formateado, por ejemplo "5.23 MM$".
 */
export function formatToMillions(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "N/A";
  return `${(amount / 1_000_000).toFixed(2)} MM$`;
}
