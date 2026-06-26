import { useEffect, useState } from "react";
import { Plus, Users, Mail, Phone, Star, Pencil, Trash2 } from "lucide-react";
import { getContatos, criarContato, atualizarContato, deletarContato } from "../services/contatoService";
import { getEmpresas } from "../services/empresaService";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const formInicial = {
  nome: "",
  cargo: "",
  email: "",
  telefone: "",
  linkedin_url: "",
  empresa_id: "",
  contato_principal: false,
};

function ContatoCard({ contato, onEditar, onDeletar }) {
  const mailHref = "mailto:" + contato.email;
  const telHref  = "tel:"    + contato.telefone;

  return (
    <div className="bg-surface-raised border border-surface-border rounded-xl p-5 flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center">
          <span className="text-brand-accent font-bold text-sm">
            {contato.nome.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-gray-100 font-medium">{contato.nome}</p>
            {contato.contato_principal === 1 && (
              <Star size={12} className="text-amber-400 fill-amber-400" />
            )}
          </div>
          <p className="text-gray-500 text-xs">{contato.cargo || "Sem cargo"}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {contato.email && (
          <a href={mailHref} className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-accent transition-colors">
            <Mail size={12} />
            {contato.email}
          </a>
        )}
        {contato.telefone && (
          <a href={telHref} className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-accent transition-colors">
            <Phone size={12} />
            {contato.telefone}
          </a>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEditar(contato)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-accent hover:bg-brand-600 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDeletar(contato.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Contatos() {
  const [contatos, setContatos]           = useState([]);
  const [empresas, setEmpresas]           = useState([]);
  const [empresaFiltro, setEmpresaFiltro] = useState("");
  const [carregando, setCarregando]       = useState(false);
  const [modal, setModal]                 = useState(false);
  const [form, setForm]                   = useState(formInicial);
  const [editandoId, setEditandoId]       = useState(null);
  const [salvando, setSalvando]           = useState(false);
  const [erro, setErro]                   = useState("");

  useEffect(() => {
    getEmpresas().then((res) => setEmpresas(res.data));
  }, []);

  useEffect(() => {
    if (!empresaFiltro) { setContatos([]); return; }
    setCarregando(true);
    getContatos(empresaFiltro).then((res) => {
      setContatos(res.data);
      setCarregando(false);
    });
  }, [empresaFiltro]);

  function handleChange(e) {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: val }));
  }

  function abrirCriar() {
    setEditandoId(null);
    setForm(formInicial);
    setErro("");
    setModal(true);
  }

  function abrirEditar(contato) {
    setEditandoId(contato.id);
    setForm({
      nome:              contato.nome              || "",
      cargo:             contato.cargo             || "",
      email:             contato.email             || "",
      telefone:          contato.telefone          || "",
      linkedin_url:      contato.linkedin_url      || "",
      empresa_id:        contato.empresa_id        || "",
      contato_principal: contato.contato_principal === 1,
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
    if (!form.nome.trim()) { setErro("Nome e obrigatorio."); return; }
    if (!form.empresa_id)  { setErro("Selecione uma empresa."); return; }
    setSalvando(true);
    setErro("");
    try {
      if (editandoId) {
        const res = await atualizarContato(editandoId, form);
        setContatos((prev) => prev.map((c) => c.id === editandoId ? res.data : c));
      } else {
        const res = await criarContato(form);
        if (form.empresa_id === empresaFiltro) {
          setContatos((prev) => [...prev, res.data]);
        }
      }
      fecharModal();
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao salvar contato.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(id) {
    if (!window.confirm("Remover este contato?")) return;
    await deletarContato(id);
    setContatos((prev) => prev.filter((c) => c.id !== id));
  }

  const empresaOpcoes = empresas.map((e) => ({ value: e.id, label: e.nome_fantasia }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Contatos</h1>
          <p className="text-gray-500 text-sm">Pessoas de contato nas empresas</p>
        </div>
        <button onClick={abrirCriar} className="flex items-center gap-2 bg-brand-accent hover:bg-brand-hover text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />
          Novo Contato
        </button>
      </div>

      <div className="mb-6">
        <Select label="Filtrar por empresa" name="empresa_filtro" options={empresaOpcoes} value={empresaFiltro} onChange={(e) => setEmpresaFiltro(e.target.value)} />
      </div>

      {!empresaFiltro ? (
        <div className="text-center py-20">
          <Users size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">Selecione uma empresa para ver os contatos.</p>
        </div>
      ) : carregando ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : contatos.length === 0 ? (
        <div className="text-center py-20">
          <Users size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">Nenhum contato cadastrado nesta empresa.</p>
          <button onClick={abrirCriar} className="mt-4 text-brand-accent text-sm hover:underline">
            Adicionar primeiro contato
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {contatos.map((contato) => (
            <ContatoCard key={contato.id} contato={contato} onEditar={abrirEditar} onDeletar={handleDeletar} />
          ))}
        </div>
      )}

      {modal && (
        <Modal titulo={editandoId ? "Editar Contato" : "Novo Contato"} onClose={fecharModal}>
          <div className="flex flex-col gap-4">
            <Select label="Empresa *" name="empresa_id" options={empresaOpcoes} value={form.empresa_id} onChange={handleChange} />
            <Input label="Nome *" name="nome" placeholder="Ex: Joao Silva" value={form.nome} onChange={handleChange} />
            <Input label="Cargo" name="cargo" placeholder="Ex: CEO" value={form.cargo} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email" name="email" type="email" placeholder="joao@empresa.com" value={form.email} onChange={handleChange} />
              <Input label="Telefone" name="telefone" placeholder="(11) 99999-9999" value={form.telefone} onChange={handleChange} />
            </div>
            <Input label="LinkedIn" name="linkedin_url" placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={handleChange} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="contato_principal" checked={form.contato_principal} onChange={handleChange} className="w-4 h-4 accent-brand-accent" />
              <span className="text-sm text-gray-400">Contato principal</span>
            </label>

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
