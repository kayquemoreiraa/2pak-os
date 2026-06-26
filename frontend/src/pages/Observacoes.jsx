import { useEffect, useState } from "react";
import { Plus, MessageSquare, Pencil, Trash2, Check, X } from "lucide-react";
import { getObservacoes, criarObservacao, atualizarObservacao, deletarObservacao } from "../services/observacaoService";
import { getEmpresas } from "../services/empresaService";
import Select from "../components/ui/Select";

function NotaCard({ nota, onEditar, onDeletar }) {
  const [editando, setEditando] = useState(false);
  const [conteudo, setConteudo] = useState(nota.conteudo);
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar() {
    if (!conteudo.trim()) return;
    setSalvando(true);
    try {
      await onEditar(nota.id, conteudo);
      setEditando(false);
    } finally {
      setSalvando(false);
    }
  }

  function handleCancelar() {
    setConteudo(nota.conteudo);
    setEditando(false);
  }

  const dataFormatada = new Date(nota.data_criacao).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="bg-surface-raised border border-surface-border rounded-xl p-5 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {editando ? (
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              rows={3}
              autoFocus
              className="w-full bg-brand-800 border border-brand-accent rounded-lg px-3 py-2 text-sm text-gray-100 resize-none focus:outline-none"
            />
          ) : (
            <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
              {nota.conteudo}
            </p>
          )}
          <p className="text-gray-600 text-xs mt-2">{dataFormatada}</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {editando ? (
            <>
              <button onClick={handleSalvar} disabled={salvando} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                <Check size={14} />
              </button>
              <button onClick={handleCancelar} className="p-1.5 rounded-lg text-gray-400 hover:bg-surface-border transition-colors">
                <X size={14} />
              </button>
            </>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button onClick={() => setEditando(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-accent hover:bg-brand-600 transition-colors">
                <Pencil size={14} />
              </button>
              <button onClick={() => onDeletar(nota.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Observacoes() {
  const [notas, setNotas]               = useState([]);
  const [empresas, setEmpresas]         = useState([]);
  const [empresaFiltro, setEmpresaFiltro] = useState("");
  const [carregando, setCarregando]     = useState(false);
  const [novaNota, setNovaNote]         = useState("");
  const [salvando, setSalvando]         = useState(false);

  useEffect(() => {
    getEmpresas().then((res) => setEmpresas(res.data));
  }, []);

  useEffect(() => {
    if (!empresaFiltro) { setNotas([]); return; }
    setCarregando(true);
    getObservacoes(empresaFiltro).then((res) => {
      setNotas(res.data);
      setCarregando(false);
    });
  }, [empresaFiltro]);

  async function handleCriar() {
    if (!novaNota.trim() || !empresaFiltro) return;
    setSalvando(true);
    try {
      const res = await criarObservacao({ conteudo: novaNota, empresa_id: empresaFiltro });
      setNotas((prev) => [res.data, ...prev]);
      setNovaNote("");
    } finally {
      setSalvando(false);
    }
  }

  async function handleEditar(id, conteudo) {
    const res = await atualizarObservacao(id, { conteudo });
    setNotas((prev) => prev.map((n) => n.id === id ? res.data : n));
  }

  async function handleDeletar(id) {
    if (!window.confirm("Remover esta nota?")) return;
    await deletarObservacao(id);
    setNotas((prev) => prev.filter((n) => n.id !== id));
  }

  const empresaOpcoes = empresas.map((e) => ({ value: e.id, label: e.nome_fantasia }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Notas</h1>
        <p className="text-gray-500 text-sm">Observacoes e anotacoes sobre as empresas</p>
      </div>

      <div className="mb-6">
        <Select
          label="Selecionar empresa"
          name="empresa_filtro"
          options={empresaOpcoes}
          value={empresaFiltro}
          onChange={(e) => setEmpresaFiltro(e.target.value)}
        />
      </div>

      {empresaFiltro && (
        <div className="mb-6 bg-surface-raised border border-surface-border rounded-xl p-4">
          <textarea
            value={novaNota}
            onChange={(e) => setNovaNote(e.target.value)}
            placeholder="Escreva uma observacao sobre esta empresa..."
            rows={3}
            className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-600 resize-none focus:outline-none"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleCriar}
              disabled={salvando || !novaNota.trim()}
              className="flex items-center gap-2 bg-brand-accent hover:bg-brand-hover text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus size={14} />
              {salvando ? "Salvando..." : "Adicionar Nota"}
            </button>
          </div>
        </div>
      )}

      {!empresaFiltro ? (
        <div className="text-center py-20">
          <MessageSquare size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">Selecione uma empresa para ver as notas.</p>
        </div>
      ) : carregando ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : notas.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">Nenhuma nota ainda. Escreva a primeira acima.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {notas.map((nota) => (
            <NotaCard key={nota.id} nota={nota} onEditar={handleEditar} onDeletar={handleDeletar} />
          ))}
        </div>
      )}
    </div>
  );
}
