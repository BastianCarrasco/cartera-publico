// src/pages/AnadirProyectosPage.jsx
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Save,
  UserPlus,
  ArrowLeft,
  FolderPlus,
  CircleDollarSign,
  Tag,
  Wallet,
  MessageSquareText,
  Calendar,
  Landmark,
  Pin,
  Megaphone, // Icono para Convocatoria (Input)
  Building, // Para Institución Convocatoria
  School, // Para Unidad Académica
  Users, // Para Académicos
  User, // Para el Jefe Académico (o UserCog)
} from "lucide-react"; // Importar iconos de Lucide
import { useNavigate } from "react-router-dom";

import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, Info, Search } from "lucide-react";

import { useError } from "@/contexts/ErrorContext";

import proyectosService from "../api/proyectos.js";
import funcionesService from "../api/funciones.js"; // Para academicosPorProyecto (si se usa)
import unidadesAcademicasService from "../api/unidadesacademicas.js";
import estatusService from "../api/estatus.js";
import institucionesConvocatoriaService from "../api/institucionconvocatoria.js";
import apoyosService from "../api/apoyos.js";
import tematicasService from "../api/tematicas.js";
import tagsService from "../api/tags.js"; // Se mantiene por si se usa en el futuro, aunque no para detalle_apoyo
import tipoConvocatoriaService from "../api/tipoconvocatoria.js";
import academicosService from "../api/academicos.js";

export default function AnadirProyectosPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    comentarios: "",
    monto: "",
    id_tematica: null,
    apoyo: null, // ID numérico de apoyo
    detalle_apoyo: "", // SIEMPRE texto libre
    fecha_postulacion: "",
    id_estatus: null, // ID numérico del estatus
    convocatoria: "", // AHORA ES INPUT DE TEXTO LIBRE
    tipo_convocatoria: null, // ID numérico del tipo de convocatoria
    inst_conv: null, // ID numérico de la institución de la convocatoria
    unidad: null, // ID numérico de la unidad
    // `academicos` en `formData` ya no será un array completo, se gestionará por `selectedAcademics` y `jefeAcademico`
    jefe_academico: null, // ID del jefe académico
  });

  const [selectedAcademics, setSelectedAcademics] = useState([]); // Array de IDs de académicos NO jefe
  // Campos `customAcademic` y `showCustomAcademic` ya no son necesarios si solo seleccionamos de lookup
  const [customAcademic, setCustomAcademic] = useState("");
  const [showCustomAcademic, setShowCustomAcademic] = useState(false);

  // --- Estados para los datos de los Select (lookups) de la API ---
  const [unidadesLookup, setUnidadesLookup] = useState([]);
  const [estatusLookup, setEstatusLookup] = useState([]);
  const [institucionesLookup, setInstitucionesLookup] = useState([]);
  const [apoyosLookup, setApoyosLookup] = useState([]);
  const [tematicasLookup, setTematicasLookup] = useState([]);
  const [tagsLookup, setTagsLookup] = useState([]); // Se mantiene, pero no usado para detalle_apoyo
  const [tipoConvocatoriasLookup, setTipoConvocatoriasLookup] = useState([]);

  const [academicosGeneralesLookup, setAcademicosGeneralesLookup] = useState(
    []
  );
  const [academicosMap, setAcademicosMap] = useState({}); // Mapa para IDs de académico a nombres completos

  // --- Mapas auxiliares ---
  const [apoyosMap, setApoyosMap] = useState({}); // id_apoyo -> nombre_apoyo (ej. TOTAL/PARCIAL)

  // --- Estados de carga y error generales del formulario ---
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [errorLookups, setErrorLookups] = useState(null);
  const { setError: setErrorGlobal } = useError();

  const [academicSearchTerm, setAcademicSearchTerm] = useState("");

  // --- Handlers de Académicos Seleccionados ---
  const handleAddAcademic = (academicId) => {
    // academicId será el ID numérico
    if (
      academicId &&
      !selectedAcademics.includes(academicId) &&
      academicId !== formData.jefe_academico
    ) {
      setSelectedAcademics((prevSelected) => [...prevSelected, academicId]);
      setAcademicSearchTerm(""); // Limpiar el término de búsqueda después de seleccionar
    } else if (academicId === formData.jefe_academico) {
      setErrorGlobal({
        type: "error", // Forzar a tipo error si falló
        title: "El académico seleccionado ya es el Jefe Académico.",
      });
    }
  };

  const handleRemoveAcademic = (academicId) => {
    // academicId será el ID numérico
    setSelectedAcademics((prevSelected) =>
      prevSelected.filter((id) => id !== academicId)
    );
  };

  // handleAddCustomAcademic ya no es relevante si solo seleccionamos de lista
  const handleAddCustomAcademic = () => {
    /* No usado */
  };

  // --- Fetching de todos los datos de lookups para los Selects ---
  const fetchLookupsData = async () => {
    setLoadingLookups(true);
    setErrorLookups(null);
    setErrorGlobal(null);
    try {
      const [
        unidadesRes,
        estatusRes,
        institucionesRes,
        apoyosRes,
        tematicasRes,
        tagsRes,
        tipoConvocatoriasRes,
        academicosGeneralesApiRes,
      ] = await Promise.all([
        unidadesAcademicasService.getAllUnidadesAcademicas(),
        estatusService.getAllEstatus(),
        institucionesConvocatoriaService.getAllInstitucionesConvocatoria(),
        apoyosService.getAllApoyos(),
        tematicasService.getAllTematicas(),
        tagsService.getAllTags(),
        tipoConvocatoriaService.getAllTiposConvocatoria(),
        academicosService.getAllAcademicos(),
      ]);

      setUnidadesLookup(unidadesRes);
      setEstatusLookup(estatusRes);
      setInstitucionesLookup(institucionesRes);
      setTematicasLookup(tematicasRes);
      setTagsLookup(tagsRes); // TagsLookup se carga pero no se usa en detalle_apoyo ahora
      setTipoConvocatoriasLookup(tipoConvocatoriasRes);

      const processedAcademicosGenerales = academicosGeneralesApiRes
        .map((acad) => ({
          id_academico: acad.id_academico,
          nombre_completo:
            `${acad.nombre} ${acad.a_paterno || ""} ${acad.a_materno || ""}`.trim(),
        }))
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
      setAcademicosGeneralesLookup(processedAcademicosGenerales);

      const newAcademicosMap = processedAcademicosGenerales.reduce(
        (map, acad) => {
          map[acad.id_academico] = acad.nombre_completo;
          return map;
        },
        {}
      );
      setAcademicosMap(newAcademicosMap);

      const newApoyosMap = apoyosRes.reduce((map, apoyo) => {
        map[apoyo.id_apoyo] = apoyo.nombre;
        return map;
      }, {});
      setApoyosMap(newApoyosMap);
      setApoyosLookup(apoyosRes);
    } catch (err) {
      console.error("Error fetching lookup data:", err);
      setErrorGlobal({
        type: "error", // Forzar a tipo error si falló
        title: "Error al cargar las opciones del formulario.",
      });
    } finally {
      setLoadingLookups(false);
    }
  };

  useEffect(() => {
    fetchLookupsData();
  }, []);

  // Función para manejar el guardado del proyecto
  const handleSaveProject = async () => {
    // Validaciones básicas de formulario
    if (
      !formData.nombre || // Nombre es obligatorio
      !formData.fecha_postulacion || // Fecha de Postulación es obligatoria
      formData.id_estatus === null // Estatus (ID) es obligatorio
    ) {
      setErrorGlobal({
        type: "error", // Forzar a tipo error si falló
        title: "Por favor, complete todos los campos obligatorios.",
      });
      return;
    }

    setLoadingLookups(true); // Usamos loadingLookups para indicar que el formulario está en proceso
    setErrorLookups(null);
    setErrorGlobal(null);

    try {
      // Construir el array de académicos para el POST
      const academicosParaPost = [];
      // Añadir jefe académico
      if (formData.jefe_academico) {
        academicosParaPost.push({ id: formData.jefe_academico, jefe: true });
      }
      // Añadir otros académicos
      selectedAcademics.forEach((id) => {
        if (id !== formData.jefe_academico) {
          // Asegurarse de no duplicar al jefe si está en ambas listas
          academicosParaPost.push({ id: id, jefe: false });
        }
      });

      const projectToSave = {
        nombre: formData.nombre,
        comentarios: formData.comentarios || null,
        monto: formData.monto ? parseFloat(formData.monto) : 0,
        fecha_postulacion: formData.fecha_postulacion
          ? new Date(formData.fecha_postulacion).toISOString()
          : null,
        unidad: formData.unidad,
        id_tematica: formData.id_tematica,
        id_estatus: formData.id_estatus,
        // id_kth: formData.id_kth || null, // Eliminado id_kth
        convocatoria: formData.convocatoria || null, // Nombre string de la convocatoria
        tipo_convocatoria: formData.tipo_convocatoria,
        inst_conv: formData.inst_conv,
        detalle_apoyo: formData.detalle_apoyo || null, // Texto libre
        apoyo: formData.apoyo,
        academicos: academicosParaPost, // Array de objetos {id, jefe}
      };

      const response = await proyectosService.crearProyecto(projectToSave);

      setTimeout(() => {
        setErrorGlobal({
          type: "success",
          title: "Proyecto guardado exitosamente!",
        });
        navigate("/editar-proyectos"); // Redirige a la página principal
      }, 3000); // 3000 milisegundos = 3 segundos
    } catch (err) {
      console.error("Error guardando proyecto:", err);
      setErrorLookups(
        err.message || "Error desconocido al guardar el proyecto."
      );
      setErrorGlobal({
        type: "error", // Forzar a tipo error si falló
        title: "No se ha podido guardar el proyecto",
      });
    } finally {
      setLoadingLookups(false);
    }
  };

  // Lógica de filtrado para el Select de Académicos
  // `filteredAcademicsOptions` para el Select de Académicos (sin el jefe ya seleccionado)
  const filteredAcademicsOptions = academicosGeneralesLookup.filter(
    (academic) =>
      // Excluir académicos ya seleccionados (incluido el jefe si está en la lista)
      !selectedAcademics.includes(academic.id_academico) &&
      academic.id_academico !== formData.jefe_academico && // Excluir también al jefe del select de otros académicos
      academic.nombre_completo
        .toLowerCase()
        .includes(academicSearchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 px-4 sm:px-6 lg:px-8 py-12">
      {/* Mensaje de carga/error global (sin cambios) */}
      {loadingLookups && (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
          <Spinner size={64} className="text-[#2E5C8A] mb-4" />
          <p className="text-lg text-gray-600">Cargando...</p>
        </div>
      )}
      {errorLookups && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error de Formulario</AlertTitle>
            <AlertDescription>{errorLookups}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Añadir proyecto
            </h1>
            <p className="text-gray-600">
              Complete la información del nuevo proyecto
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              <div>
                <div className="flex gap-1">
                  <FolderPlus strokeWidth={1.5} size={20} />
                  <Label
                    htmlFor="nombre"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nombre del Proyecto
                  </Label>
                </div>
                <Input
                  id="nombre"
                  placeholder="Ingrese el nombre del proyecto"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="mt-1 full"
                />
                <p className="mt-1 text-xs text-blue-600">
                  Este campo es obligatorio
                </p>
              </div>

              <div>
                <div className="flex gap-1">
                  <Pin strokeWidth={1.5} size={20} />
                  <Label className="text-sm font-medium text-gray-700">
                    Estatus
                  </Label>
                </div>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, id_estatus: value })
                  }
                  value={formData.id_estatus || ""}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Seleccione un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estatusLookup.map((status) => (
                      <SelectItem
                        key={status.id_estatus}
                        value={status.id_estatus}
                      >
                        {status.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-blue-600">
                  Este campo es obligatorio
                </p>
              </div>

              <div>
                <div className="flex gap-1">
                  <Calendar strokeWidth={1.5} size={20} />
                  <Label
                    htmlFor="fecha_postulacion"
                    className="text-sm font-medium text-gray-700"
                  >
                    Fecha de Ingreso
                  </Label>
                </div>
                <Input
                  id="fecha_postulacion"
                  type="date"
                  value={formData.fecha_postulacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fecha_postulacion: e.target.value,
                    })
                  }
                  className="mt-1 w-full"
                />
                <p className="mt-1 text-xs text-blue-600">
                  Este campo es obligatorio
                </p>
              </div>

              <div>
                <div className="flex gap-1">
                  <Tag strokeWidth={1.5} size={20} />
                  <Label className="text-sm font-medium text-gray-700">
                    Temática
                  </Label>
                </div>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, id_tematica: value })
                  }
                  value={formData.id_tematica || ""}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Seleccione una temática" />
                  </SelectTrigger>
                  <SelectContent>
                    {tematicasLookup.map((theme) => (
                      <SelectItem
                        key={theme.id_tematica}
                        value={theme.id_tematica}
                      >
                        {theme.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex gap-1">
                  <Wallet strokeWidth={1.5} size={20} />
                  <Label className="text-sm font-medium text-gray-700">
                    Tipo(s) de Apoyo
                  </Label>
                </div>
                <div className="mt-2 space-y-2">
                  <Select
                    onValueChange={(value) =>
                      setFormData({ ...formData, apoyo: value })
                    }
                    value={formData.apoyo || ""}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Seleccione tipo de apoyo" />
                    </SelectTrigger>
                    <SelectContent>
                      {apoyosLookup.map((apoyo) => (
                        <SelectItem key={apoyo.id_apoyo} value={apoyo.id_apoyo}>
                          {apoyo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Detalle de Apoyo: Siempre Input de texto libre */}
                  {/* Se muestra si el apoyo es PARCIAL u OTRO, o siempre si deseas */}
                  {/* He puesto la condición para que aparezca sólo si hay apoyo seleccionado, si no, es 'null' */}
                  {formData.apoyo !== null && (
                    <div>
                      <Label
                        htmlFor="detalle_apoyo"
                        className="text-sm font-medium text-gray-700 mt-4"
                      >
                        Detalle Apoyo
                      </Label>
                      <Input
                        id="detalle_apoyo"
                        placeholder="Ingrese detalle de apoyo"
                        value={formData.detalle_apoyo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            detalle_apoyo: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Comentarios (descomentado para uso) */}
              <div>
                <div className="flex gap-1">
                  <MessageSquareText strokeWidth={1.5} size={20} />
                  <Label
                    htmlFor="comentarios"
                    className="text-sm font-medium text-gray-700"
                  >
                    Comentarios
                  </Label>
                </div>

                <Textarea
                  id="comentarios"
                  placeholder="Agregue comentarios relevantes"
                  value={formData.comentarios}
                  onChange={(e) =>
                    setFormData({ ...formData, comentarios: e.target.value })
                  }
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              <div>
                <div className="flex gap-1">
                  <CircleDollarSign strokeWidth={1.5} size={20} />
                  <Label
                    htmlFor="monto"
                    className="text-sm font-medium text-gray-700"
                  >
                    Monto
                  </Label>
                </div>
                <Input
                  id="monto"
                  type="number"
                  placeholder="Sin signo $"
                  value={formData.monto}
                  onChange={(e) =>
                    setFormData({ ...formData, monto: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <div className="flex gap-1">
                  <Megaphone strokeWidth={1.5} size={20} />
                  <Label className="text-sm font-medium text-gray-700">
                    Nombre de Convocatoria
                  </Label>{" "}
                  {/* Cambiado el Label */}
                </div>
                <Input // AHORA ES UN INPUT DE TEXTO LIBRE
                  id="convocatoria_nombre"
                  placeholder="Ingrese el nombre de la convocatoria"
                  value={formData.convocatoria}
                  onChange={(e) =>
                    setFormData({ ...formData, convocatoria: e.target.value })
                  }
                  className="mt-1  w-full"
                />
              </div>

              <div>
                <div className="flex gap-1">
                  <Tag strokeWidth={1.5} size={20} />{" "}
                  {/* Nuevo icono para Tipo Convocatoria */}
                  <Label className="text-sm font-medium text-gray-700">
                    Tipo de Convocatoria
                  </Label>{" "}
                  {/* Cambiado el Label */}
                </div>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo_convocatoria: value })
                  }
                  value={formData.tipo_convocatoria || ""}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Seleccione un tipo de convocatoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoConvocatoriasLookup.map((conv) => (
                      <SelectItem key={conv.id} value={conv.id}>
                        {conv.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex gap-1">
                  <Landmark strokeWidth={1.5} size={20} />
                  <Label className="text-sm font-medium text-gray-700">
                    Institución Convocatoria
                  </Label>
                </div>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, inst_conv: value })
                  }
                  value={formData.inst_conv || ""}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Seleccione institución" />
                  </SelectTrigger>
                  <SelectContent>
                    {institucionesLookup.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex gap-1">
                  <School strokeWidth={1.5} size={20} />
                  <Label className="text-sm font-medium text-gray-700">
                    Unidad Académica
                  </Label>
                </div>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, unidad: value })
                  }
                  value={formData.unidad || ""}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Seleccione una unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesLookup.map((unit) => (
                      <SelectItem key={unit.id_unidad} value={unit.id_unidad}>
                        {unit.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* JEFE ACADÉMICO */}
              <div>
                <div className="flex gap-1">
                  <User strokeWidth={1.5} size={20} /> {/* O UserCog */}
                  <Label className="text-sm font-medium text-gray-700">
                    Académico Jefe de Proyecto
                  </Label>
                </div>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, jefe_academico: value })
                  }
                  value={formData.jefe_academico || ""}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Seleccione un jefe académico" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicosGeneralesLookup.map((academic) => (
                      <SelectItem
                        key={academic.id_academico}
                        value={academic.id_academico}
                      >
                        {academic.nombre_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* OTROS ACADÉMICOS */}
              <div>
                <div className="flex gap-1">
                  <Users strokeWidth={1.5} size={20} />
                  <Label className="text-sm font-medium text-gray-700">
                    Otros Académicos Participantes
                  </Label>
                </div>
                <Select
                  onValueChange={handleAddAcademic}
                  value={academicSearchTerm} // Muestra el término de búsqueda
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Seleccione académicos adicionales" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Input de búsqueda dentro del SelectContent */}
                    <div className="relative px-2 py-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Buscar académico..."
                        className="pl-8 py-2 text-sm"
                        value={academicSearchTerm}
                        onChange={(e) => setAcademicSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="my-1 border-t border-gray-200"></div>
                    {loadingLookups ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Spinner size={16} className="text-gray-800" />{" "}
                          Cargando académicos...
                        </div>
                      </SelectItem>
                    ) : filteredAcademicsOptions.length === 0 ? (
                      <SelectItem value="no-data" disabled>
                        No hay académicos disponibles.
                      </SelectItem>
                    ) : (
                      filteredAcademicsOptions.map((academic) => (
                        <SelectItem
                          key={academic.id_academico}
                          value={academic.id_academico}
                        >
                          {academic.nombre_completo}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {/* Académicos seleccionados (badges) */}
                {selectedAcademics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedAcademics.map(
                      (academicId) =>
                        academicosMap[academicId] && (
                          <Badge
                            key={academicId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {academicosMap[academicId]}{" "}
                            <Button
                              onClick={() => handleRemoveAcademic(academicId)}
                              className="bg-gray-600 ml-1 w-6 h-6"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-8 border-t mt-8">
            <Button
              variant="outline"
              onClick={() => navigate("/visualizacion")}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#2E5C8A] hover:bg-[#1E4A6F]"
              onClick={handleSaveProject}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Proyecto
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
