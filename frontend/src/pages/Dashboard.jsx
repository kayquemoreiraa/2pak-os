import { useQuery } from "@tanstack/react-query";
import { Building2, Users, CheckSquare, Trophy, TrendingUp, Clock, Zap, ArrowUpRight } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function StatCard({ icon: Icon, label, valor, descricao, cor, delay }) {
  return (
    <div className="cortex-card p-6 flex flex-col gap-4 animate-slide-up" style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between">
        <div className={"w-10 h-10 rounded-lg flex items-center justify-center " + cor}>
          <Icon size={18} className="text-cortex-900" />
        </div>
        <ArrowUpRight size={14} className="text-cortex-subtle" />
      </div>
      <div>
        <p className="text-3xl font-bold text-cortex-text tabular-nums">{valor ?? "—"}</p>
        <p className="text-cortex-muted text-sm mt-0.5">{label}</p>
        {descricao && <p className="text-cortex-subtle text-xs mt-1">{descricao}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const { data: dados, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard").then(r => r.data),
    refetchInterval: 30000,
  });

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-cortex-primary text-sm font-mono font-medium">{saudacao},</span>
          <span className="text-cortex-primary text-sm font-mono font-bold">{usuario?.nome?.split(" ")[0] || "usuário"}</span>
        </div>
        <h1 className="text-2xl font-bold text-cortex-text">Dashboard</h1>
        <p className="text-cortex-muted text-sm mt-0.5">
          Visão geral da operação — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="cortex-card p-6 h-32 animate-pulse-soft">
              <div className="h-4 w-24 bg-cortex-600 rounded mb-3" />
              <div className="h-8 w-16 bg-cortex-600 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Building2} label="Empresas ativas" valor={dados?.empresas} descricao="no CRM" cor="bg-cortex-primary" delay="0ms" />
          <StatCard icon={Users} label="Contatos" valor={dados?.contatos} descricao="cadastrados" cor="bg-cortex-light" delay="75ms" />
          <StatCard icon={Clock} label="Tarefas pendentes" valor={dados?.tarefas_pendentes} descricao="aguardando acao" cor="bg-amber-500" delay="150ms" />
          <StatCard icon={Trophy} label="Tarefas concluidas" valor={dados?.tarefas_concluidas} descricao="finalizadas" cor="bg-cortex-success" delay="225ms" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="cortex-card p-5 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-cortex-primary" />
            <h2 className="text-cortex-text text-sm font-semibold">Status do sistema</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Backend API", status: "Operacional" },
              { label: "Banco de dados", status: "Operacional" },
              { label: "Motor de eventos", status: "Ativo" },
              { label: "Motor de automacoes", status: "Ativo" },
              { label: "Webhooks", status: "Ativo" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-cortex-muted text-xs">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cortex-success animate-pulse-soft" />
                  <span className="text-cortex-success text-xs font-mono">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cortex-card p-5 lg:col-span-2 animate-slide-up" style={{ animationDelay: "375ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-cortex-primary" />
              <h2 className="text-cortex-text text-sm font-semibold">Metricas rapidas</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Taxa de conclusao de tarefas", valor: dados ? (dados.tarefas_concluidas + dados.tarefas_pendentes > 0 ? Math.round((dados.tarefas_concluidas / (dados.tarefas_concluidas + dados.tarefas_pendentes)) * 100) : 0) + "%" : "—" },
              { label: "Media contatos por empresa", valor: dados ? (dados.empresas > 0 ? (dados.contatos / dados.empresas).toFixed(1) : "0") : "—" },
              { label: "Tarefas por empresa", valor: dados ? (dados.empresas > 0 ? ((dados.tarefas_pendentes + dados.tarefas_concluidas) / dados.empresas).toFixed(1) : "0") : "—" },
              { label: "Total de registros", valor: dados ? dados.empresas + dados.contatos + dados.tarefas_pendentes + dados.tarefas_concluidas : "—" },
            ].map(m => (
              <div key={m.label} className="bg-cortex-700 rounded-lg p-4">
                <p className="text-2xl font-bold text-cortex-primary tabular-nums">{m.valor}</p>
                <p className="text-cortex-muted text-xs mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

