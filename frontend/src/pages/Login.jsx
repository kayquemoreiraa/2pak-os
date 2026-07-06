import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login }   = useAuth();
  const [form, setForm]       = useState({ email: "", senha: "" });
  const [erro, setErro]       = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.senha) {
      setErro("Preencha email e senha.");
      return;
    }
    setCarregando(true);
    setErro("");
    try {
      await login(form.email, form.senha);
      window.location.href = "/";
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao fazer login.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="bg-cortex-dark text-cortex-light min-h-screen bg-brand-900 flex items-center justify-center p-4">
      <div className="bg-cortex-dark text-cortex-light w-full max-w-md">

        <div className="bg-cortex-dark text-cortex-light text-center mb-8">
          <span className="bg-cortex-dark text-cortex-light text-brand-accent font-mono font-bold tracking-widest text-2xl uppercase">
            Cortex OS
          </span>
          <p className="bg-cortex-dark text-cortex-light text-gray-500 text-sm mt-2">Sistema Operacional da Cortex Web</p>
        </div>

        <div className="bg-cortex-dark text-cortex-light bg-surface-raised border border-surface-border rounded-2xl p-8">
          <h1 className="bg-cortex-dark text-cortex-light text-gray-100 font-semibold text-lg mb-6">Entrar na plataforma</h1>

          <form onSubmit={handleSubmit} className="bg-cortex-dark text-cortex-light flex flex-col gap-4">
            <div className="bg-cortex-dark text-cortex-light flex flex-col gap-1">
              <label className="bg-cortex-dark text-cortex-light text-xs text-gray-400 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                autoFocus
                className="bg-cortex-dark text-cortex-light bg-brand-800 border border-surface-border rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>

            <div className="bg-cortex-dark text-cortex-light flex flex-col gap-1">
              <label className="bg-cortex-dark text-cortex-light text-xs text-gray-400 font-medium">Senha</label>
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-cortex-dark text-cortex-light bg-brand-800 border border-surface-border rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>

            {erro && (
              <p className="bg-cortex-dark text-cortex-light text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="bg-cortex-dark text-cortex-light mt-2 bg-brand-accent hover:bg-brand-hover text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="bg-cortex-dark text-cortex-light text-center text-gray-700 text-xs mt-6">
          Cortex OS v0.4.0
        </p>
      </div>
    </div>
  );
}







