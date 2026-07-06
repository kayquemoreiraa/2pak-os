import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificacoesBell from "./NotificacoesBell";
import { useAuth } from "../../context/AuthContext";

export default function Layout() {
  const { usuario } = useAuth();
  return (
    <div className="flex min-h-screen bg-cortex-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-cortex-border bg-cortex-800 flex items-center justify-end px-6 gap-3 flex-shrink-0">
          <span className="text-cortex-subtle text-xs font-mono">{usuario?.email}</span>
          <NotificacoesBell />
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
