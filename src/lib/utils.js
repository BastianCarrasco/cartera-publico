import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function exportarPDF(projects) {
  const fecha = new Date();
  const fechaStr = fecha
    .toLocaleDateString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-"); // Ejemplo: 22-06-202

  const doc = new jsPDF();

  // Título
  doc.text(`Cartera de Proyectos ${fechaStr}`, 14, 16);

  // Encabezados de la tabla
  const columns = [
    "Título",
    "Estado",
    "Temática",
    "Unidad Académica",
    "Líder",
    "Monto",
    "Tipo de Apoyo",
    "Fecha de Postulación",
    "Convocatoria",
  ];

  // Filas de la tabla
  const rows = projects.map((p) => [
    p.title,
    p.status,
    p.theme,
    p.academicUnit,
    p.leader,
    p.amount,
    p.supportType,
    p.applicationDate,
    p.call,
  ]);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 24,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [44, 92, 138] },
  });

  doc.save(`cartera_proyectos_${fechaStr}.pdf`);
}

export function exportarExcel(projects) {
  const fecha = new Date();
  const fechaStr = fecha
    .toLocaleDateString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-"); // Ejemplo: 22-06-202

  const ws = XLSX.utils.json_to_sheet(
    projects.map((p) => ({
      Título: p.title,
      Estado: p.status,
      Temática: p.theme,
      "Unidad Académica": p.academicUnit,
      Líder: p.leader,
      Monto: p.amount,
      "Tipo de Apoyo": p.supportType,
      "Fecha de Postulación": p.applicationDate,
      Convocatoria: p.call,
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Cartera de Proyectos ${fechaStr}`);
  XLSX.writeFile(wb, `cartera_proyectos_${fechaStr}.xlsx`);
}
