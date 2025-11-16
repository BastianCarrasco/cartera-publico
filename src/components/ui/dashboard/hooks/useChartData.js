// src/components/dashboard/hooks/useChartData.js
import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components once at the application entry or where charts are rendered
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const bluePalette = [
  "#2E5C8A", // Azul principal
  "#5D95C8", // Azul medio
  "#7CA3CB", // Azul claro
  "#3B82F6", // Azul acento
  "#1E3A5C", // Azul oscuro
  "#0F2A4A", // Más oscuro
  "#4A7A9F", // Intermedio
];

// Helper para agrupar y contar (duplicado pero necesario para los datos del gráfico si se filtran nuevamente aquí)
const groupAndCount = (data, key) => {
  const counts = {};
  data.forEach((item) => {
    const keyValue = item[`${key}_nombre`] || item[key];
    if (keyValue) {
      counts[keyValue] = (counts[keyValue] || 0) + 1;
    }
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

export const useChartData = (
  filteredProyectos,
  filteredProfesoresPorUnidad,
  filteredProyectosPorProfesor
) => {
  // #region Chart: Proyectos por Profesor
  const dataChartProyectosPorProfesor = useMemo(() => {
    if (
      !filteredProyectosPorProfesor ||
      filteredProyectosPorProfesor.length === 0
    ) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: filteredProyectosPorProfesor.map((d) => d.profesor),
      datasets: [
        {
          label: "Proyectos",
          data: filteredProyectosPorProfesor.map((d) => d.proyectos),
          backgroundColor: bluePalette[0],
        },
      ],
    };
  }, [filteredProyectosPorProfesor]);

  const optionsChartProyectosPorProfesor = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "x",
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.y !== null) label += context.parsed.y;
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: false },
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 45,
            font: { size: 11 },
          },
          grid: { display: false },
        },
        y: {
          title: { display: false },
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: "rgba(0, 0, 0, 0.05)" },
        },
      },
    }),
    []
  );
  // #endregion

  // #region Chart: Proyectos por Unidad Académica
  const filteredProyectosPorUnidad = useMemo(() => {
    return groupAndCount(filteredProyectos, "unidad")
      .map((item) => ({
        unidad: item.name,
        proyectos: item.value,
      }))
      .filter((d) => d.proyectos > 0)
      .sort((a, b) => b.proyectos - a.proyectos);
  }, [filteredProyectos]);

  const dataChartProyectosPorUnidad = useMemo(() => {
    if (
      !filteredProyectosPorUnidad ||
      filteredProyectosPorUnidad.length === 0
    ) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: filteredProyectosPorUnidad.map((d) => d.unidad),
      datasets: [
        {
          label: "Proyectos",
          data: filteredProyectosPorUnidad.map((d) => d.proyectos),
          backgroundColor: bluePalette[2],
        },
      ],
    };
  }, [filteredProyectosPorUnidad]);

  const optionsChartProyectosPorUnidad = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "x",
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.y !== null) label += context.parsed.y;
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 45,
            font: { size: 11 },
          },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: "rgba(0, 0, 0, 0.05)" },
        },
      },
    }),
    []
  );
  // #endregion

  // #region Chart: Profesores por Unidad Académica
  const chartProfesoresPorUnidadData = useMemo(() => {
    const dataProfesoresPorUnidad = filteredProfesoresPorUnidad
      .filter((item) => item.NumeroDeProfesores > 0)
      .map((item) => ({
        unidad: item.UnidadAcademica,
        profesores: item.NumeroDeProfesores,
      }))
      .sort((a, b) => b.profesores - a.profesores);

    if (!dataProfesoresPorUnidad || dataProfesoresPorUnidad.length === 0) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: dataProfesoresPorUnidad.map((d) => d.unidad),
      datasets: [
        {
          label: "Profesores",
          data: dataProfesoresPorUnidad.map((d) => d.profesores),
          backgroundColor: bluePalette[0],
        },
      ],
    };
  }, [filteredProfesoresPorUnidad]);

  const optionsChartProfesoresPorUnidad = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "x",
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.y !== null) label += context.parsed.y;
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 45,
            font: { size: 11 },
          },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: "rgba(0, 0, 0, 0.05)" },
        },
      },
    }),
    []
  );
  // #endregion

  // #region Chart: Proyectos por Temática (Horizontal Bar Chart)
  const filteredProyectosPorTematica = useMemo(() => {
    return groupAndCount(filteredProyectos, "tematica");
  }, [filteredProyectos]);

  const dataChartProyectosPorTematica = useMemo(() => {
    if (
      !filteredProyectosPorTematica ||
      filteredProyectosPorTematica.length === 0
    ) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: filteredProyectosPorTematica.map((d) => d.name),
      datasets: [
        {
          label: "Proyectos",
          data: filteredProyectosPorTematica.map((d) => d.value),
          backgroundColor: bluePalette[3],
        },
      ],
    };
  }, [filteredProyectosPorTematica]);

  const optionsChartProyectosPorTematica = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.x !== null) label += context.parsed.x;
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: "rgba(0, 0, 0, 0.05)" },
        },
        y: {
          ticks: { autoSkip: true, font: { size: 12 } },
          grid: { display: false },
        },
      },
    }),
    []
  );
  // #endregion

  // #region Chart: Proyectos por Tipo de Fondo (Horizontal Bar Chart)
  const filteredProyectosPorInstitucion = useMemo(() => {
    return groupAndCount(filteredProyectos, "institucion");
  }, [filteredProyectos]);

  const dataChartProyectosPorInstitucion = useMemo(() => {
    if (
      !filteredProyectosPorInstitucion ||
      filteredProyectosPorInstitucion.length === 0
    ) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: filteredProyectosPorInstitucion.map((d) => d.name),
      datasets: [
        {
          label: "Proyectos",
          data: filteredProyectosPorInstitucion.map((d) => d.value),
          backgroundColor: bluePalette[6],
        },
      ],
    };
  }, [filteredProyectosPorInstitucion]);

  const optionsChartProyectosPorInstitucion = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.x !== null) label += context.parsed.x;
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: "rgba(0, 0, 0, 0.05)" },
        },
        y: {
          ticks: { autoSkip: true, font: { size: 12 } },
          grid: { display: false },
        },
      },
    }),
    []
  );
  // #endregion

  return {
    dataChartProyectosPorProfesor,
    optionsChartProyectosPorProfesor,
    filteredProyectosPorUnidad, // Necesario para el componente de PDF, no para Chart.js directamente aquí
    dataChartProyectosPorUnidad,
    optionsChartProyectosPorUnidad,
    chartProfesoresPorUnidadData, // Renombrado para evitar confusión con el hook de filtros
    optionsChartProfesoresPorUnidad,
    filteredProyectosPorTematica, // Necesario para el componente de PDF, no para Chart.js directamente aquí
    dataChartProyectosPorTematica,
    optionsChartProyectosPorTematica,
    filteredProyectosPorInstitucion, // Necesario para el componente de PDF, no para Chart.js directamente aquí
    dataChartProyectosPorInstitucion,
    optionsChartProyectosPorInstitucion,
  };
};
