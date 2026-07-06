import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RotaProtegida({ children }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="bg-cortex-dark text-cortex-light min-h-screen bg-brand-900 flex items-center justify-center">
        <p className="bg-cortex-dark text-cortex-light text-gray-500 text-sm">Carregando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


