import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageSquare, Pencil, Trash2, Check, X } from "lucide-react";
import { getObservacoes, criarObservacao, atualizarObservacao, deletarObservacao } from "../services/observacaoService";
import { getEmpresas } from "../services/empresaService";
import Select from "../components/ui/Select";

function NotaCard({ nota, onEditar, onDeletar }) {
  const [editando,setEditando]=useState(false);
  const [conteudo,setConteudo]=useState(nota.conteudo);
  async function salvar(){await onEditar(nota.id,conteudo);setEditando(false);}
  function cancelar(){setConteudo(nota.conteudo);setEditando(false);}
  const data=new Date(nota.data_criacao).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
  return (
    <div className="cortex-card p-5 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {editando?(
            <textarea value={conteudo} onChange={e=>setConteudo(e.target.value)} rows={3} autoFocus
              className="w-full bg-cortex-700 border border-cortex-primary/60 rounded-lg px-3 py-2 text-sm text-cortex-text resize-none focus:outline-none"/>
          ):(
            <p className="text-cortex-text text-sm leading-relaxed whitespace-pre-wrap">{nota.conteudo}</p>
          )}
          <p className="text-cortex-subtle text-xs mt-2">{data}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {editando?(
            <>
              <button onClick={salvar} className="p-1.5 rounded-lg text-cortex-success hover:bg-cortex-success/10 transition-colors"><Check size={14}/></button>
              <button onClick={cancelar} className="p-1.5 rounded-lg text-cortex-subtle hover:bg-cortex-700 transition-colors"><X size={14}/></button>
            </>
          ):(
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button onClick={()=>setEditando(true)} className="p-1.5 rounded-lg text-cortex-subtle hover:text-cortex-primary hover:bg-cortex-primary/10 transition-colors"><Pencil size={14}/></button>
              <button onClick={()=>onDeletar(nota.id)} className="p-1.5 rounded-lg text-cortex-subtle hover:text-cortex-danger hover:bg-cortex-danger/10 transition-colors"><Trash2 size={14}/></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Observacoes() {
  const queryClient = useQueryClient();
  const [empresaFiltro,setEmpresaFiltro]=useState("");
  const [novaNota,setNovaNota]=useState("");

  const { data:empresas=[] }            = useQuery({ queryKey:["empresas"], queryFn:()=>getEmpresas().then(r=>r.data), staleTime:300000 });
  const { data:notas=[], isLoading }    = useQuery({ queryKey:["observacoes",empresaFiltro], queryFn:()=>getObservacoes(empresaFiltro).then(r=>r.data), enabled:!!empresaFiltro });

  const criarM    = useMutation({ mutationFn:(d)=>criarObservacao(d),              onSuccess:()=>{queryClient.invalidateQueries({queryKey:["observacoes"]});setNovaNota("");} });
  const atualizarM= useMutation({ mutationFn:({id,c})=>atualizarObservacao(id,{conteudo:c}), onSuccess:()=>queryClient.invalidateQueries({queryKey:["observacoes"]}) });
  const deletarM  = useMutation({ mutationFn:(id)=>deletarObservacao(id),          onSuccess:()=>queryClient.invalidateQueries({queryKey:["observacoes"]}) });

  function handleDeletar(id){if(!window.confirm("Remover nota?"))return;deletarM.mutate(id);}

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-cortex-text">Notas</h1>
        <p className="text-cortex-muted text-sm">Observacoes sobre as empresas</p>
      </div>
      <div className="mb-6"><Select label="Selecionar empresa" name="emp" options={empresas.map(e=>({value:e.id,label:e.nome_fantasia}))} value={empresaFiltro} onChange={e=>setEmpresaFiltro(e.target.value)}/></div>
      {empresaFiltro&&(
        <div className="mb-6 cortex-card p-4">
          <textarea value={novaNota} onChange={e=>setNovaNota(e.target.value)} placeholder="Escreva uma observacao..." rows={3}
            className="w-full bg-transparent text-sm text-cortex-text placeholder-cortex-subtle resize-none focus:outline-none"/>
          <div className="flex justify-end mt-3">
            <button onClick={()=>{if(!novaNota.trim()||!empresaFiltro)return;criarM.mutate({conteudo:novaNota,empresa_id:empresaFiltro});}} disabled={criarM.isPending||!novaNota.trim()}
              className="cortex-btn-primary flex items-center gap-2 disabled:opacity-50"><Plus size={14}/>{criarM.isPending?"Salvando...":"Adicionar Nota"}</button>
          </div>
        </div>
      )}
      {!empresaFiltro?(
        <div className="text-center py-20"><MessageSquare size={40} className="mx-auto text-cortex-600 mb-3"/><p className="text-cortex-muted">Selecione uma empresa.</p></div>
      ):isLoading?<p className="text-cortex-muted text-sm">Carregando...</p>
      :notas.length===0?<div className="text-center py-12"><MessageSquare size={40} className="mx-auto text-cortex-600 mb-3"/><p className="text-cortex-muted">Nenhuma nota ainda.</p></div>
      :<div className="grid gap-2">{notas.map(n=><NotaCard key={n.id} nota={n} onEditar={(id,c)=>atualizarM.mutate({id,c})} onDeletar={handleDeletar}/>)}</div>}
    </div>
  );
}
