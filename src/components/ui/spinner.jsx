
import { Loader2 } from "lucide-react";

export const Spinner = ({ size = 24, className = "" }) => {
  return <Loader2 className={`animate-spin text-blue-800 ${className}`} size={size} />;
};