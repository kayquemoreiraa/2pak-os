import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Building2, Pencil, Trash2 } from "lucide-react";
import { getEmpresas, criarEmpresa, atualizarEmpresa, deletarEmpresa } from "../services/empresaService";
import { getStatus } from "../services/statusService";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const PORTES  = [{value:"micro",label:"Micro"},{value:"pequena",label:"Pequena"},{value:"media",label:"Media"},{value:"grande",label:"Grande"}];
const ORIGENS = [{value:"indicacao",label:"Indicacao"},{value:"inbound",label:"Inbound"},{value:"outbound",label:"Outbound"},{value:"evento",label:"Evento"},{value:"redes_sociais",label:"Redes Sociais"},{value:"google_maps",label:"Google Maps"}];
const formInicial = { nome_fantasia:"", razao_social:"", cnpj:"", segmento:"", porte:"", site:"", origem_lead:"", status_atual_id:"", telefone:"", endereco:"", cidade:"" };

export default function Empresas() {
  const queryClient = useQueryClient();
  const [busca, setBusca]            = useState("");
  const [modal, setModal]            = useState(false);
  const [form, setForm]              = useState(formInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro]              = useState("");

  const { data: empresas = [], isLoading }= useQuery({ queryKey:["empresas"], queryFn:()=>getEmpresas().then(r=>r.data) });
  const { data: status = [] }= useQuery({ queryKey:["status-prospeccao"], queryFn:()=>getStatus().then(r=>r.data),staleTime:600000 });

  const criarM    = useMutation({ mutationFn:(d)=>criarEmpresa(d),     onSuccess:()=>{queryClient.invalidateQueries({queryKey:["empresas"]});fecharModal();}, onError:(e)=>setErro(e.response?.data?.erro||"Erro ao criar.") });
  const atualizarM= useMutation({ mutationFn:({id,d})=>atualizarEmpresa(id,d), onSuccess:()=>{queryClient.invalidateQueries({queryKey:["empresas"]});fecharModal();}, onError:(e)=>setErro(e.response?.data?.erro||"Erro ao atualizar.") });
  const deletarM  = useMutation({ mutationFn:(id)=>deletarEmpresa(id),    onSuccess:()=>queryClient.invalidateQueries({queryKey:["empresas"]}) });

  const filtradas    = empresas.filter(e=>e.nome_fantasia.toLowerCase().includes(busca.toLowerCase()));
  const statusOpcoes = status.map(s=>({value:s.id,label:s.nome}));
  const salvando     = criarM.isPending || atualizarM.isPending;

  function handleChange(e) { setForm(p=>({...p,[e.target.name]:e.target.value})); }
  function abrirCriar() { setEditandoId(null); setForm(formInicial); setErro(""); setModal(true); }
  function abrirEditar(emp) { 
    setEditandoId(emp.id); 
    setForm({
      nome_fantasia: emp.nome_fantasia || "", razao_social: emp.razao_social || "",
      cnpj: emp.cnpj || "", segmento: emp.segmento || "", porte: emp.porte || "",
      site: emp.site || "", origem_lead: emp.origem_lead || "",
      status_atual_id: emp.status_atual_id || "", telefone: emp.telefone || "",
      endereco: emp.endereco || "", cidade: emp.cidade || ""
    }); 
    setErro(""); setModal(true); 
  }
  function fecharModal() { setModal(false); setEditandoId(null); setForm(formInicial); setErro(""); }
  function handleSalvar() {
    if (!form.nome_fantasia.trim()) { setErro("Nome fantasia e obrigatorio."); return; }
    setErro("");
    editandoId ? atualizarM.mutate({id:editandoId,d:form}) : criarM.mutate(form);
  }
  function handleDeletar(emp) { if (!window.confirm("Excluir "+emp.nome_fantasia+"?")) return; deletarM.mutate(emp.id); }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cortex-text">Empresas</h1>
          <p className="text-cortex-muted text-sm">Gerencie seus leads e clientes</p>
        </div>
        <button onClick={abrirCriar} className="cortex-btn-primary flex items-center gap-2">
          <Plus size={16} />Nova Empresa
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cortex-subtle" />
        <input type="text" placeholder="Buscar empresa..." value={busca} onChange={e=>setBusca(e.target.value)}
          className="cortex-input w-full pl-9" />
      </div>

      {isLoading ? <p className="text-cortex-muted text-sm">Carregando...</p>
      : filtradas.length === 0 ? (
        <div className="text-center py-20">
          <Building2 size={40} className="mx-auto text-cortex-600 mb-3" />
          <p className="text-cortex-muted">Nenhuma empresa encontrada.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {filtradas.map(emp=>(
            <div key={emp.id} className="cortex-card-hover p-5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-cortex-primary/10 flex items-center justify-center">
                  <span className="text-cortex-primary font-bold text-sm">{emp.nome_fantasia.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-cortex-text font-medium">{emp.nome_fantasia}</p>
                  <p className="text-cortex-subtle text-xs">{emp.telefone || "Sem telefone"} • {emp.cidade || "Cidade não informada"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {emp.origem_lead && <span className="cortex-badge-muted">{emp.origem_lead}</span>}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>abrirEditar(emp)} className="p-1.5 rounded-lg text-cortex-subtle hover:text-cortex-primary hover:bg-cortex-primary/10 transition-colors"><Pencil size={14}/></button>
                  <button onClick={()=>handleDeletar(emp)} className="p-1.5 rounded-lg text-cortex-subtle hover:text-cortex-danger hover:bg-cortex-danger/10 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal titulo={editandoId?"Editar Empresa":"Nova Empresa"} onClose={fecharModal}>
          <div className="flex flex-col gap-4">
            <Input label="Nome Fantasia *" name="nome_fantasia" placeholder="Ex: Cortex Web" value={form.nome_fantasia} onChange={handleChange}/>
            <Input label="Telefone" name="telefone" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleChange}/>
            <div className="grid grid-cols-2 gap-3">
              <Input label="CNPJ" name="cnpj" placeholder="00.000.000/0001-00" value={form.cnpj} onChange={handleChange}/>
              <Input label="Cidade" name="cidade" placeholder="Ex: São Paulo" value={form.cidade} onChange={handleChange}/>
            </div>
            <Input label="Endereço" name="endereco" placeholder="Ex: Rua das Flores, 123" value={form.endereco} onChange={handleChange}/>
            <Input label="Site" name="site" placeholder="https://www.site.com.br" value={form.site} onChange={handleChange}/>
            <Select label="Origem do Lead" name="origem_lead" options={ORIGENS} value={form.origem_lead} onChange={handleChange}/>
            <Select label="Status no Pipeline" name="status_atual_id" options={statusOpcoes} value={form.status_atual_id} onChange={handleChange}/>
            {erro && <p className="text-cortex-danger text-xs">{erro}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={fecharModal} className="cortex-btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSalvar} disabled={salvando} className="cortex-btn-primary flex-1">{salvando?"Salvando...":editandoId?"Atualizar":"Salvar"}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
