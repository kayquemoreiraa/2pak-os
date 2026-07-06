import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Mail, Phone, Star, Pencil, Trash2 } from "lucide-react";
import { getContatos, criarContato, atualizarContato, deletarContato } from "../services/contatoService";
import { getEmpresas } from "../services/empresaService";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const formInicial = { nome:"", cargo:"", email:"", telefone:"", linkedin_url:"", empresa_id:"", contato_principal:false };

function ContatoCard({ contato, onEditar, onDeletar }) {
  return (
    <div className="cortex-card p-5 flex items-center justify-between group hover:border-cortex-border-light transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-cortex-primary/10 flex items-center justify-center">
          <span className="text-cortex-primary font-bold text-sm">{contato.nome.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-cortex-text font-medium">{contato.nome}</p>
            {contato.contato_principal===1&&<Star size={12} className="text-cortex-warning fill-cortex-warning"/>}
          </div>
          <p className="text-cortex-subtle text-xs">{contato.cargo||"Sem cargo"}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {contato.email&&<a href={"mailto:"+contato.email} className="flex items-center gap-1 text-xs text-cortex-muted hover:text-cortex-primary transition-colors"><Mail size={12}/>{contato.email}</a>}
        {contato.telefone&&<a href={"tel:"+contato.telefone} className="flex items-center gap-1 text-xs text-cortex-muted hover:text-cortex-primary transition-colors"><Phone size={12}/>{contato.telefone}</a>}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={()=>onEditar(contato)} className="p-1.5 rounded-lg text-cortex-subtle hover:text-cortex-primary hover:bg-cortex-primary/10 transition-colors"><Pencil size={14}/></button>
          <button onClick={()=>onDeletar(contato.id)} className="p-1.5 rounded-lg text-cortex-subtle hover:text-cortex-danger hover:bg-cortex-danger/10 transition-colors"><Trash2 size={14}/></button>
        </div>
      </div>
    </div>
  );
}

export default function Contatos() {
  const queryClient = useQueryClient();
  const [empresaFiltro,setEmpresaFiltro] = useState("");
  const [modal,setModal]                 = useState(false);
  const [form,setForm]                   = useState(formInicial);
  const [editandoId,setEditandoId]       = useState(null);
  const [erro,setErro]                   = useState("");

  const { data:empresas=[] }              = useQuery({ queryKey:["empresas"], queryFn:()=>getEmpresas().then(r=>r.data), staleTime:300000 });
  const { data:contatos=[], isLoading }   = useQuery({ queryKey:["contatos",empresaFiltro], queryFn:()=>getContatos(empresaFiltro).then(r=>r.data), enabled:!!empresaFiltro });

  const criarM    = useMutation({ mutationFn:(d)=>criarContato(d),          onSuccess:()=>{queryClient.invalidateQueries({queryKey:["contatos"]});fecharModal();}, onError:(e)=>setErro(e.response?.data?.erro||"Erro.") });
  const atualizarM= useMutation({ mutationFn:({id,d})=>atualizarContato(id,d), onSuccess:()=>{queryClient.invalidateQueries({queryKey:["contatos"]});fecharModal();}, onError:(e)=>setErro(e.response?.data?.erro||"Erro.") });
  const deletarM  = useMutation({ mutationFn:(id)=>deletarContato(id),      onSuccess:()=>queryClient.invalidateQueries({queryKey:["contatos"]}) });

  const empresaOpcoes= empresas.map(e=>({value:e.id,label:e.nome_fantasia}));
  const salvando     = criarM.isPending||atualizarM.isPending;

  function handleChange(e){const v=e.target.type==="checkbox"?e.target.checked:e.target.value;setForm(p=>({...p,[e.target.name]:v}));}
  function abrirCriar(){setEditandoId(null);setForm(formInicial);setErro("");setModal(true);}
  function abrirEditar(c){setEditandoId(c.id);setForm({nome:c.nome||"",cargo:c.cargo||"",email:c.email||"",telefone:c.telefone||"",linkedin_url:c.linkedin_url||"",empresa_id:c.empresa_id||"",contato_principal:c.contato_principal===1});setErro("");setModal(true);}
  function fecharModal(){setModal(false);setEditandoId(null);setForm(formInicial);setErro("");}
  function handleSalvar(){
    if(!form.nome.trim()){setErro("Nome obrigatorio.");return;}
    if(!form.empresa_id){setErro("Selecione empresa.");return;}
    setErro("");
    editandoId?atualizarM.mutate({id:editandoId,d:form}):criarM.mutate(form);
  }
  function handleDeletar(id){if(!window.confirm("Remover contato?"))return;deletarM.mutate(id);}

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cortex-text">Contatos</h1>
          <p className="text-cortex-muted text-sm">Pessoas de contato nas empresas</p>
        </div>
        <button onClick={abrirCriar} className="cortex-btn-primary flex items-center gap-2"><Plus size={16}/>Novo Contato</button>
      </div>
      <div className="mb-6">
        <Select label="Filtrar por empresa" name="emp" options={empresaOpcoes} value={empresaFiltro} onChange={e=>setEmpresaFiltro(e.target.value)}/>
      </div>
      {!empresaFiltro?(
        <div className="text-center py-20"><Users size={40} className="mx-auto text-cortex-600 mb-3"/><p className="text-cortex-muted">Selecione uma empresa para ver os contatos.</p></div>
      ):isLoading?<p className="text-cortex-muted text-sm">Carregando...</p>
      :contatos.length===0?(
        <div className="text-center py-20"><Users size={40} className="mx-auto text-cortex-600 mb-3"/><p className="text-cortex-muted">Nenhum contato nesta empresa.</p><button onClick={abrirCriar} className="mt-4 text-cortex-primary text-sm hover:underline">Adicionar primeiro contato</button></div>
      ):(
        <div className="grid gap-2">{contatos.map(c=><ContatoCard key={c.id} contato={c} onEditar={abrirEditar} onDeletar={handleDeletar}/>)}</div>
      )}
      {modal&&(
        <Modal titulo={editandoId?"Editar Contato":"Novo Contato"} onClose={fecharModal}>
          <div className="flex flex-col gap-4">
            <Select label="Empresa *" name="empresa_id" options={empresaOpcoes} value={form.empresa_id} onChange={handleChange}/>
            <Input label="Nome *" name="nome" placeholder="Ex: Joao Silva" value={form.nome} onChange={handleChange}/>
            <Input label="Cargo" name="cargo" placeholder="Ex: CEO" value={form.cargo} onChange={handleChange}/>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email" name="email" type="email" placeholder="joao@empresa.com" value={form.email} onChange={handleChange}/>
              <Input label="Telefone" name="telefone" placeholder="(11) 99999-9999" value={form.telefone} onChange={handleChange}/>
            </div>
            <Input label="LinkedIn" name="linkedin_url" placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={handleChange}/>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="contato_principal" checked={form.contato_principal} onChange={handleChange} className="w-4 h-4 accent-cortex-primary"/>
              <span className="text-sm text-cortex-muted">Contato principal</span>
            </label>
            {erro&&<p className="text-cortex-danger text-xs">{erro}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={fecharModal} className="cortex-btn-ghost flex-1">Cancelar</button>
              <button onClick={handleSalvar} disabled={salvando} className="cortex-btn-primary flex-1 disabled:opacity-50">{salvando?"Salvando...":editandoId?"Atualizar":"Salvar"}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
