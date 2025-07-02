// src/components/Navbar.jsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Importar Sheet para menú responsivo
import {
  BarChart3,
  Home,
  FileText,
  User,
  ChevronDown,
  BarChart,
  DollarSign,
  ClipboardList,
  Plus,
  Edit,
  Menu, // Icono para el menú hamburguesa
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavItemClick = (path) => {
    navigate(path);
  };

  const isActive = (paths) => {
    const pathArray = Array.isArray(paths) ? paths : [paths];
    return pathArray.some((path) => location.pathname === path);
  };

  return (
    <header className="bg-[#2E5C8A] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Título de la Aplicación */}
          <div
            className="flex items-center space-x-2 gap-2 group cursor-pointer flex-shrink-0" /* Añadido flex-shrink-0 */
            onClick={() => handleNavItemClick("/")}
          >
            <div className="text-white font-bold text-xl hidden sm:block">
              Formulación de Proyectos I+D
            </div>
          </div>

          {/* Navegación Principal (oculta en móvil) */}
          <nav className="hidden md:flex space-x-6">
            <Button
              variant="ghost"
              className={`text-white cursor-pointer hover:bg-white/10 hover:text-white ${
                isActive("/") ? "bg-white/10" : ""
              }`}
              onClick={() => handleNavItemClick("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </Button>
            <Button
              variant="ghost"
              className={`text-white cursor-pointer hover:bg-white/10 hover:text-white ${
                isActive("/visualizacion") ? "bg-white/10" : ""
              }`}
              onClick={() => handleNavItemClick("/visualizacion")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Visualización
            </Button>

            {/* Dropdown para "Perfiles de proyecto" */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`text-white cursor-pointer hover:bg-white/10 hover:text-white ${
                    isActive(["/estadisticas", "/fondos"]) ? "bg-white/10" : ""
                  }`}
                >
                  <User className="w-4 h-4 mr-2" />
                  Perfiles de proyecto
                  <ChevronDown className="w-4 h-4 ml-1 -mr-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white shadow-lg rounded-md mt-2">
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                  onClick={() => handleNavItemClick("/estadisticas")}
                >
                  <BarChart className="w-4 h-4 mr-2 text-gray-700" />
                  Estadísticas
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                  onClick={() => handleNavItemClick("/fondos")}
                >
                  <DollarSign className="w-4 h-4 mr-2 text-gray-700" />
                  Fondos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Menú Hamburguesa para móvil */}
          <div className="md:hidden">
            {" "}
            {/* Solo visible en móvil */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                {" "}
                {/* Menú lateral que sale de la izquierda */}
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold">Menú</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Button
                    variant="ghost"
                    className={`text-gray-700 justify-start ${isActive("/") ? "bg-gray-100" : ""}`}
                    onClick={() => {
                      handleNavItemClick("/");
                    }}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Inicio
                  </Button>
                  <Button
                    variant="ghost"
                    className={`text-gray-700 justify-start ${isActive("/visualizacion") ? "bg-gray-100" : ""}`}
                    onClick={() => {
                      handleNavItemClick("/visualizacion");
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Visualización
                  </Button>

                  {/* Elementos del Dropdown "Perfiles de proyecto" como botones directos en móvil */}
                  <h4 className="px-4 py-2 text-sm font-semibold text-gray-500">
                    Perfiles de proyecto
                  </h4>
                  <Button
                    variant="ghost"
                    className={`text-gray-700 justify-start pl-8 ${isActive("/estadisticas") ? "bg-gray-100" : ""}`}
                    onClick={() => {
                      handleNavItemClick("/estadisticas");
                    }}
                  >
                    <BarChart className="w-4 h-4 mr-2" />
                    Estadísticas
                  </Button>
                  <Button
                    variant="ghost"
                    className={`text-gray-700 justify-start pl-8 ${isActive("/fondos") ? "bg-gray-100" : ""}`}
                    onClick={() => {
                      handleNavItemClick("/fondos");
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Fondos
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
