import { create } from "zustand";
import api from "../services/api";

// ?? Store atômica do Zustand: Alta performance sem re-renders inúteis na árvore do app
export const useAuthStore = create((set) => ({
  usuario: (() => {
    try {
      return JSON.parse(localStorage.getItem("cortex_usuario"));
    } catch (_) {
      return null;
    }
  })(),
  carregando: false,

  login: async (email, senha) => {
    const res = await api.post("/auth/login", { email, senha });
    
    // Armazenamento com a nova marca Córtex OS
    localStorage.setItem("cortex_token", res.data.token);
    localStorage.setItem("cortex_usuario", JSON.stringify(res.data.usuario));
    
    set({ usuario: res.data.usuario });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("cortex_token");
    localStorage.removeItem("cortex_usuario");
    set({ usuario: null });
    
    // Força o redirecionamento limpando o estado da memória
    window.location.href = "/login";
  },
}));

// ?? Hook de compatibilidade (Preserva as páginas de CRM atuais sem precisar refatorar o código delas)
export function useAuth() {
  const usuario = useAuthStore((state) => state.usuario);
  const carregando = useAuthStore((state) => state.carregando);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return { usuario, login, logout, carregando };
}

// Retorna um wrapper vazio caso seu App.jsx use o <AuthProvider> envolvendo as rotas
export function AuthProvider({ children }) {
  return <>{children}</>;
}


