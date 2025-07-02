// src/contexts/ErrorContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XCircle, CheckCircle, Info } from "lucide-react"; // Importar CheckCircle para éxito
import { Button } from "@/components/ui/button";

const ErrorContext = createContext(null);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  // `message` puede ser un string o un objeto `{ type: 'error'|'success'|'info', title: '...', description: '...' }`
  const [alertState, setAlertState] = useState(null);
  const timerRef = useRef(null);

  // Función para mostrar el mensaje (puede ser {type, title, description} o solo description como string)
  const showAlert = useCallback((message, duration = 5000) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    let stateToSet;
    if (typeof message === "string") {
      stateToSet = { type: "error", title: "Error!", description: message }; // Default a error si es solo string
    } else {
      stateToSet = message; // Se espera { type, title, description }
    }

    setAlertState(stateToSet);

    timerRef.current = setTimeout(() => {
      setAlertState(null);
    }, duration);
  }, []);

  const clearAlert = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAlertState(null);
  }, []);

  // Determinar el `variant` y el icono basado en el `type`
  const getAlertProps = (type) => {
    switch (type) {
      case "success":
        return {
          variant: "default",
          icon: <CheckCircle className="h-4 w-4" />,
        }; // O variant="success" si lo tienes
      case "info":
        return {
          variant: "default",
          icon: <Info className="h-4 w-4" />,

        };
      default:
        return {
          variant: "destructive",
          icon: <XCircle className="h-4 w-4" />,

        };
    }
  };

  const { variant, icon, defaultTitle } = getAlertProps(alertState?.type);

  return (
    <ErrorContext.Provider
      value={{ setError: showAlert, clearError: clearAlert }}
    >
      {children}
      {alertState && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-fade-in-down">
          <Alert variant={variant}>
            {icon}
            <AlertTitle>{alertState.title || defaultTitle}</AlertTitle>
            <AlertDescription>{alertState.description}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 text-current hover:bg-opacity-10" // Color del texto actual para la X
              onClick={clearAlert}
            >
              X
            </Button>
          </Alert>
        </div>
      )}
    </ErrorContext.Provider>
  );
};
