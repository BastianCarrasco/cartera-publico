// src/components/dashboard/ExportPdfButton.jsx
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Importar directamente
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowDownToLine } from "lucide-react";

export function ExportPdfButton({
  estadisticasContentRef,
  filteredProyectosPorProfesor,
  filteredProyectosPorUnidad,
  filteredProfesoresPorUnidad,
  filteredProyectosPorTematica,
  filteredProyectosPorInstitucion,
  allInstrumentosForPdf,
  setErrorLocal,
}) {
  const [loadingExportPDF, setLoadingExportPDF] = useState(false);

  // Helper para formatear montos a MM$ (puede moverse a un archivo de utilidades si se usa en muchos sitios)
  const formatMM = (monto) => {
    if (monto === null || monto === undefined || isNaN(monto)) return "0 MM$";
    const numericMonto = parseFloat(monto);
    if (isNaN(numericMonto)) return "0 MM$";
    return `${(numericMonto / 1000000).toLocaleString("es-CL", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    })} MM$`;
  };

  const generarPDF = async () => {
    setLoadingExportPDF(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pdfWidth - margin * 2;

      // --- Página de los Gráficos (Imagen) ---
      const input = estadisticasContentRef.current;
      if (!input) {
        console.error("No se encontró el elemento para exportar a PDF.");
        setErrorLocal("Error al generar el PDF: No se encontró el contenido.");
        setLoadingExportPDF(false);
        return;
      }

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: true,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.8);

      let imgRatio = canvas.width / canvas.height;
      let imgDisplayWidth = contentWidth;
      let imgDisplayHeight = imgDisplayWidth / imgRatio;

      // Ajustar la imagen si es demasiado alta
      if (imgDisplayHeight > pdfHeight - margin * 2 - 30) {
        imgDisplayHeight = pdfHeight - margin * 2 - 30;
        imgDisplayWidth = imgDisplayHeight * imgRatio;
      }

      let yPos = margin + 30; // Inicia después del título y la fecha

      doc.setFontSize(12);
      doc.text("Estadísticas del Dashboard", pdfWidth / 2, margin + 10, {
        align: "center",
      });
      doc.setFontSize(10);
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateString = `${day}-${month}-${year}`;
      doc.text(
        `Fecha de Exportación: ${dateString}`,
        pdfWidth / 2,
        margin + 20,
        { align: "center" }
      );

      const startX = margin + (contentWidth - imgDisplayWidth) / 2;
      doc.addImage(
        imgData,
        "PNG",
        startX,
        yPos,
        imgDisplayWidth,
        imgDisplayHeight
      );

      // --- Sección de Datos Tabulares (Nuevas Páginas) ---
      doc.addPage();
      let currentY = margin + 10;

      const addSectionTitle = (titleText, color = [46, 92, 138]) => {
        if (currentY + 20 > pdfHeight - margin) {
          doc.addPage();
          currentY = margin + 10;
        }
        doc.setFontSize(14);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(titleText, margin, currentY);
        doc.setTextColor(0);
        currentY += 10;
      };

      // 1. Tabla de Proyectos por Profesor
      addSectionTitle("Datos: Proyectos por Profesor", [46, 92, 138]);
      if (filteredProyectosPorProfesor.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Profesor", "Proyectos"]],
          body: filteredProyectosPorProfesor.map((item) => [
            item.profesor,
            item.proyectos,
          ]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
          headStyles: {
            fillColor: [46, 92, 138],
            textColor: 255,
            fontStyle: "bold",
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          },
        });
      } else {
        doc.setFontSize(10);
        doc.text("No hay datos de proyectos por profesor.", margin, currentY);
        currentY += 10;
      }
      currentY += 10;

      // 2. Tabla de Proyectos por Unidad Académica
      addSectionTitle("Datos: Proyectos por Unidad Académica", [93, 149, 200]);
      if (filteredProyectosPorUnidad.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Unidad Académica", "Proyectos"]],
          body: filteredProyectosPorUnidad.map((item) => [
            item.unidad,
            item.proyectos,
          ]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
          headStyles: {
            fillColor: [93, 149, 200],
            textColor: 255,
            fontStyle: "bold",
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          },
        });
      } else {
        doc.setFontSize(10);
        doc.text(
          "No hay datos de proyectos por unidad académica.",
          margin,
          currentY
        );
        currentY += 10;
      }
      currentY += 10;

      // 3. Tabla de Profesores por Unidad Académica
      addSectionTitle("Datos: Profesores por Unidad Académica", [46, 92, 138]);
      if (filteredProfesoresPorUnidad.length > 0) {
        const dataProfesoresPorUnidadTable = filteredProfesoresPorUnidad
          .filter((item) => item.NumeroDeProfesores > 0)
          .map((item) => ({
            unidad: item.UnidadAcademica,
            profesores: item.NumeroDeProfesores,
          }))
          .sort((a, b) => b.profesores - a.profesores);

        autoTable(doc, {
          startY: currentY,
          head: [["Unidad Académica", "Profesores"]],
          body: dataProfesoresPorUnidadTable.map((item) => [
            item.unidad,
            item.profesores,
          ]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
          headStyles: {
            fillColor: [46, 92, 138],
            textColor: 255,
            fontStyle: "bold",
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          },
        });
      } else {
        doc.setFontSize(10);
        doc.text(
          "No hay datos de profesores por unidad académica.",
          margin,
          currentY
        );
        currentY += 10;
      }
      currentY += 10;

      // 4. Tabla de Proyectos por Temática
      addSectionTitle("Datos: Proyectos por Temática", [59, 130, 246]);
      if (filteredProyectosPorTematica.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Temática", "Proyectos"]],
          body: filteredProyectosPorTematica.map((item) => [
            item.name,
            item.value,
          ]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: "bold",
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          },
        });
      } else {
        doc.setFontSize(10);
        doc.text("No hay datos de proyectos por temática.", margin, currentY);
        currentY += 10;
      }
      currentY += 10;

      // 5. Tabla de Proyectos por Tipo de Fondo
      addSectionTitle("Datos: Proyectos por Tipo de Fondo", [30, 58, 92]);
      if (filteredProyectosPorInstitucion.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Tipo de Fondo", "Proyectos"]],
          body: filteredProyectosPorInstitucion.map((item) => [
            item.name,
            item.value,
          ]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
          headStyles: {
            fillColor: [30, 58, 92],
            textColor: 255,
            fontStyle: "bold",
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          },
        });
      } else {
        doc.setFontSize(10);
        doc.text(
          "No hay datos de proyectos por tipo de fondo.",
          margin,
          currentY
        );
        currentY += 10;
      }
      currentY += 10;

      // 6. Tabla de Instrumentos Postulados (todos)
      addSectionTitle("Datos: Instrumentos Postulados (Todos)", [74, 122, 159]);
      if (allInstrumentosForPdf.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [["Instrumento", "Monto Formulados"]],
          body: allInstrumentosForPdf.map((item) => [
            item.name,
            item.montoFormatted,
          ]),
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
          headStyles: {
            fillColor: [74, 122, 159],
            textColor: 255,
            fontStyle: "bold",
          },
          didDrawPage: (data) => {
            currentY = data.cursor.y + 10;
          },
        });
      } else {
        doc.setFontSize(10);
        doc.text(
          "No hay instrumentos postulados disponibles.",
          margin,
          currentY
        );
        currentY += 10;
      }

      const filename = `estadisticas_dashboard_${day}-${month}-${year}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      setErrorLocal("Error al generar el PDF. Intente de nuevo más tarde.");
    } finally {
      setLoadingExportPDF(false);
    }
  };

  return (
    <Button
      variant="secondary"
      className="bg-red-500 text-md text-white hover:bg-red-600 cursor-pointer"
      onClick={generarPDF}
      disabled={loadingExportPDF}
    >
      {loadingExportPDF ? (
        <Spinner size={16} className="text-white mr-2" />
      ) : (
        <ArrowDownToLine className="w-5 h-5 mr-2" />
      )}
      Exportar a PDF
    </Button>
  );
}
