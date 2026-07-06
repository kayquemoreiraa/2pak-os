import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Webhook, Activity, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { webhookService } from "../services/webhookService";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

const EVENTOS_DISPONIVEIS = [
  "empresa.criada", "empresa.atualizada", "empresa.removida",
  "contato.criado", "tarefa.criada", "tarefa.concluida",
  "pipeline.empresa_movida",
];

const corStatus = (status) => {
  if (!status) return "bg-cortex-dark/10 text-gray-400";
  if (status >= 200 && status < 300) return "bg-emerald-500/10 text-emerald-400";
  if (status >= 400 && status < 500) return "bg-amber-500/10 text-amber-400";
  return "bg-red-500/10 text-red-400";
};

function LogItem({ log }) {
  const [aberto, setAberto] = useState(false);
  const sucesso = log.sucesso;
  return (
    <div className="bg-cortex-dark text-cortex-light border border-surface-border rounded-lg overflow-hidden">
      <button onClick={() => setAberto(!aberto)}
        className="bg-cortex-dark text-cortex-light w-full flex items-center justify-between px-4 py-3 hover:bg-surface-raised transition-colors text-left">
        <div className="bg-cortex-dark text-cortex-light flex items-center gap-3">
          {sucesso
            ? <CheckCircle size={14} className="bg-cortex-dark text-cortex-light text-emerald-400 flex-shrink-0" />
            : <XCircle    size={14} className="bg-cortex-dark text-cortex-light text-red-400 flex-shrink-0" />}
          <div>
            <p className="bg-cortex-dark text-cortex-light text-gray-100 text-sm font-medium font-mono">{log.evento}</p>
            <p className="bg-cortex-dark text-cortex-light text-gray-500 text-xs truncate max-w-xs">{log.url_destino}</p>
          </div>
        </div>
        <div className="bg-cortex-dark text-cortex-light flex items-center gap-3">
          <span className={"text-xs px-2 py-0.5 rounded-full font-mono " + corStatus(log.status_http)}>
            HTTP {log.status_http || "ERR"}
          </span>
          <span className="bg-cortex-dark text-cortex-light text-gray-600 text-xs">
            {new Date(log.criado_em).toLocaleString("pt-BR")}
          </span>
          {aberto ? <ChevronUp size={14} className="bg-cortex-dark text-cortex-light text-gray-500" /> : <ChevronDown size={14} className="bg-cortex-dark text-cortex-light text-gray-500" />}
        </div>
      </button>
      {aberto && (
        <div className="bg-cortex-dark text-cortex-light px-4 pb-4 border-t border-surface-border bg-brand-900">
          {log.payload_enviado && (
            <>
              <p className="bg-cortex-dark text-cortex-light text-gray-500 text-xs font-mono mt-3 mb-1">Payload enviado:</p>
              <pre className="bg-cortex-dark text-cortex-light text-gray-300 text-xs font-mono overflow-x-auto bg-brand-800 rounded p-3 whitespace-pre-wrap">
                {JSON.stringify(log.payload_enviado, null, 2)}
              </pre>
            </>
          )}
          {log.resposta_recebida && (
            <>
              <p className="bg-cortex-dark text-cortex-light text-gray-500 text-xs font-mono mt-2 mb-1">Resposta:</p>
              <p className="bg-cortex-dark text-cortex-light text-gray-400 text-xs font-mono bg-brand-800 rounded p-2">{log.resposta_recebida}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const formInicial = { url: "", descricao: "", eventos: [] };

export default function Webhooks() {
  const queryClient = useQueryClient();
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(formInicial);
  const [erro,    setErro]    = useState("");
  const [abaLogs, setAbaLogs] = useState(false);

  const { data: endpoints = [], isLoading: loadingEndpoints } = useQuery({
    queryKey: ["webhooks-endpoints"],
    queryFn:  () => webhookService.listarEndpoints(),
  });

  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["webhooks-logs"],
    queryFn:  () => webhookService.listarLogs(),
    enabled:  abaLogs,
    refetchInterval: abaLogs ? 10000 : false,
  });

  const criarMutation = useMutation({
    mutationFn: (dados) => webhookService.criarEndpoint(dados),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ["webhooks-endpoints"] }); fecharModal(); },
    onError:    (err) => setErro(err.response?.data?.erro || "Erro ao cadastrar endpoint."),
  });

  const deletarMutation = useMutation({
    mutationFn: (id) => fetch("http://localhost:3000/api/v1/webhooks/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + localStorage.getItem("2pakos_token") },
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["webhooks-endpoints"] }),
  });

  const fecharModal = () => { setModal(false); setForm(formInicial); setErro(""); }

  function toggleEvento(evento) {
    setForm(prev => ({
      ...prev,
      eventos: prev.eventos.includes(evento)
        ? prev.eventos.filter(e => e !== evento)
        : [...prev.eventos, evento],
    }));
  }

  const handleSalvar = () => {
    if (!form.url.trim())        { setErro("URL e obrigatoria."); return; }
    if (!form.eventos.length)    { setErro("Selecione pelo menos um evento."); return; }
    setErro("");
    criarMutation.mutate(form);
  }

  function handleDeletar(endpoint) {
    if (!window.confirm("Excluir endpoint: " + endpoint.url + "?")) return;
    deletarMutation.mutate(endpoint.id);
  }

  return (
    <div>
      <div className="bg-cortex-dark text-cortex-light flex items-center justify-between mb-6">
        <div>
          <h1 className="bg-cortex-dark text-cortex-light text-2xl font-bold text-gray-100">Webhooks</h1>
          <p className="bg-cortex-dark text-cortex-light text-gray-500 text-sm">Endpoints e historico de disparos</p>
        </div>
        <button onClick={() => setModal(true)}
          className="bg-cortex-dark text-cortex-light flex items-center gap-2 bg-brand-accent hover:bg-brand-hover text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />Cadastrar Endpoint
        </button>
      </div>

      <div className="bg-cortex-dark text-cortex-light flex gap-2 mb-6">
        {[["endpoints","Endpoints"],["logs","Historico"]].map(([aba, label]) => (
          <button key={aba} onClick={() => setAbaLogs(aba === "logs")}
            className={"px-4 py-1.5 rounded-lg text-sm font-medium transition-colors " + ((!abaLogs && aba === "endpoints") || (abaLogs && aba === "logs") ? "bg-brand-accent text-white" : "bg-surface-raised border border-surface-border text-gray-400 hover:text-gray-100")}>
            {label}
          </button>
        ))}
      </div>

      {!abaLogs ? (
        loadingEndpoints ? <p className="bg-cortex-dark text-cortex-light text-gray-500 text-sm">Carregando...</p>
        : endpoints.length === 0 ? (
          <div className="bg-cortex-dark text-cortex-light text-center py-20">
            <Webhook size={40} className="bg-cortex-dark text-cortex-light mx-auto text-gray-700 mb-3" />
            <p className="bg-cortex-dark text-cortex-light text-gray-500">Nenhum endpoint cadastrado.</p>
            <button onClick={() => setModal(true)} className="bg-cortex-dark text-cortex-light mt-4 text-brand-accent text-sm hover:underline">
              Cadastrar primeiro endpoint
            </button>
          </div>
        ) : (
          <div className="bg-cortex-dark text-cortex-light grid gap-3">
            {endpoints.map(ep => (
              <div key={ep.id}
                className="bg-cortex-dark text-cortex-light bg-surface-raised border border-surface-border rounded-xl p-5 flex items-center justify-between group hover:border-brand-accent transition-colors">
                <div className="bg-cortex-dark text-cortex-light flex items-center gap-4">
                  <div className="bg-cortex-dark text-cortex-light w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                    <Webhook size={18} className="bg-cortex-dark text-cortex-light text-brand-accent" />
                  </div>
                  <div>
                    <p className="bg-cortex-dark text-cortex-light text-gray-100 font-medium text-sm truncate max-w-sm">{ep.url}</p>
                    <p className="bg-cortex-dark text-cortex-light text-gray-500 text-xs mt-0.5">{ep.descricao || "Sem descricao"}</p>
                    <div className="bg-cortex-dark text-cortex-light flex gap-1 mt-1 flex-wrap">
                      {ep.eventos.map(ev => (
                        <span key={ev} className="bg-cortex-dark text-cortex-light text-xs bg-brand-600 text-brand-soft px-1.5 py-0.5 rounded font-mono">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-cortex-dark text-cortex-light flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDeletar(ep)}
                    className="bg-cortex-dark text-cortex-light p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        loadingLogs ? <p className="bg-cortex-dark text-cortex-light text-gray-500 text-sm">Carregando historico...</p>
        : logs.length === 0 ? (
          <div className="bg-cortex-dark text-cortex-light text-center py-20">
            <Activity size={40} className="bg-cortex-dark text-cortex-light mx-auto text-gray-700 mb-3" />
            <p className="bg-cortex-dark text-cortex-light text-gray-500">Nenhum disparo registrado ainda.</p>
          </div>
        ) : (
          <div className="bg-cortex-dark text-cortex-light space-y-2">
            {logs.map(log => <LogItem key={log.id} log={log} />)}
          </div>
        )
      )}

      {modal && (
        <Modal titulo="Cadastrar Endpoint" onClose={fecharModal}>
          <div className="bg-cortex-dark text-cortex-light flex flex-col gap-4">
            <Input label="URL *" placeholder="https://seu-sistema.com/webhook"
              value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
            <Input label="Descricao" placeholder="Ex: Integracao com n8n"
              value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} />
            <div>
              <p className="bg-cortex-dark text-cortex-light text-xs text-gray-400 font-medium mb-2">Eventos *</p>
              <div className="bg-cortex-dark text-cortex-light grid grid-cols-2 gap-2">
                {EVENTOS_DISPONIVEIS.map(ev => (
                  <label key={ev} className="bg-cortex-dark text-cortex-light flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.eventos.includes(ev)} onChange={() => toggleEvento(ev)}
                      className="bg-cortex-dark text-cortex-light w-3.5 h-3.5 accent-brand-accent" />
                    <span className="bg-cortex-dark text-cortex-light text-xs text-gray-300 font-mono">{ev}</span>
                  </label>
                ))}
              </div>
            </div>
            {erro && <p className="bg-cortex-dark text-cortex-light text-red-400 text-xs">{erro}</p>}
            <div className="bg-cortex-dark text-cortex-light flex gap-3 pt-2">
              <button onClick={fecharModal}
                className="bg-cortex-dark text-cortex-light flex-1 px-4 py-2 rounded-lg border border-surface-border text-gray-400 text-sm hover:text-gray-100 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSalvar} disabled={criarMutation.isPending}
                className="bg-cortex-dark text-cortex-light flex-1 px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-hover text-white text-sm transition-colors disabled:opacity-50">
                {criarMutation.isPending ? "Salvando..." : "Cadastrar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}









