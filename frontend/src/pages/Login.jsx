import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setMensagem('');

    try {
      // Ajustado para o prefixo real /api/v1/auth/login
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.erro || 'Credenciais inválidas');

      localStorage.setItem('token', data.token);
      setMensagem('Acesso autorizado! Sincronizando terminal...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setMensagem('');

    try {
      // Ajustado para o prefixo real /api/v1/auth/registrar (Rota pública)
      const response = await fetch('http://localhost:3000/api/v1/auth/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.erro || 'Erro ao registrar credenciais');

      setMensagem('Conta registrada! Verifique seu Gmail para confirmar sua identidade.');
      setTimeout(() => {
        setIsLogin(true);
        setMensagem('');
        setSenha('');
      }, 4000);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#181816] text-[#f8f7f7] min-h-screen flex items-center justify-center font-sans overflow-hidden relative w-full selection:bg-[#2ee638] selection:text-[#181816]">
      <div className="absolute w-[600px] h-[600px] bg-[#0f1a09] blur-[150px] rounded-full -top-20 -left-20 pointer-events-none opacity-80"></div>
      <div className="absolute w-[500px] h-[500px] bg-[#1e6018]/10 blur-[130px] rounded-full -bottom-20 -right-20 pointer-events-none opacity-90"></div>

      <div className="w-full max-w-md p-6 z-10">
        <div className="bg-[#181816]/95 border border-[#1e6018]/30 backdrop-blur-2xl rounded-2xl p-8 shadow-[0_0_50px_rgba(15,26,9,0.8)] transition-all duration-500 hover:border-[#60d02b]/40">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black tracking-[0.2em] bg-gradient-to-b from-[#f8f7f7] to-[#b4b4b4] bg-clip-text text-transparent">
              CORTEX<span className="text-[#2ee638] font-light">OS</span>
            </h1>
            <div className="h-[2px] w-12 bg-gradient-to-r from-[#2ee638] to-[#b0e454] mx-auto mt-3 rounded-full opacity-80"></div>
            <p className="text-[#b4b4b4] text-[10px] uppercase tracking-widest mt-4">
              {isLogin ? 'Painel de Autenticação' : 'Registrar Novo Operador'}
            </p>
          </div>

          {erro && <div className="mb-5 p-3.5 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl">{erro}</div>}
          {mensagem && <div className="mb-5 p-3.5 bg-[#0f1a09] border border-[#3cb031]/30 text-[#ecffd1] text-xs rounded-xl">{mensagem}</div>}

          <div>
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#b4b4b4] uppercase tracking-wider mb-2">Identificação / E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cortex.com"
                    className="w-full bg-[#181816] border border-[#1e6018]/40 rounded-xl px-4 py-3.5 text-[#f8f7f7] focus:outline-none focus:border-[#2ee638] focus:ring-1 focus:ring-[#2ee638]/30 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#b4b4b4] uppercase tracking-wider mb-2">Chave de Segurança</label>
                  <input
                    type="password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181816] border border-[#1e6018]/40 rounded-xl px-4 py-3.5 text-[#f8f7f7] focus:outline-none focus:border-[#2ee638] focus:ring-1 focus:ring-[#2ee638]/30 transition-all text-sm"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-[#3cb031] to-[#60d02b] hover:from-[#2ee638] hover:to-[#b0e454] text-[#181816] font-extrabold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(46,230,56,0.15)] transition-all duration-300 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-[#181816]/30 border-t-[#181816] rounded-full animate-spin"></div>}
                  <span>{loading ? 'Acessando...' : 'Entrar no Sistema'}</span>
                </button>
                
                <p className="text-center text-xs text-[#b4b4b4] pt-3">
                  Novo por aqui?{' '}
                  <button type="button" onClick={() => { setIsLogin(false); setErro(''); setMensagem(''); }} className="text-[#2ee638] font-medium hover:underline bg-transparent-none">
                    Criar conta corporativa
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleCadastro} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-[#b4b4b4] uppercase tracking-wider mb-2">Nome do Operador</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full bg-[#181816] border border-[#1e6018]/40 rounded-xl px-4 py-3.5 text-[#f8f7f7] focus:outline-none focus:border-[#60d02b] transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#b4b4b4] uppercase tracking-wider mb-2">E-mail Corporativo</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@gmail.com"
                    className="w-full bg-[#181816] border border-[#1e6018]/40 rounded-xl px-4 py-3.5 text-[#f8f7f7] focus:outline-none focus:border-[#60d02b] transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#b4b4b4] uppercase tracking-wider mb-2">Senha (Mín. 8 caracteres)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181816] border border-[#1e6018]/40 rounded-xl px-4 py-3.5 text-[#f8f7f7] focus:outline-none focus:border-[#60d02b] transition-all text-sm"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-[#1e6018] to-[#3cb031] hover:from-[#3cb031] hover:to-[#60d02b] text-[#f8f7f7] hover:text-[#181816] font-extrabold py-3.5 rounded-xl transition-all duration-300 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-[#f8f7f7]/30 border-t-[#f8f7f7] rounded-full animate-spin"></div>}
                  <span>{loading ? 'Processando...' : 'Efetuar Cadastro'}</span>
                </button>
                
                <p className="text-center text-xs text-[#b4b4b4] pt-3">
                  Já possui conta? {' '}
                  <button type="button" onClick={() => { setIsLogin(true); setErro(''); setMensagem(''); }} className="text-[#60d02b] font-medium hover:underline bg-transparent-none">
                    Voltar para o Login
                  </button>
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
