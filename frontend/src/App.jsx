import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Contatos from "./pages/Contatos";
import Tarefas from "./pages/Tarefas";
import Pipeline from "./pages/Pipeline";
import Observacoes from "./pages/Observacoes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="empresas" element={<Empresas />} />
          <Route path="contatos" element={<Contatos />} />
          <Route path="tarefas" element={<Tarefas />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="observacoes" element={<Observacoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
