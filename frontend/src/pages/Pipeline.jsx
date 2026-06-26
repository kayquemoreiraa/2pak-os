import { useEffect, useState } from "react";
import { Kanban, Building2 } from "lucide-react";
import { getPipeline, moverEmpresa } from "../services/pipelineService";

function EmpresaCard({ empresa, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(empresa)}
      className="bg-brand-700 border border-surface-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-brand-accent transition-colors"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-brand-accent text-xs font-bold">
            {empresa.nome_fantasia.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-gray-100 text-sm font-medium truncate">{empresa.nome_fantasia}</p>
      </div>
      {empresa.segmento && (
        <p className="text-gray-500 text-xs pl-8">{empresa.segmento}</p>
      )}
    </div>
  );
}

function Coluna({ status, empresas, onDragOver, onDrop, onDragStart }) {
  const [sobre, setSobre] = useState(false);

  function handleDragOver(e) {
    e.preventDefault();
    setSobre(true);
    onDragOver(e);
  }

  function handleDragLeave() {
    setSobre(false);
  }

  function handleDrop(e) {
    setSobre(false);
    onDrop(status.id);
  }

  const corBorda = status.cor_hex || "#7c3aed";
  const bordaStyle = { borderTopColor: corBorda };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={"flex flex-col min-w-64 w-64 bg-surface-DEFAULT rounded-xl border-t-2 border border-surface-border transition-colors flex-shrink-0 " + (sobre ? "border-brand-accent bg-brand-800" : "")}
      style={bordaStyle}
    >
      <div className="px-4 py-3 border-b border-surface-border">
        <div className="flex items-center justify-between">
          <p className="text-gray-100 text-sm font-semibold">{status.nome}</p>
          <span className="bg-brand-600 text-gray-400 text-xs px-2 py-0.5 rounded-full">
            {empresas.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3 flex-1 min-h-32">
        {empresas.map((empresa) => (
          <EmpresaCard key={empresa.id} empresa={empresa} onDragStart={onDragStart} />
        ))}
        {empresas.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-700 text-xs">Arraste empresas aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Pipeline() {
  const [colunas, setColunas]       = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [arrastando, setArrastando] = useState(null);

  useEffect(() => {
    getPipeline().then((res) => {
      setColunas(res.data);
      setCarregando(false);
    });
  }, []);

  function handleDragStart(empresa) {
    setArrastando(empresa);
  }

  async function handleDrop(statusId) {
    if (!arrastando) return;
    if (arrastando.status_atual_id === statusId) { setArrastando(null); return; }

    try {
      await moverEmpresa(arrastando.id, statusId);
      setColunas((prev) =>
        prev.map((col) => {
          if (col.id === arrastando.status_atual_id) {
            return { ...col, empresas: col.empresas.filter((e) => e.id !== arrastando.id) };
          }
          if (col.id === statusId) {
            return { ...col, empresas: [...col.empresas, { ...arrastando, status_atual_id: statusId }] };
          }
          return col;
        })
      );
    } catch (err) {
      console.error("Erro ao mover empresa:", err);
    } finally {
      setArrastando(null);
    }
  }

  if (carregando) {
    return <p className="text-gray-500 text-sm">Carregando...</p>;
  }

  const semStatus = colunas.flatMap((c) => c.empresas).length;

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Pipeline</h1>
          <p className="text-gray-500 text-sm">Arraste as empresas entre as etapas do funil</p>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Kanban size={16} />
          <span>{semStatus} empresa{semStatus !== 1 ? "s" : ""} no funil</span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {colunas.map((col) => (
          <Coluna
            key={col.id}
            status={col}
            empresas={col.empresas}
            onDragStart={handleDragStart}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {arrastando && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-brand-accent text-white text-xs px-4 py-2 rounded-full shadow-lg">
          Soltando "{arrastando.nome_fantasia}" em uma coluna...
        </div>
      )}
    </div>
  );
}
