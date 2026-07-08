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
  const [filtro,setFiltro] = useState("todas");
  const [modal,setModal] = useState(false);
  const [form,setForm] = useState(formInicial);
  const [editandoId,setEditandoId] = useState(null);
  const [erro,setErro] = useState("");

  const { data: rawData = [], isLoading } = useQuery({ 
    queryKey: ["tarefas"], 
    queryFn: () => getTarefasGeral().then(r => r.data || r) 
  });
  const tarefas = Array.isArray(rawData) ? rawData : (rawData?.data || []);
  const { data:empresas=[] } = useQuery({ queryKey:["empresas"], queryFn:()=>getEmpresas().then(r=>r.data), staleTime:300000 });

  const criarM = useMutation({ mutationFn:(d)=>criarTarefa(d), onSuccess:()=>{queryClient.invalidateQueries({queryKey:["tarefas"]});fecharModal();}, onError:(e)=>setErro(e.response?.data?.erro||"Erro ao criar.") });
  const atualizarM = useMutation({ mutationFn:({id,d})=>atualizarTarefa(id,d), onSuccess:()=>{queryClient.invalidateQueries({queryKey:["tarefas"]});fecharModal();}, onError:(e)=>setErro(e.response?.data?.erro||"Erro ao atualizar.") });
  const deletarM = useMutation({ mutationFn:(id)=>deletarTarefa(id), onSuccess:()=>queryClient.invalidateQueries({queryKey:["tarefas"]}) });

  const filtradas = tarefas.filter(t=>filtro==="todas"?true:t.status===filtro);
  const empresaOpcoes = Array.isArray(empresas) ? empresas.map(e=>({value:e.id,label:e.nome_fantasia})) : [];
  const salvando = criarM.isPending||atualizarM.isPending;

  function handleChange(e){setForm(p=>({...p,[e.target.name]:e.target.value}));}
  function abrirCriar(){setEditandoId(null);setForm(formInicial);setErro("");setModal(true);}
  function abrirEditar(t){setEditandoId(t.id);setForm({titulo:t.titulo||"",descricao:t.descricao||"",empresa_id:t.empresa_id||"",prioridade:t.prioridade||"media",status:t.status||"pendente",data_vencimento:t.data_vencimento?t.data_vencimento.slice(0,16):""});setErro("");setModal(true);}
  function fecharModal(){setModal(false);setEditandoId(null);setForm(formInicial);setErro("");}
  
  function handleSalvar(){
    if(!form.titulo.trim()){setErro("Título obrigatório.");return;}
    if(!form.empresa_id){setErro("Selecione uma empresa.");return;}
    setErro("");
    editandoId ? atualizarM.mutate({id:editandoId, d:form}) : criarM.mutate(form);
  }

  function handleConcluir(t){
    atualizarM.mutate({id:t.id, d:{...t, status:t.status==="concluida"?"pendente":"concluida"}});
  }

  return (
    <div className="animate-fade-in p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cortex-text">Tarefas</h1>
        </div>
        <button onClick={abrirCriar} className="cortex-btn-primary flex items-center gap-2"><Plus size={16}/>Nova Tarefa</button>
      </div>

      <div className="flex gap-2 mb-6">
        {["todas","pendente","em_andamento","concluida"].map(s=>(
          <button key={s} onClick={()=>setFiltro(s)} className={"px-3 py-1.5 rounded-lg text-xs font-medium transition-colors "+(filtro===s?"bg-cortex-primary text-cortex-900":"bg-cortex-800 border border-cortex-border text-cortex-muted")}>
            {s==="todas"?"Todas":s.replace("_"," ")}
          </button>
        ))}
      </div>

      {isLoading ? <p>Carregando...</p> : (
        <div className="grid gap-2">
          {filtradas.map(t=>(
            <div key={t.id} className="cortex-card p-4 flex items-center gap-4">
              <button onClick={()=>handleConcluir(t)} className={"w-5 h-5 rounded-full border-2 "+(t.status==="concluida"?"bg-cortex-success border-cortex-success":"border-cortex-border")}/>
              <div className="flex-1"><p className="text-sm font-medium">{t.titulo}</p><p className="text-xs text-cortex-muted">{t.empresa_nome}</p></div>
              <div className="flex items-center gap-2">
                <button onClick={()=>abrirEditar(t)} className="p-1"><Pencil size={14}/></button>
                <button onClick={()=>deletarM.mutate(t.id)} className="p-1"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal titulo={editandoId?"Editar Tarefa":"Nova Tarefa"} onClose={fecharModal}>
          <div className="flex flex-col gap-4">
            <Input label="Título *" name="titulo" value={form.titulo} onChange={handleChange}/>
            <Select label="Empresa *" name="empresa_id" options={empresaOpcoes} value={form.empresa_id} onChange={handleChange}/>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Prioridade" name="prioridade" options={PRIORIDADES} value={form.prioridade} onChange={handleChange}/>
              <Select label="Status" name="status" options={STATUS_OPCOES} value={form.status} onChange={handleChange}/>
            </div>
            <Input label="Vencimento" name="data_vencimento" type="datetime-local" value={form.data_vencimento} onChange={handleChange}/>
            {erro && <p className="text-cortex-danger text-xs">{erro}</p>}
            <button onClick={handleSalvar} disabled={salvando} className="cortex-btn-primary w-full">{salvando?"Salvando...":"Salvar"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
