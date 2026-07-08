import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RotaProtegida from "./components/RotaProtegida";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Contatos from "./pages/Contatos";
import Tarefas from "./pages/Tarefas";
import Pipeline from "./pages/Pipeline";
import Observacoes from "./pages/Observacoes";
import Followup from "./pages/Followup";
import Automacoes from "./pages/Automacoes";
import Webhooks from "./pages/Webhooks";
import CapturaLeads from "./pages/CapturaLeads";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RotaProtegida><Layout /></RotaProtegida>}>
            <Route index            element={<Dashboard />}   />
            <Route path="empresas"    element={<Empresas />}    />
            <Route path="contatos"    element={<Contatos />}    />
            <Route path="tarefas"     element={<Tarefas />}     />
            <Route path="pipeline"    element={<Pipeline />}    />
            <Route path="observacoes" element={<Observacoes />} />
            <Route path="followup"    element={<Followup />}    />
            <Route path="automacoes"  element={<Automacoes />}  />
            <Route path="webhooks"    element={<Webhooks />}    />
            <Route path="captura-leads" element={<CapturaLeads />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
