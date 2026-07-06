import { useQuery } from "@tanstack/react-query";
import { Bell, RefreshCw, Building2 } from "lucide-react";
import { getFollowup } from "../services/followupService";

const NIVEIS = [
  { key:"critico",    label:"Critico",    emoji:"🔴", cor:"border-cortex-danger  bg-cortex-danger/5",  badge:"bg-cortex-danger/20  text-cortex-danger",  min:11, max:Infinity },
  { key:"prioridade", label:"Prioridade", emoji:"🟠", cor:"border-orange-500 bg-orange-500/5", badge:"bg-orange-500/20 text-orange-400", min:6,  max:10      },
  { key:"atencao",    label:"Atencao",    emoji:"🟡", cor:"border-cortex-warning bg-cortex-warning/5", badge:"bg-cortex-warning/20 text-cortex-warning", min:3,  max:5       },
  { key:"em_dia",     label:"Em dia",     emoji:"🟢", cor:"border-cortex-success bg-cortex-success/5", badge:"bg-cortex-success/20 text-cortex-success", min:0,  max:2       },
];

function getNivel(dias){ return NIVEIS.find(n=>dias>=n.min&&dias<=n.max)||NIVEIS[0]; }

export default function Followup() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey:["followup"],
    queryFn: ()=>getFollowup(0).then(r=>r.data),
    refetchInterval: 60000,
  });

  const empresas = data?.empresas||[];
  const agrupadas = NIVEIS.map(n=>({ nivel:n, empresas:empresas.filter(e=>e.dias_sem_contato>=n.min&&e.dias_sem_contato<=n.max) }));
  const criticos  = agrupadas.find(g=>g.nivel.key==="critico")?.empresas.length||0;
  const prioridade= agrupadas.find(g=>g.nivel.key==="prioridade")?.empresas.length||0;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cortex-text">Follow-up</h1>
          <p className="text-cortex-muted text-sm">Empresas organizadas por urgencia de contato</p>
        </div>
        <button onClick={()=>refetch()} disabled={isFetching}
          className="cortex-btn-ghost flex items-center gap-2 disabled:opacity-50">
          <RefreshCw size={14} className={isFetching?"animate-spin":""}/>Atualizar
        </button>
      </div>

      {(criticos>0||prioridade>0)&&(
        <div className="flex items-center gap-2 bg-cortex-danger/10 border border-cortex-danger/30 rounded-lg px-4 py-3 mb-6">
          <Bell size={14} className="text-cortex-danger"/>
          <p className="text-cortex-danger text-sm">
            {criticos>0&&<span><strong>{criticos}</strong> empresa{criticos>1?"s":""} em status critico. </span>}
            {prioridade>0&&<span><strong>{prioridade}</strong> empresa{prioridade>1?"s":""} em prioridade.</span>}
          </p>
        </div>
      )}

      {isLoading?<p className="text-cortex-muted text-sm">Carregando...</p>
      :empresas.length===0?(
        <div className="text-center py-20"><Bell size={40} className="mx-auto text-cortex-600 mb-3"/><p className="text-cortex-muted">Nenhuma empresa cadastrada.</p></div>
      ):(
        <div className="space-y-8">
          {agrupadas.filter(g=>g.empresas.length>0).map(({nivel,empresas:emps})=>(
            <div key={nivel.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{nivel.emoji}</span>
                <h2 className="text-cortex-text font-semibold">{nivel.label}</h2>
                <span className="cortex-badge-muted">{emps.length}</span>
                <span className="text-cortex-subtle text-xs">{nivel.max===Infinity?nivel.min+"+ dias":nivel.min+"-"+nivel.max+" dias"} sem contato</span>
              </div>
              <div className="grid gap-2">
                {emps.map(emp=>{
                  const nv=getNivel(emp.dias_sem_contato);
                  return (
                    <div key={emp.id} className={"border rounded-xl p-4 flex items-center justify-between "+nv.cor}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-cortex-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 size={16} className="text-cortex-primary"/>
                        </div>
                        <div>
                          <p className="text-cortex-text font-medium text-sm">{emp.nome_fantasia}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {emp.segmento&&<span className="text-cortex-subtle text-xs">{emp.segmento}</span>}
                            {emp.status_atual&&<><span className="text-cortex-600 text-xs">·</span><span className="text-cortex-subtle text-xs">{emp.status_atual}</span></>}
                          </div>
                        </div>
                      </div>
                      <div className={"px-3 py-1.5 rounded-full text-xs font-semibold "+nv.badge}>
                        {emp.dias_sem_contato===0?"Hoje":emp.dias_sem_contato+(emp.dias_sem_contato===1?" dia":" dias")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
