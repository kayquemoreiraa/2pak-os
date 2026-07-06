import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Building2, Users, CheckSquare,
  MessageSquare, Kanban, Bell, LogOut, User, Zap, Webhook,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/",          icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/empresas",    icon: Building2,       label: "Empresas"   },
  { to: "/contatos",    icon: Users,           label: "Contatos"   },
  { to: "/tarefas",     icon: CheckSquare,     label: "Tarefas"    },
  { to: "/pipeline",    icon: Kanban,          label: "Pipeline"   },
  { to: "/observacoes", icon: MessageSquare,   label: "Notas"      },
  { to: "/followup",    icon: Bell,            label: "Follow-up"  },
  { to: "/automacoes",  icon: Zap,             label: "Automacoes" },
  { to: "/webhooks",    icon: Webhook,         label: "Webhooks"   },
];

const corPapel = {
  admin:       "text-red-400",
  gestor:      "text-amber-400",
  sdr:         "text-blue-400",
  operacional: "text-cortex-muted",
};

export default function Sidebar() {
  const { usuario, logout } = useAuth();

  return (
    <aside className="w-60 min-h-screen bg-cortex-800 border-r border-cortex-border flex flex-col flex-shrink-0">
      <div className="px-6 py-5 border-b border-cortex-border">
        <span className="text-cortex-primary font-mono font-bold tracking-widest text-sm uppercase">
          Cortex OS
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors " +
              (isActive
                ? "bg-cortex-primary text-cortex-900 font-semibold"
                : "text-cortex-muted hover:text-cortex-text hover:bg-cortex-700")
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-cortex-border space-y-1">
        {usuario && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-cortex-700 border border-cortex-border mb-2">
            <div className="w-7 h-7 rounded-full bg-cortex-primary/20 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-cortex-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-cortex-text text-xs font-medium truncate">{usuario.nome}</p>
              <p className={"text-xs capitalize " + (corPapel[usuario.papel] || "text-cortex-subtle")}>
                {usuario.papel}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-cortex-muted hover:text-cortex-danger hover:bg-cortex-danger/10 transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>

        <p className="text-xs text-cortex-subtle font-mono px-3 pt-1">v0.4.0</p>
      </div>
    </aside>
  );
}

