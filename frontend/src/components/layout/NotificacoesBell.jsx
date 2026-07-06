import { useEffect, useState, useRef } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { getNotificacoes, marcarLida, marcarTodasLidas } from "../../services/notificacaoService";

const iconesTipo = { empresa: "🏢", pipeline: "📊", tarefa: "✅", usuario: "👤", automacao: "⚡" };

export default function NotificacoesBell() {
  const [aberto, setAberto]         = useState(false);
  const [dados, setDados]           = useState({ nao_lidas: 0, notificacoes: [] });
  const [carregando, setCarregando] = useState(false);
  const ref                         = useRef(null);

  async function carregar() {
    setCarregando(true);
    try { const res = await getNotificacoes(); setDados(res.data); } catch (_) {}
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    const iv = setInterval(carregar, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    function fora(e) { if (ref.current && !ref.current.contains(e.target)) setAberto(false); }
    document.addEventListener("mousedown", fora);
    return () => document.removeEventListener("mousedown", fora);
  }, []);

  async function handleLida(id) {
    await marcarLida(id);
    setDados(p => ({
      ...p,
      nao_lidas: Math.max(0, p.nao_lidas - 1),
      notificacoes: p.notificacoes.map(n => n.id === id ? { ...n, lida: 1 } : n),
    }));
  }

  async function handleTodas() {
    await marcarTodasLidas();
    setDados(p => ({ nao_lidas: 0, notificacoes: p.notificacoes.map(n => ({ ...n, lida: 1 })) }));
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAberto(!aberto)}
        className="relative p-2 rounded-lg text-cortex-muted hover:text-cortex-text hover:bg-cortex-700 transition-colors">
        <Bell size={18} />
        {dados.nao_lidas > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-cortex-primary rounded-full animate-pulse-soft" />
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-10 w-80 bg-cortex-800 border border-cortex-border rounded-xl shadow-2xl z-50 animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-cortex-border">
            <div className="flex items-center gap-2">
              <h3 className="text-cortex-text font-semibold text-sm">Notificacoes</h3>
              {dados.nao_lidas > 0 && (
                <span className="bg-cortex-primary text-cortex-900 text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {dados.nao_lidas}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {dados.nao_lidas > 0 && (
                <button onClick={handleTodas} className="text-cortex-subtle hover:text-cortex-primary transition-colors">
                  <CheckCheck size={14} />
                </button>
              )}
              <button onClick={() => setAberto(false)} className="text-cortex-subtle hover:text-cortex-text transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {carregando && dados.notificacoes.length === 0 ? (
              <p className="text-cortex-subtle text-xs text-center py-8">Carregando...</p>
            ) : dados.notificacoes.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={24} className="mx-auto text-cortex-600 mb-2" />
                <p className="text-cortex-subtle text-xs">Nenhuma notificacao.</p>
              </div>
            ) : (
              dados.notificacoes.map(n => (
                <div key={n.id}
                  className={"flex items-start gap-3 px-4 py-3 border-b border-cortex-border last:border-0 transition-colors " + (n.lida ? "opacity-40" : "bg-cortex-primary/5")}>
                  <span className="text-base flex-shrink-0 mt-0.5">{iconesTipo[n.tipo] || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-cortex-text text-xs font-medium">{n.titulo}</p>
                    {n.mensagem && <p className="text-cortex-muted text-xs mt-0.5 truncate">{n.mensagem}</p>}
                    <p className="text-cortex-subtle text-xs mt-1">
                      {new Date(n.data_criacao).toLocaleDateString("pt-BR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })}
                    </p>
                  </div>
                  {!n.lida && (
                    <button onClick={() => handleLida(n.id)}
                      className="flex-shrink-0 p-1 rounded text-cortex-subtle hover:text-cortex-primary transition-colors">
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
