import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Sidebar from "./pages/components/Sidebar";

// Páginas que SÍ quedan
import HomePage from "./pages/HomePage";
import VisualizacionPage from "./pages/VisualizacionPage"; // <- esta será "Ver Cartera"
import EstadisticasPage from "./pages/EstadisticasPage";
import FondosPage from "./pages/FondosPage";

import { LoadingProvider } from "./contexts/LoadingContext";
import { ErrorProvider } from "./contexts/ErrorContext";
import { ProyectosProvider } from "./contexts/ProyectosContext";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveSidebarItem = () => {
    const currentPath = location.pathname;

    if (currentPath === "/") return "home";
    if (currentPath.startsWith("/cartera")) return "cartera";
    if (currentPath.startsWith("/estadisticas")) return "estadisticas";
    if (currentPath.startsWith("/fondos")) return "fondos";

    return "home";
  };

  const activeSidebarItem = getActiveSidebarItem();

  const handleSidebarNavigation = (item) => {
    switch (item) {
      case "home":
        navigate("/");
        break;
      case "cartera":
        navigate("/cartera");
        break;
      case "estadisticas":
        navigate("/estadisticas");
        break;
      case "fondos":
        navigate("/fondos");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar
        activeItem={activeSidebarItem}
        onNavItemClick={handleSidebarNavigation}
      />

      <main className="flex-grow ml-64">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cartera" element={<VisualizacionPage />} />
          <Route path="/estadisticas" element={<EstadisticasPage />} />
          <Route path="/fondos" element={<FondosPage />} />
          <Route path="*" element={<div>Página no encontrada (404)</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ErrorProvider>
        <LoadingProvider>
          <ProyectosProvider>
            <AppContent />
          </ProyectosProvider>
        </LoadingProvider>
      </ErrorProvider>
    </Router>
  );
}
