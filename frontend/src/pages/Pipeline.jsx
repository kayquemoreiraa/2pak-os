import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Kanban } from "lucide-react";
import { getPipeline, moverEmpresa } from "../services/pipelineService";

function EmpresaCard({ empresa, onDragStart }) {
  return (
    <div draggable onDragStart={()=>onDragStart(empresa)}
      className="bg-cortex-700 border border-cortex-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-cortex-primary/40 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded bg-cortex-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-cortex-primary text-xs font-bold">{empresa.nome_fantasia.charAt(0).toUpperCase()}</span>
        </div>
        <p className="text-cortex-text text-sm font-medium truncate">{empresa.nome_fantasia}</p>
      </div>
      {empresa.segmento&&<p className="text-cortex-subtle text-xs pl-8">{empresa.segmento}</p>}
    </div>
  );
}

function Coluna({ status, empresas, onDrop, onDragOver, onDragStart }) {
  const [sobre,setSobre]=useState(false);
  return (
    <div onDragOver={e=>{e.preventDefault();setSobre(true);onDragOver(e);}} onDragLeave={()=>setSobre(false)} onDrop={()=>{setSobre(false);onDrop(status.id);}}
      className={"flex flex-col min-w-56 w-56 rounded-xl border-t-2 border border-cortex-border flex-shrink-0 transition-colors "+(sobre?"border-cortex-primary bg-cortex-primary/5":"bg-cortex-800")}
      style={{borderTopColor:status.cor_hex||"#60d02b"}}>
      <div className="px-4 py-3 border-b border-cortex-border">
        <div className="flex items-center justify-between">
          <p className="text-cortex-text text-sm font-semibold">{status.nome}</p>
          <span className="bg-cortex-700 text-cortex-muted text-xs px-2 py-0.5 rounded-full">{empresas.length}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-3 flex-1 min-h-32">
        {empresas.map(e=><EmpresaCard key={e.id} empresa={e} onDragStart={onDragStart}/>)}
        {empresas.length===0&&<div className="flex-1 flex items-center justify-center"><p className="text-cortex-subtle text-xs">Arraste aqui</p></div>}
      </div>
    </div>
  );
}

export default function Pipeline() {
  const queryClient = useQueryClient();
  const [arrastando,setArrastando]=useState(null);

  const { data:colunas=[], isLoading } = useQuery({ queryKey:["pipeline"], queryFn:()=>getPipeline().then(r=>r.data) });

  const moverM = useMutation({
    mutationFn:({empresa_id,status_id})=>moverEmpresa(empresa_id,status_id),
    onMutate:async({empresa_id,status_id})=>{
      await queryClient.cancelQueries({queryKey:["pipeline"]});
      const ant=queryClient.getQueryData(["pipeline"]);
      queryClient.setQueryData(["pipeline"],old=>old.map(col=>{
        if(col.id===arrastando?.status_atual_id) return {...col,empresas:col.empresas.filter(e=>e.id!==empresa_id)};
        if(col.id===status_id) return {...col,empresas:[...col.empresas,{...arrastando,status_atual_id:status_id}]};
        return col;
      }));
      return {ant};
    },
    onError:(_,__,ctx)=>queryClient.setQueryData(["pipeline"],ctx.ant),
    onSettled:()=>queryClient.invalidateQueries({queryKey:["pipeline"]}),
  });

  function handleDrop(statusId){
    if(!arrastando||arrastando.status_atual_id===statusId){setArrastando(null);return;}
    moverM.mutate({empresa_id:arrastando.id,status_id:statusId});
    setArrastando(null);
  }

  if(isLoading) return <p className="text-cortex-muted text-sm">Carregando...</p>;
  const total=colunas.flatMap(c=>c.empresas).length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cortex-text">Pipeline</h1>
          <p className="text-cortex-muted text-sm">Arraste as empresas entre as etapas</p>
        </div>
        <div className="flex items-center gap-2 text-cortex-muted text-sm">
          <Kanban size={16}/><span>{total} empresa{total!==1?"s":""} no funil</span>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {colunas.map(col=>(
          <Coluna key={col.id} status={col} empresas={col.empresas} onDragStart={setArrastando} onDragOver={e=>e.preventDefault()} onDrop={handleDrop}/>
        ))}
      </div>
    </div>
  );
}
