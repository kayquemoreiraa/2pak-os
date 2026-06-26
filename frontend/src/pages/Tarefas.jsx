import { useEffect, useState } from "react";
import { Plus, CheckSquare, Clock, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { getTarefasGeral, criarTarefa, atualizarTarefa, deletarTarefa } from "../services/tarefaService";
import { getEmpresas } from "../services/empresaService";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const PRIORIDADES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Media" },
  { value: "alta",  label: "Alta"  },
];

const STATUS_OPCOES = [
  { value: "pendente",     label: "Pendente"     },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluida",    label: "Concluida"    },
  { value: "cancelada",    label: "Cancelada"    },
];

const corPrioridade = {
  alta:  "text-red-400",
  media: "text-amber-400",
  baixa: "text-green-400",
};

const corStatus = {
  pendente:     "bg-amber-500/10 text-amber-400",
  em_andamento: "bg-blue-500/10 text-blue-400",
  concluida:    "bg-emerald-500/10 text-emerald-400",
  cancelada:    "bg-gray-500/10 text-gray-400",
};

const formInicial = {
  titulo: "",
  descricao: "",
  empresa_id: "",
  prioridade: "media",
  status: "pendente",
  data_vencimento: "",
};

export default function Tarefas() {
  const [tarefas, setTarefas]       = useState([]);
  const [empresas, setEmpresas]     = useState([]);
  const [filtro, setFiltro]         = useState("todas");
  const [carregando, setCarregando] = useState(true);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(formInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando]     = useState(false);
  const [erro, setErro]             = useState("");

  useEffect(() => {
    Promise.all([getTarefasGeral(), getEmpresas()]).then(([tar, emp]) => {
      setTarefas(tar.data);
      setEmpresas(emp.data);
      setCarregando(false);
    });
  }, []);

  const filtradas = tarefas.filter((t) =>
    filtro === "todas" ? true : t.status === filtro
  );

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function abrirCriar() {
    setEditandoId(null);
    setForm(formInicial);
    setErro("");
    setModal(true);
  }

  function abrirEditar(tarefa) {
    setEditandoId(tarefa.id);
    setForm({
      titulo:          tarefa.titulo         || "",
      descricao:       tarefa.descricao      || "",
      empresa_id:      tarefa.empresa_id     || "",
      prioridade:      tarefa.prioridade     || "media",
      status:          tarefa.status         || "pendente",
      data_vencimento: tarefa.data_vencimento ? tarefa.data_vencimento.slice(0, 16) : "",
    });
    setErro("");
    setModal(true);
  }

  function fecharModal() {
    setModal(false);
    setEditandoId(null);
    setForm(formInicial);
    setErro("");
  }

  async function handleSalvar() {
    if (!form.titulo.trim()) { setErro("Titulo e obrigatorio."); return; }
    if (!form.empresa_id)    { setErro("Selecione uma empresa."); return; }
    setSalvando(true);
    setErro("");
    try {
      if (editandoId) {
        const res = await atualizarTarefa(editandoId, form);
        setTarefas((prev) => prev.map((t) => t.id === editandoId ? { ...t, ...res.data } : t));
      } else {
        const res = await criarTarefa(form);
        setTarefas((prev) => [res.data, ...prev]);
      }
      fecharModal();
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao salvar tarefa.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleConcluir(tarefa) {
    try {
      const novoStatus = tarefa.status === "concluida" ? "pendente" : "concluida";
      const res = await atualizarTarefa(tarefa.id, {
        titulo:          tarefa.titulo,
        descricao:       tarefa.descricao,
        prioridade:      tarefa.prioridade,
        status:          novoStatus,
        data_vencimento: tarefa.data_vencimento,
        contato_id:      tarefa.contato_id,
      });
      setTarefas((prev) => prev.map((t) => t.id === tarefa.id ? { ...t, ...res.data } : t));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletar(tarefa) {
    if (!window.confirm("Excluir a tarefa: " + tarefa.titulo + "?")) return;
    await deletarTarefa(tarefa.id);
    setTarefas((prev) => prev.filter((t) => t.id !== tarefa.id));
  }

  const empresaOpcoes = empresas.map((e) => ({ value: e.id, label: e.nome_fantasia }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Tarefas</h1>
          <p className="text-gray-500 text-sm">Acompanhe e gerencie as acoes do time</p>
        </div>
        <button
          onClick={abrirCriar}
          className="flex items-center gap-2 bg-brand-accent hover:bg-brand-hover text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nova Tarefa
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {["todas", "pendente", "em_andamento", "concluida"].map((s) => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize " + (filtro === s ? "bg-brand-accent text-white" : "bg-surface-raised border border-surface-border text-gray-400 hover:text-gray-100")}
          >
            {s === "todas" ? "Todas" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-20">
          <CheckSquare size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">Nenhuma tarefa encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtradas.map((tarefa) => (
            <div key={tarefa.id} className="bg-surface-raised border border-surface-border rounded-xl p-5 flex items-center gap-4 group">
              <button
                onClick={() => handleConcluir(tarefa)}
                className={"w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors " + (tarefa.status === "concluida" ? "bg-emerald-500 border-emerald-500" : "border-gray-600 hover:border-brand-accent")}
              />
              <div className="flex-1 min-w-0">
                <p className={"text-sm font-medium " + (tarefa.status === "concluida" ? "line-through text-gray-500" : "text-gray-100")}>
                  {tarefa.titulo}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{tarefa.empresa_nome}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {tarefa.data_vencimento && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    {new Date(tarefa.data_vencimento).toLocaleDateString("pt-BR")}
                  </span>
                )}
                <span className={"flex items-center gap-1 text-xs font-medium " + corPrioridade[tarefa.prioridade]}>
                  <AlertCircle size={12} />
                  {tarefa.prioridade}
                </span>
                <span className={"text-xs px-2 py-1 rounded-full font-medium " + corStatus[tarefa.status]}>
                  {tarefa.status.replace("_", " ")}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => abrirEditar(tarefa)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-accent hover:bg-brand-600 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDeletar(tarefa)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal titulo={editandoId ? "Editar Tarefa" : "Nova Tarefa"} onClose={fecharModal}>
          <div className="flex flex-col gap-4">
            <Input label="Titulo *" name="titulo" placeholder="Ex: Enviar proposta comercial" value={form.titulo} onChange={handleChange} />
            <Input label="Descricao" name="descricao" placeholder="Detalhes da tarefa..." value={form.descricao} onChange={handleChange} />
            <Select label="Empresa *" name="empresa_id" options={empresaOpcoes} value={form.empresa_id} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Prioridade" name="prioridade" options={PRIORIDADES} value={form.prioridade} onChange={handleChange} />
              <Select label="Status" name="status" options={STATUS_OPCOES} value={form.status} onChange={handleChange} />
            </div>
            <Input label="Data de Vencimento" name="data_vencimento" type="datetime-local" value={form.data_vencimento} onChange={handleChange} />

            {erro && <p className="text-red-400 text-xs">{erro}</p>}

            <div className="flex gap-3 pt-2">
              <button onClick={fecharModal} className="flex-1 px-4 py-2 rounded-lg border border-surface-border text-gray-400 text-sm hover:text-gray-100 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSalvar} disabled={salvando} className="flex-1 px-4 py-2 rounded-lg bg-brand-accent hover:bg-brand-hover text-white text-sm transition-colors disabled:opacity-50">
                {salvando ? "Salvando..." : editandoId ? "Atualizar" : "Salvar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
