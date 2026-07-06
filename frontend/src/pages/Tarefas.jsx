import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, CheckSquare, Clock, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { getTarefasGeral, criarTarefa, atualizarTarefa, deletarTarefa } from "../services/tarefaService";
import { getEmpresas } from "../services/empresaService";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const PRIORIDADES  = [{value:"baixa",label:"Baixa"},{value:"media",label:"Media"},{value:"alta",label:"Alta"}];
const STATUS_OPCOES= [{value:"pendente",label:"Pendente"},{value:"em_andamento",label:"Em Andamento"},{value:"concluida",label:"Concluida"},{value:"cancelada",label:"Cancelada"}];
const corPri = { alta:"text-cortex-danger", media:"text-cortex-warning", baixa:"text-cortex-success" };
const corSt  = { pendente:"bg-cortex-warning/10 text-cortex-warning", em_andamento:"bg-cortex-info/10 text-cortex-info", concluida:"bg-cortex-success/10 text-cortex-success", cancelada:"bg-cortex-600 text-cortex-muted" };
const formInicial = { titulo:"", descricao:"", empresa_id:"", prioridade:"media", status:"pendente", data_vencimento:"" };

export default function Tarefas() {
  const queryClient = useQueryClient();
  const [filtro,setFiltro]         = useState("todas");
  const [modal,setModal]           = useState(false);
  const [form,setForm]             = useState(formInicial);
  const [editandoId,setEditandoId] = useState(null);
  const [erro,setErro]             = useState("");

  const { data:tarefas=[], isLoading } = useQuery({ queryKey:["tarefas"], queryFn:()=>getTarefasGeral().then(r=>r.data) });
  const { data:empresas=[] }           = useQuery({ queryKey:["empresas"], queryFn:()=>getEmpresas().then(r=>r.data), staleTime:300000 });

  const criarM    = useMutation({ mutationFn:(d)=>criarTarefa(d),          onSuccess:()=>{queryClient.invalidateQueries({queryKey:["tarefas"]});fecharModal();}, onError:(e)=>setErro(e.response?.data?.erro||"Erro.") });
  const atualizarM= useMutation({ mutationFn:({id,d})=>atualizarTarefa(id,d), onSuccess:()=>{queryClient.invalidateQueries({queryKey:["tarefas"]});fecharModal();}, onError:(e)=>setErro(e.response?.data?.erro||"Erro.") });
  const deletarM  = useMutation({ mutationFn:(id)=>deletarTarefa(id),      onSuccess:()=>queryClient.invalidateQueries({queryKey:["tarefas"]}) });

  const filtradas    = tarefas.filter(t=>filtro==="todas"?true:t.status===filtro);
  const empresaOpcoes= empresas.map(e=>({value:e.id,label:e.nome_fantasia}));
  const salvando     = criarM.isPending||atualizarM.isPending;

  function handleChange(e){setForm(p=>({...p,[e.target.name]:e.target.value}));}
  function abrirCriar(){setEditandoId(null);setForm(formInicial);setErro("");setModal(true);}
  function abrirEditar(t){setEditandoId(t.id);setForm({titulo:t.titulo||"",descricao:t.descricao||"",empresa_id:t.empresa_id||"",prioridade:t.prioridade||"media",status:t.status||"pendente",data_vencimento:t.data_vencimento?t.data_vencimento.slice(0,16):""});setErro("");setModal(true);}
  function fecharModal(){setModal(false);setEditandoId(null);setForm(formInicial);setErro("");}
  function handleSalvar(){
    if(!form.titulo.trim()){setErro("Titulo obrigatorio.");return;}
    if(!form.empresa_id){setErro("Selecione uma empresa.");return;}
    setErro("");
    editandoId?atualizarM.mutate({id:editandoId,d:form}):criarM.mutate(form);
  }
  function handleConcluir(t){
    atualizarM.mutate({id:t.id,d:{titulo:t.titulo,descricao:t.descricao,prioridade:t.prioridade,status:t.status==="concluida"?"pendente":"concluida",data_vencimento:t.data_vencimento,contato_id:t.contato_id,empresa_id:t.empresa_id}});
  }
  function handleDeletar(t){if(!window.confirm("Excluir: "+t.titulo+"?"))return;deletarM.mutate(t.id);}

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cortex-text">Tarefas</h1>
          <p className="text-cortex-muted text-sm">Acompanhe as acoes do time</p>
        </div>
        <button onClick={abrirCriar} className="cortex-btn-primary flex items-center gap-2"><Plus size={16}/>Nova Tarefa</button>
      </div>

      <div className="flex gap-2 mb-6">
        {["todas","pendente","em_andamento","concluida"].map(s=>(
          <button key={s} onClick={()=>setFiltro(s)}
            className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors "+(filtro===s?"bg-cortex-primary text-cortex-900":"bg-cortex-800 border border-cortex-border text-cortex-muted hover:text-cortex-text")}>
            {s==="todas"?"Todas":s.replace("_"," ")}
          </button>
        ))}
      </div>

      {isLoading?<p className="text-cortex-muted text-sm">Carregando...</p>
      :filtradas.length===0?(
        <div className="text-center py-20">
          <CheckSquare size={40} className="mx-auto text-cortex-600 mb-3"/>
          <p className="text-cortex-muted">Nenhuma tarefa encontrada.</p>
        </div>
      ):(
        <div className="grid gap-2">
          {filtradas.map(t=>(
            <div key={t.id} className="cortex-card p-5 flex items-center gap-4 group hover:border-cortex-border-light transition-colors">
              <button onClick={()=>handleConcluir(t)}
                className={"w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors "+(t.status==="concluida"?"bg-cortex-success border-cortex-success":"border-cortex-border hover:border-cortex-primary")}/>
              <div className="flex-1 min-w-0">
                <p className={"text-sm font-medium "+(t.status==="concluida"?"line-through text-cortex-subtle":"text-cortex-text")}>{t.titulo}</p>
                <p className="text-xs text-cortex-subtle mt-0.5">{t.empresa_nome}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {t.data_vencimento&&<span className="flex items-center gap-1 text-xs text-cortex-subtle"><Clock size={12}/>{new Date(t.data_vencimento).toLocaleDateString("pt-BR")}</span>}
                <span className={"flex items-center gap-1 text-xs font-medium "+corPri[t.prioridade]}><AlertCircle size={12}/>{t.prioridade}</span>
                <span className={"text-xs px-2 py-1 rounded-full font-medium "+corSt[t.status]}>{t.status.replace("_"," ")}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>abrirEditar(t)} className="p-1.5 rounded-lg text-cortex-subtle hover:text-cortex-primary hover:bg-cortex-primary/10 transition-colors"><Pencil size={14}/></button>
                  <button onClick={()=>handleDeletar(t)} className="p-1.5 rounded-lg text-cortex-subtle hover:text-cortex-danger hover:bg-cortex-danger/10 transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal&&(
        <Modal titulo={editandoId?"Editar Tarefa":"Nova Tarefa"} onClose={fecharModal}>
          <div className="flex flex-col gap-4">
            <Input label="Titulo *" name="titulo" placeholder="Ex: Enviar proposta" value={form.titulo} onChange={handleChange}/>
            <Input label="Descricao" name="descricao" placeholder="Detalhes..." value={form.descricao} onChange={handleChange}/>
            <Select label="Empresa *" name="empresa_id" options={empresaOpcoes} value={form.empresa_id} onChange={handleChange}/>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Prioridade" name="prioridade" options={PRIORIDADES} value={form.prioridade} onChange={handleChange}/>
              <Select label="Status" name="status" options={STATUS_OPCOES} value={form.status} onChange={handleChange}/>
            </div>
            <Input label="Data de Vencimento" name="data_vencimento" type="datetime-local" value={form.data_vencimento} onChange={handleChange}/>
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
