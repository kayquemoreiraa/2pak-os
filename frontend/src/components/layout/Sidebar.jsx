import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  CheckSquare,
  MessageSquare,
  Kanban,
} from "lucide-react";

const navItems = [
  { to: "/",            icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/empresas",    icon: Building2,       label: "Empresas"   },
  { to: "/contatos",    icon: Users,           label: "Contatos"   },
  { to: "/tarefas",     icon: CheckSquare,     label: "Tarefas"    },
  { to: "/pipeline",    icon: Kanban,          label: "Pipeline"   },
  { to: "/observacoes", icon: MessageSquare,   label: "Notas"      },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-surface-DEFAULT border-r border-surface-border flex flex-col">
      <div className="px-6 py-5 border-b border-surface-border">
        <span className="text-brand-accent font-mono font-medium tracking-widest text-sm uppercase">
          2Pak OS
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-brand-accent text-white font-medium"
                  : "text-gray-400 hover:text-gray-100 hover:bg-surface-raised"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-surface-border">
        <p className="text-xs text-gray-600 font-mono">v0.1.0</p>
      </div>
    </aside>
  );
}
