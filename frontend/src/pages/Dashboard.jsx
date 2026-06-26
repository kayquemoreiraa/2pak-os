import { useEffect, useState } from "react";
import { Building2, Users, CheckSquare, Trophy } from "lucide-react";
import api from "../services/api";

function Card({ icon: Icon, label, valor, cor }) {
  return (
    <div className="bg-surface-raised border border-surface-border rounded-xl p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${cor}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-100">{valor}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((res) => setDados(res.data));
  }, []);

  if (!dados) {
    return <p className="text-gray-500">Carregando...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Visao geral da 2Pak Studio</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card icon={Building2}   label="Empresas"           valor={dados.empresas}           cor="bg-brand-accent" />
        <Card icon={Users}       label="Contatos"           valor={dados.contatos}            cor="bg-blue-600"     />
        <Card icon={CheckSquare} label="Tarefas Pendentes"  valor={dados.tarefas_pendentes}   cor="bg-amber-600"    />
        <Card icon={Trophy}      label="Tarefas Concluidas" valor={dados.tarefas_concluidas}  cor="bg-emerald-600"  />
      </div>
    </div>
  );
}
