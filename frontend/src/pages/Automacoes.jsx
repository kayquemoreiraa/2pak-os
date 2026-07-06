import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Zap, Play, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getAutomacoes, getEventos, getLogs, criarAutomacao, atualizarAutomacao, deletarAutomacao } from "../services/automacaoService";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

const TIPOS_ACAO = [
  { value: "criar_tarefa",      label: "Criar Tarefa"      },
  { value: "criar_notificacao", label: "Criar Notificacao" },
  { value: "mover_pipeline",    label: "Mover no Pipeline" },
];

const formInicial = {
  nome: "", descricao: "", trigger_evento: "",
  acoes: [{ tipo: "criar_tarefa", dados: {} }],
};

function LogItem({ log }) {
  const [aberto, setAberto] = useState(false);
  const acoes = typeof log.acoes_executadas === "string"
    ? JSON.parse(log.acoes_executadas) : log.acoes_executadas;
  const sucesso = log.status === "sucesso";

  return (
    <div className="bg-cortex-dark text-cortex-light border border-surface-border rounded-lg overflow-hidden">
      <button onClick={() => setAberto(!aberto)}
        className="bg-cortex-dark text-cortex-light w-full flex items-center justify-between px-4 py-3 hover:bg-surface-raised transition-colors text-left">
        <div className="bg-cortex-dark text-cortex-light flex items-center gap-3">
          {sucesso
            ? <CheckCircle size={14} className="bg-cortex-dark text-cortex-light text-emerald-400 flex-shrink-0" />
            : <XCircle    size={14} className="bg-cortex-dark text-cortex-light text-red-400 flex-shrink-0" />}
          <div>
            <p className="bg-cortex-dark text-cortex-light text-gray-100 text-sm font-medium">{log.automacao_nome}</p>
            <p className="bg-cortex-dark text-cortex-light text-gray-500 text-xs font-mono">{log.trigger_evento}</p>
          </div>
        </div>
        <div className="bg-cortex-dark text-cortex-light flex items-center gap-3">
          <span className={"text-xs px-2 py-0.5 rounded-full " + (sucesso ? "bg-emerald-500/10 text-emerald-400" : log.status === "parcial" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400")}>
            {log.status}
          </span>
          <span className="bg-cortex-dark text-cortex-light text-gray-600 text-xs">
            {new Date(log.data_execucao).toLocaleString("pt-BR")}
          </span>
          {aberto ? <ChevronUp size={14} className="bg-cortex-dark text-cortex-light text-gray-500" /> : <ChevronDown size={14} className="bg-cortex-dark text-cortex-light text-gray-500" />}
        </div>
      </button>
      {aberto && (
        <div className="bg-cortex-dark text-cortex-light px-4 pb-4 border-t border-surface-border bg-brand-900">
          <p className="bg-cortex-dark text-cortex-light text-gray-500 text-xs font-mono mt-3 mb-1">Acoes executadas:</p>
          <pre className="bg-cortex-dark text-cortex-light text-gray-300 text-xs font-mono overflow-x-auto bg-brand-800 rounded p-3 whitespace-pre-wrap">
            {JSON.stringify(acoes, null, 2)}
          </pre>
          {log.erro_mensagem && (
            <p className="bg-cortex-dark text-cortex-light text-red-300 text-xs font-mono bg-red-500/10 rounded p-2 mt-2">{log.erro_mensagem}</p>
          )}
        </div>
      )}
    </div>
  );
}

function CamposAcao({ acao, onChange }) {
  function set(campo, valor) {
    onChange({ ...acao, dados: { ...acao.dados, [campo]: valor } });
  }
  return (
    <div className="bg-cortex-dark text-cortex-light pl-3 border-l-2 border-brand-accent/30 space-y-2 mt-2">
      {acao.tipo === "criar_tarefa" && (
        <>
          <Input label="Titulo" placeholder="Ex: Follow-up com {{nome_fantasia}}"
            value={acao.dados.titulo || ""} onChange={e => set("titulo", e.target.value)} />
          <div className="bg-cortex-dark text-cortex-light flex flex-col gap-1">
            <label className="bg-cortex-dark text-cortex-light text-xs text-gray-400 font-medium">Prioridade</label>
            <select value={acao.dados.prioridade || "media"} onChange={e => set("prioridade", e.target.value)}
              className="bg-cortex-dark text-cortex-light bg-brand-800 border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-brand-accent">
              <option value="baixa">Baixa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </>
      )}
      {acao.tipo === "criar_notificacao" && (
        <>
          <Input label="Titulo" placeholder="Ex: Nova empresa: {{nome_fantasia}}"
            value={acao.dados.titulo || ""} onChange={e => set("titulo", e.target.value)} />
          <Input label="Mensagem" placeholder="Ex: {{nome_fantasia}} foi cadastrada."
            value={acao.dados.mensagem || ""} onChange={e => set("mensagem", e.target.value)} />
        </>
      )}
      {acao.tipo === "mover_pipeline" && (
        <Input label="ID do status destino" placeholder="UUID do status"
          value={acao.dados.status_id || ""} onChange={e => set("status_id", e.target.value)} />
      )}
    </div>
  );
}

export default function Automacoes() {
  const queryClient = useQueryClient();
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(formInicial);
  const [erro,    setErro]    = useState("");
  const [abaLogs, setAbaLogs] = useState(false);

  const { data: automacoes = [], isLoading } = useQuery({
    queryKey: ["automacoes"],
    queryFn:  () => getAutomacoes().then(r => r.data),
  });

  const { data: eventosData } = useQuery({
    queryKey: ["automacoes-eventos"],
    queryFn:  () => getEventos().then(r => r.data),
    staleTime: Infinity,
  });

  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ["automacoes-logs"],
    queryFn:  () => getLogs().then(r => r.data),
    enabled:  abaLogs,
    refetchInterval: abaLogs ? 10000 : false,
  });

  const criarMutation = useMutation({
    mutationFn: (dados) => criarAutomacao(dados),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ["automacoes"] }); fecharModal(); },
    onError:    (err) => setErro(err.response?.data?.erro || "Erro ao criar automacao."),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, dados }) => atualizarAutomacao(id, dados),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["automacoes"] }),
  });

  const deletarMutation = useMutation({
    mutationFn: (id) => deletarAutomacao(id),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ["automacoes"] }),
  });

  const fecharModal = () => { setModal(false); setForm(formInicial); setErro(""); }

  const handleAddAcao = () => {
    setForm(p => ({ ...p, acoes: [...p.acoes, { tipo: "criar_tarefa", dados: {} }] }));
  }

  function handleRemoveAcao(idx) {
    setForm(p => ({ ...p, acoes: p.acoes.filter((_, i) => i !== idx) }));
  }

  function handleAcaoChange(idx, acao) {
    setForm(p => { const a = [...p.acoes]; a[idx] = acao; return { ...p, acoes: a }; });
  }

  const handleSalvar = () => {
    if (!form.nome.trim())    { setErro("Nome e obrigatorio."); return; }
    if (!form.trigger_evento) { setErro("Selecione um evento."); return; }
    if (!form.acoes.length)   { setErro("Adicione pelo menos uma acao."); return; }
    setErro("");
    criarMutation.mutate(form);
  }

  function handleToggle(a) {
    const acoes = typeof a.acoes === "string" ? JSON.parse(a.acoes) : a.acoes;
    toggleMutation.mutate({
      id:   a.id,
      dados: { nome: a.nome, trigger_evento: a.trigger_evento, acoes, ativo: !a.ativo },
    });
  }

  function handleDeletar(a) {
    if (!window.confirm("Excluir: " + a.nome + "?")) return;
    deletarMutation.mutate(a.id);
  }

  const eventos = eventosData?.eventos || [];

  return (
    <div>
      <div className="bg-cortex-dark text-cortex-light flex items-center justify-between mb-6">
        <div>
          <h1 className="bg-cortex-dark text-cortex-light text-2xl font-bold text-gray-100">Automacoes</h1>
          <p className="bg-cortex-dark text-cortex-light text-gray-500 text-sm">Regras que executam acoes automaticamente quando eventos acontecem</p>
        </div>
        <button onClick={() => setModal(true)}
          className="bg-cortex-dark text-cortex-light flex items-center gap-2 bg-brand-accent hover:bg-brand-hover text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />Nova Automacao
        </button>
      </div>

      <div className="bg-cortex-dark text-cortex-light flex gap-2 mb-6">
        {[["automacoes","Automacoes"],["logs","Historico"]].map(([aba, label]) => (
          <button key={aba} onClick={() => setAbaLogs(aba === "logs")}
            className={"px-4 py-1.5 rounded-lg text-sm font-medium transition-colors " + ((!abaLogs && aba === "automacoes") || (abaLogs && aba === "logs") ? "bg-brand-accent text-white" : "bg-surface-raised border border-surface-border text-gray-400 hover:text-gray-100")}>
            {label}
          </button>
        ))}
      </div>

      {!abaLogs ? (
        isLoading ? <p className="bg-cortex-dark text-cortex-light text-gray-500 text-sm">Carregando...</p>
        : automacoes.length === 0 ? (
          <div className="bg-cortex-dark text-cortex-light text-center py-20">
            <Zap size={40} className="bg-cortex-dark text-cortex-light mx-auto text-gray-700 mb-3" />
            <p className="bg-cortex-dark text-cortex-light text-gray-500">Nenhuma automacao criada.</p>
            <button onClick={() => setModal(true)} className="bg-cortex-dark text-cortex-light mt-4 text-brand-accent text-sm hover:underline">
              Criar primeira automacao
            </button>
          </div>
        ) : (
          <div className="bg-cortex-dark text-cortex-light grid gap-3">
            {automacoes.map(a => {
              const acoes = typeof a.acoes === "string" ? JSON.parse(a.acoes) : a.acoes;
              return (
                <div key={a.id}
                  className="bg-cortex-dark text-cortex-light bg-surface-raised border border-surface-border rounded-xl p-5 flex items-center justify-between group hover:border-brand-accent transition-colors">
                  <div className="bg-cortex-dark text-cortex-light flex items-center gap-4">
                    <div className={"w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 " + (a.ativo ? "bg-brand-accent/20" : "bg-surface-border")}>
                      <Zap size={18} className={a.ativo ? "text-brand-accent" : "text-gray-600"} />
                    </div>
                    <div>
                      <p className="bg-cortex-dark text-cortex-light text-gray-100 font-medium">{a.nome}</p>
                      <p className="bg-cortex-dark text-cortex-light text-gray-500 text-xs mt-0.5">
                        <span className="bg-cortex-dark text-cortex-light text-brand-soft font-mono text-xs">{a.trigger_evento}</span>
                        <span className="bg-cortex-dark text-cortex-light mx-2 text-gray-700">?</span>
                        {acoes.length} acao{acoes.length !== 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="bg-cortex-dark text-cortex-light flex items-center gap-3">
                    <span className={"text-xs px-2 py-1 rounded-full " + (a.ativo ? "bg-emerald-500/10 text-emerald-400" : "bg-cortex-dark/10 text-gray-500")}>
                      {a.ativo ? "Ativa" : "Inativa"}
                    </span>
                    <div className="bg-cortex-dark text-cortex-light flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggle(a)}
                        title={a.ativo ? "Desativar" : "Ativar"}
                        className="bg-cortex-dark text-cortex-light p-1.5 rounded-lg text-gray-400 hover:text-brand-accent hover:bg-brand-600 transition-colors">
                        <Play size={14} />
                      </button>
                      <button onClick={() => handleDeletar(a)}
                        className="bg-cortex-dark text-cortex-light p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        loadingLogs ? <p className="bg-cortex-dark text-cortex-light text-gray-500 text-sm">Carregando historico...</p>
        : logs.length === 0 ? (
          <div className="bg-cortex-dark text-cortex-light text-center py-20">
            <Zap size={40} className="bg-cortex-dark text-cortex-light mx-auto text-gray-700 mb-3" />
            <p className="bg-cortex-dark text-cortex-light text-gray-500">Nenhuma execucao registrada ainda.</p>
          </div>
        ) : (
          <div className="bg-cortex-dark text-cortex-light space-y-2">
            {logs.map(log => <LogItem key={log.id} log={log} />)}
          </div>
        )
      )}

      {modal && (
        <Modal titulo="Nova Automacao" onClose={fecharModal}>
          <div className="bg-cortex-dark text-cortex-light flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
            <Input label="Nome *" placeholder="Ex: Onboarding de nova empresa"
              value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
            <Input label="Descricao" placeholder="Opcional"
              value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} />
            <div className="bg-cortex-dark text-cortex-light flex flex-col gap-1">
              <label className="bg-cortex-dark text-cortex-light text-xs text-gray-400 font-medium">Quando ocorrer o evento *</label>
              <select value={form.trigger_evento}
                onChange={e => setForm(p => ({ ...p, trigger_evento: e.target.value }))}
                className="bg-cortex-dark text-cortex-light bg-brand-800 border border-surface-border rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-brand-accent">
                <option value="">Selecione...</option>
                {eventos.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <div className="bg-cortex-dark text-cortex-light flex items-center justify-between mb-2">
                <p className="bg-cortex-dark text-cortex-light text-xs text-gray-400 font-medium">Acoes *</p>
                <button onClick={handleAddAcao}
                  className="bg-cortex-dark text-cortex-light text-xs text-brand-accent hover:underline flex items-center gap-1">
                  <Plus size={12} />Adicionar acao
                </button>
              </div>
              <div className="bg-cortex-dark text-cortex-light space-y-3">
                {form.acoes.map((acao, idx) => (
                  <div key={idx} className="bg-cortex-dark text-cortex-light bg-brand-800 rounded-lg p-3 border border-surface-border">
                    <div className="bg-cortex-dark text-cortex-light flex items-center gap-2 mb-2">
                      <select value={acao.tipo}
                        onChange={e => handleAcaoChange(idx, { tipo: e.target.value, dados: {} })}
                        className="bg-cortex-dark text-cortex-light flex-1 bg-brand-700 border border-surface-border rounded px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-brand-accent">
                        {TIPOS_ACAO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      {form.acoes.length > 1 && (
                        <button onClick={() => handleRemoveAcao(idx)}
                          className="bg-cortex-dark text-cortex-light text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <CamposAcao acao={acao} onChange={a => handleAcaoChange(idx, a)} />
                  </div>
                ))}
              </div>
            </div>
            {erro && <p className="bg-cortex-dark text-cortex-light text-red-400 text-xs">{erro}</p>}
          </div>
          <div className="bg-cortex-dark text-cortex-light flex gap-3 pt-4 mt-2 border-t border-surface-border">
            <button onClick={fecharModal}
              className="bg-cortex-dark text-cortex-light flex-1 px-4 py-2 rounded-lg border border-surface-border text-gray-400 text-sm hover:text-gray-100 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSalvar} disabled={criarMutation.isPending}
              className="bg-cortex-dark text-cortex-light flex-1 px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-hover text-white text-sm transition-colors disabled:opacity-50">
              {criarMutation.isPending ? "Salvando..." : "Criar Automacao"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}









